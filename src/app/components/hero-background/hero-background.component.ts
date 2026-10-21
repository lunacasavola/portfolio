import { Component, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import type * as THREE from 'three';

interface ShapeData {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  basePosition: THREE.Vector3;
  baseOpacity: number;
  spin: THREE.Vector3;       // accumulated self-rotation
  spinSpeed: THREE.Vector3;  // radians per second
  hover: number;             // 0..1, eased hover amount
  useLightColor: boolean;
}

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-background.component.html',
  styleUrl: './hero-background.component.css'
})
export class HeroBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: false }) canvasContainer?: ElementRef<HTMLDivElement>;

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private animationId?: number;
  private shapes: ShapeData[] = [];
  private three?: typeof import('three');
  private raycaster?: THREE.Raycaster;
  private destroyed = false;
  private lastFrame = 0;
  private elapsed = 0;

  // Pointer state: target values come from events, current values are eased every frame
  private pointer = { x: 0, y: 0 };
  private targetPointer = { x: 0, y: 0 };
  private pointerActive = false;
  private pulse = 0;

  private isVisible = true;
  private reducedMotion = false;
  private visibilityObserver?: IntersectionObserver;
  private colorObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  // Dynamic color palette - updated from CSS variables
  private accent = '#00ff41';
  private accentLight = 'rgb(77, 255, 122)';

  private readonly onPointerMove = (event: PointerEvent) => {
    this.targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pointerActive = true;
  };

  private readonly onPointerDown = () => {
    this.pulse = 1;
  };

  private readonly onPointerLeave = () => {
    this.pointerActive = false;
    this.targetPointer.x = 0;
    this.targetPointer.y = 0;
  };

  private readonly onVisibilityChange = () => this.updateLoop();

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.updateColorsFromCSS();

    // Everything below runs per frame or per pointer event and never touches
    // Angular state, so keep it out of change detection
    this.zone.runOutsideAngular(async () => {
      // Three.js is loaded on demand so it stays out of the initial bundle
      try {
        this.three = await import('three');
      } catch {
        return;
      }
      if (!this.destroyed) this.initThreeJS();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cleanup();
  }

  private updateColorsFromCSS(): void {
    const styles = getComputedStyle(document.documentElement);
    this.accent = (styles.getPropertyValue('--accent').trim() || '#00ff41');
    this.accentLight = (styles.getPropertyValue('--accent-light').trim() || 'rgb(77, 255, 122)');
    this.shapes.forEach(s => s.material.color.set(s.useLightColor ? this.accentLight : this.accent));
  }

  private initThreeJS(): void {
    const container = this.canvasContainer?.nativeElement;
    const T = this.three;
    if (!container || !T) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    try {
      this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      // WebGL not available: the page still works without the 3D background
      return;
    }

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.z = 6;
    this.raycaster = new T.Raycaster();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.createGeometries();
    this.layoutShapes(width / height);

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.colorObserver = new MutationObserver(() => {
      this.updateColorsFromCSS();
      if (this.reducedMotion) this.render(0);
    });
    this.colorObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // Pause rendering while the hero is scrolled out of view
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      this.updateLoop();
    });
    this.visibilityObserver.observe(container);

    if (this.reducedMotion) {
      this.render(0);
    } else {
      this.updateLoop();
    }
  }

  private createGeometries(): void {
    const T = this.three;
    if (!this.scene || !T) return;

    const defs: Array<{ geometry: THREE.BufferGeometry; position: [number, number, number]; opacity: number; light: boolean }> = [
      { geometry: new T.OctahedronGeometry(1.4, 0), position: [-3.6, 1.4, -2], opacity: 0.4, light: false },
      { geometry: new T.TorusGeometry(1.1, 0.35, 6, 16), position: [3.6, -1.3, -1.5], opacity: 0.3, light: false },
      { geometry: new T.IcosahedronGeometry(1.3, 0), position: [0.6, 0.4, -4], opacity: 0.25, light: true },
      { geometry: new T.TetrahedronGeometry(0.9, 0), position: [-2.4, -2, -1.5], opacity: 0.35, light: false },
      { geometry: new T.BoxGeometry(1.4, 1.4, 1.4), position: [2.8, 2, -2.5], opacity: 0.3, light: true }
    ];

    defs.forEach((def, index) => {
      const material = new T.MeshBasicMaterial({
        color: def.light ? this.accentLight : this.accent,
        wireframe: true,
        transparent: true,
        opacity: def.opacity,
        depthWrite: false
      });
      const mesh = new T.Mesh(def.geometry, material);
      mesh.position.set(...def.position);
      this.scene!.add(mesh);

      const dir = index % 2 === 0 ? 1 : -1;
      this.shapes.push({
        mesh,
        material,
        basePosition: mesh.position.clone(),
        baseOpacity: def.opacity,
        spin: new T.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        spinSpeed: new T.Vector3(0.12 * dir, 0.18 * -dir, 0.06 * dir),
        hover: 0,
        useLightColor: def.light
      });
    });
  }

  /** Pull shapes toward the center on narrow screens so they stay in frame */
  private layoutShapes(aspect: number): void {
    const spread = Math.min(1, Math.max(0.45, aspect / 1.6));
    this.shapes.forEach((s, i) => {
      const original = (s.mesh.userData['origin'] as THREE.Vector3) ?? s.basePosition.clone();
      s.mesh.userData['origin'] = original;
      s.basePosition.set(original.x * spread, original.y, original.z);
      s.mesh.scale.setScalar(aspect < 1 ? 0.75 : 1);
      s.mesh.userData['baseScale'] = aspect < 1 ? 0.75 : 1;
      if (i === 2 && aspect < 1) s.basePosition.y = -0.6;
    });
  }

  private updateLoop(): void {
    const shouldRun = this.isVisible && !document.hidden && !this.reducedMotion && !!this.renderer;
    if (shouldRun && this.animationId === undefined) {
      this.lastFrame = performance.now(); // discard time spent paused
      const loop = () => {
        this.animationId = requestAnimationFrame(loop);
        const now = performance.now();
        this.render(Math.min((now - this.lastFrame) / 1000, 0.05));
        this.lastFrame = now;
      };
      this.animationId = requestAnimationFrame(loop);
    } else if (!shouldRun && this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  private render(dt: number): void {
    if (!this.scene || !this.camera || !this.renderer || !this.raycaster) return;

    this.elapsed += dt;
    const t = this.elapsed;
    // Frame-rate independent easing factor
    const ease = (speed: number) => 1 - Math.exp(-speed * dt);

    const k = ease(3);
    this.pointer.x += (this.targetPointer.x - this.pointer.x) * k;
    this.pointer.y += (this.targetPointer.y - this.pointer.y) * k;
    this.pulse = Math.max(0, this.pulse - dt * 1.6);

    // Gentle camera drift following the pointer
    this.camera.position.x = this.pointer.x * 0.6;
    this.camera.position.y = this.pointer.y * 0.4;
    this.camera.lookAt(0, 0, -2);

    // Hover detection
    let hovered: THREE.Object3D | undefined;
    if (this.pointerActive) {
      this.raycaster.setFromCamera(this.pointer as THREE.Vector2, this.camera);
      hovered = this.raycaster.intersectObjects(this.shapes.map(s => s.mesh), false)[0]?.object;
    }

    this.shapes.forEach((s, index) => {
      const mesh = s.mesh;

      // Self rotation (accumulated) + hover spins a bit faster
      const spinBoost = 1 + s.hover * 2.5;
      s.spin.x += s.spinSpeed.x * dt * spinBoost;
      s.spin.y += s.spinSpeed.y * dt * spinBoost;
      s.spin.z += s.spinSpeed.z * dt * spinBoost;

      // Pointer tilt is applied on top, never accumulated
      mesh.rotation.set(
        s.spin.x + this.pointer.y * 0.35,
        s.spin.y + this.pointer.x * 0.35,
        s.spin.z
      );

      // Slow floating orbit around the base position
      const phase = index * 1.7;
      mesh.position.set(
        s.basePosition.x + Math.cos(t * 0.25 + phase) * 0.35 + this.pointer.x * 0.25 * (index % 2 ? -1 : 1),
        s.basePosition.y + Math.sin(t * 0.32 + phase) * 0.3 + this.pointer.y * 0.2,
        s.basePosition.z + Math.sin(t * 0.2 + phase) * 0.4
      );

      // Ease hover in/out instead of snapping
      s.hover += ((mesh === hovered ? 1 : 0) - s.hover) * ease(8);

      const pulseWave = this.pulse > 0 ? Math.sin((1 - this.pulse) * Math.PI) * 0.12 * this.pulse : 0;
      const baseScale = (mesh.userData['baseScale'] as number) ?? 1;
      mesh.scale.setScalar(baseScale * (1 + s.hover * 0.15 + pulseWave));
      s.material.opacity = s.baseOpacity + (0.95 - s.baseOpacity) * s.hover;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const container = this.canvasContainer?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.layoutShapes(width / height);
    if (this.reducedMotion) this.render(0);
  }

  private cleanup(): void {
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.colorObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();

    this.shapes.forEach(s => {
      s.mesh.geometry.dispose();
      s.material.dispose();
    });
    this.shapes = [];

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}
