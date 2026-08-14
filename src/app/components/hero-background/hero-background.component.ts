import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-background.component.html',
  styleUrl: './hero-background.component.css'
})
export class HeroBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: false }) canvasContainer?: ElementRef<HTMLDivElement>;

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private animationId?: number;
  private geometries: THREE.Mesh[] = [];
  private geometryData: Array<{ mesh: THREE.Mesh; baseScale: number; basePosition: THREE.Vector3; material: THREE.MeshBasicMaterial }> = [];
  private raycaster?: THREE.Raycaster;
  private mouse = new THREE.Vector2();
  private mouseX = 0;
  private mouseY = 0;
  private targetRotationX = 0;
  private targetRotationY = 0;
  private currentRotationX = 0;
  private currentRotationY = 0;
  private targetCameraZ = 5;
  private currentCameraZ = 5;
  private isMouseDown = false;
  private clickPulseTime = 0;

  // Dynamic color palette - will be updated from CSS variables
  private matrixGreen = new THREE.Color(0x00ff41);
  private matrixGreenDark = new THREE.Color(0x00cc33);
  private matrixGreenLight = new THREE.Color(0x33ff66);

  private updateColorsFromCSS(): void {
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff41';
    const accentLight = getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim() || 'rgb(51, 255, 102)';
    const accentDark = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark').trim() || 'rgb(0, 204, 51)';
    
    this.matrixGreen = new THREE.Color(accentColor);
    this.matrixGreenLight = new THREE.Color(accentLight);
    this.matrixGreenDark = new THREE.Color(accentDark);
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.updateColorsFromCSS();
    this.initThreeJS();
    // handleResize will be called after init
    
    // Listen for color changes
    const observer = new MutationObserver(() => {
      this.updateColorsFromCSS();
      this.updateMaterials();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.handleResize();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // Normalize mouse coordinates to -1 to 1 range
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update Three.js mouse vector for raycasting
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // More pronounced rotation based on mouse position
    this.targetRotationX = this.mouseY * 0.3;
    this.targetRotationY = this.mouseX * 0.3;
    
    // Camera zoom based on mouse position (zoom in when mouse is in center)
    const distanceFromCenter = Math.sqrt(this.mouseX * this.mouseX + this.mouseY * this.mouseY);
    this.targetCameraZ = 5 - distanceFromCenter * 1.5; // Zoom in when mouse is away from center
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.clickPulseTime = Date.now();
    
    // Create pulse effect on click
    if (this.geometryData.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.geometryData.length);
      const data = this.geometryData[randomIndex];
      // Temporarily increase scale
      data.mesh.scale.multiplyScalar(1.3);
      setTimeout(() => {
        data.mesh.scale.divideScalar(1.3);
      }, 200);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
      
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      
      this.targetRotationX = this.mouseY * 0.3;
      this.targetRotationY = this.mouseX * 0.3;
      
      const distanceFromCenter = Math.sqrt(this.mouseX * this.mouseX + this.mouseY * this.mouseY);
      this.targetCameraZ = 5 - distanceFromCenter * 1.5;
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.isMouseDown = true;
    this.clickPulseTime = Date.now();
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.isMouseDown = false;
  }

  private initThreeJS(): void {
    const container = this.canvasContainer?.nativeElement;
    if (!container) {
      console.warn('HeroBackground: Container not found');
      return;
    }

    // Wait for container to have dimensions
    setTimeout(() => {
      if (!container) {
        console.warn('HeroBackground: Container lost during initialization');
        return;
      }

      try {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background to show grid pattern

        // Camera setup
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        
        if (width === 0 || height === 0) {
          console.warn('HeroBackground: Container has zero dimensions, retrying...');
          setTimeout(() => this.initThreeJS(), 200);
          return;
        }
        
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        this.renderer.setClearColor(0x000000, 0); // Transparent background
        container.appendChild(this.renderer.domElement);

        // Initialize raycaster for hover detection
        this.raycaster = new THREE.Raycaster();

        // Create geometries
        this.createGeometries();

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(this.matrixGreen, 0.3);
        this.scene.add(ambientLight);
        (ambientLight as any).userData.isDynamic = true;

        // Add point lights for glow effect
        const pointLight1 = new THREE.PointLight(this.matrixGreen, 0.5, 10);
        pointLight1.position.set(2, 2, 2);
        this.scene.add(pointLight1);
        (pointLight1 as any).userData.isDynamic = true;

        const pointLight2 = new THREE.PointLight(this.matrixGreenLight, 0.3, 10);
        pointLight2.position.set(-2, -2, 2);
        this.scene.add(pointLight2);
        (pointLight2 as any).userData.isDynamic = true;

        // Start animation loop after everything is initialized
        this.animate();
        this.handleResize();
        console.log('HeroBackground: Three.js scene initialized successfully');
      } catch (error) {
        console.error('HeroBackground: Error initializing Three.js:', error);
      }
    }, 100);
  }

  private updateMaterials(): void {
    this.geometryData.forEach((data, idx) => {
      if (idx < 2) {
        data.material.color = this.matrixGreen;
      } else {
        data.material.color = this.matrixGreenLight;
      }
    });

    // Update lights
    if (this.scene) {
      this.scene.traverse((object) => {
        if ((object as any).userData?.isDynamic) {
          if (object instanceof THREE.AmbientLight || (object instanceof THREE.PointLight && object.position.x > 0)) {
            object.color = this.matrixGreen;
          } else if (object instanceof THREE.PointLight) {
            object.color = this.matrixGreenLight;
          }
        }
      });
    }
  }

  private createGeometries(): void {
    if (!this.scene) return;

    // Create wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: this.matrixGreen,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.matrixGreenLight,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    // Geometry 1: Octahedron (larger)
    const octaGeometry = new THREE.OctahedronGeometry(1.5, 0);
    const octaMaterial = wireframeMaterial.clone();
    const octaMesh = new THREE.Mesh(octaGeometry, octaMaterial);
    octaMesh.position.set(-3, 1.5, -2);
    octaMesh.rotation.set(0.5, 0.3, 0);
    this.scene.add(octaMesh);
    this.geometries.push(octaMesh);
    this.geometryData.push({
      mesh: octaMesh,
      baseScale: 1,
      basePosition: octaMesh.position.clone(),
      material: octaMaterial
    });

    // Geometry 2: Torus (larger)
    const torusGeometry = new THREE.TorusGeometry(1.2, 0.4, 8, 16);
    const torusMaterial = wireframeMaterial.clone();
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.position.set(3, -1.5, -1);
    torusMesh.rotation.set(0.2, 0.5, 0);
    this.scene.add(torusMesh);
    this.geometries.push(torusMesh);
    this.geometryData.push({
      mesh: torusMesh,
      baseScale: 1,
      basePosition: torusMesh.position.clone(),
      material: torusMaterial
    });

    // Geometry 3: Icosahedron (larger)
    const icoGeometry = new THREE.IcosahedronGeometry(1.4, 0);
    const icoMaterial = glowMaterial.clone();
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    icoMesh.position.set(0, 0, -3);
    icoMesh.rotation.set(0.3, 0.2, 0.1);
    this.scene.add(icoMesh);
    this.geometries.push(icoMesh);
    this.geometryData.push({
      mesh: icoMesh,
      baseScale: 1,
      basePosition: icoMesh.position.clone(),
      material: icoMaterial
    });

    // Geometry 4: Tetrahedron (larger)
    const tetraGeometry = new THREE.TetrahedronGeometry(1.0, 0);
    const tetraMaterial = wireframeMaterial.clone();
    const tetraMesh = new THREE.Mesh(tetraGeometry, tetraMaterial);
    tetraMesh.position.set(-2.5, -2, -2.5);
    tetraMesh.rotation.set(0.4, 0.6, 0.2);
    this.scene.add(tetraMesh);
    this.geometries.push(tetraMesh);
    this.geometryData.push({
      mesh: tetraMesh,
      baseScale: 1,
      basePosition: tetraMesh.position.clone(),
      material: tetraMaterial
    });

    // Geometry 5: Box (larger)
    const boxGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const boxMaterial = glowMaterial.clone();
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(2.5, 2, -1.5);
    boxMesh.rotation.set(0.6, 0.4, 0.3);
    this.scene.add(boxMesh);
    this.geometries.push(boxMesh);
    this.geometryData.push({
      mesh: boxMesh,
      baseScale: 1,
      basePosition: boxMesh.position.clone(),
      material: boxMaterial
    });
  }

  private animate(): void {
    if (!this.scene || !this.camera || !this.renderer || !this.raycaster) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    // Smooth interpolation for mouse rotation
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
    
    // Smooth camera zoom
    this.currentCameraZ += (this.targetCameraZ - this.currentCameraZ) * 0.05;
    this.camera.position.z = this.currentCameraZ;

    // Update raycaster for hover detection
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Rotate geometries
    const time = Date.now() * 0.001;
    const intersects = this.raycaster.intersectObjects(this.geometries);
    
    // Reset all geometries to base state
    this.geometryData.forEach((data, idx) => {
      // First two geometries use wireframeMaterial (0.6), others use glowMaterial (0.3)
      const baseOpacity = idx < 2 ? 0.6 : 0.3;
      data.material.opacity = baseOpacity;
      data.mesh.scale.setScalar(data.baseScale);
    });

    // Highlight intersected geometry
    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const geometryData = this.geometryData.find(d => d.mesh === intersectedMesh);
      if (geometryData) {
        geometryData.material.opacity = 1;
        geometryData.mesh.scale.setScalar(geometryData.baseScale * 1.2);
      }
    }
    
    this.geometryData.forEach((data, index) => {
      const mesh = data.mesh;
      
      // Faster, more noticeable rotation
      mesh.rotation.x += 0.004 * (index % 2 === 0 ? 1 : -1);
      mesh.rotation.y += 0.005 * (index % 3 === 0 ? 1 : -1);
      mesh.rotation.z += 0.003 * (index % 2 === 0 ? 1 : -1);

      // Enhanced parallax based on mouse position
      const parallaxX = this.currentRotationX * 0.5;
      const parallaxY = this.currentRotationY * 0.5;
      mesh.rotation.x += parallaxX;
      mesh.rotation.y += parallaxY;

      // Position parallax - geometries move more based on mouse
      const offsetX = this.mouseX * 0.5 * (index % 2 === 0 ? 1 : -1);
      const offsetY = this.mouseY * 0.5 * (index % 3 === 0 ? 1 : -1);
      
      // Orbital movement - shapes orbit around their base position
      const orbitRadius = 0.8 + index * 0.2;
      const orbitSpeed = 0.3 + index * 0.1;
      const orbitX = Math.cos(time * orbitSpeed + index) * orbitRadius;
      const orbitY = Math.sin(time * orbitSpeed * 1.3 + index) * orbitRadius;
      
      // Floating animation - more pronounced
      const floatY = Math.sin(time * 0.8 + index * 0.5) * 0.3;
      const floatX = Math.cos(time * 0.6 + index * 0.7) * 0.2;
      
      // Combine all movements
      mesh.position.x = data.basePosition.x + offsetX + orbitX + floatX;
      mesh.position.y = data.basePosition.y + offsetY + orbitY + floatY;
      
      // Add some Z-axis movement for depth
      mesh.position.z = data.basePosition.z + Math.sin(time * 0.5 + index) * 0.5;

      // Pulse effect on click (subtle wave effect)
      if (this.clickPulseTime > 0) {
        const timeSinceClick = (Date.now() - this.clickPulseTime) / 1000;
        if (timeSinceClick < 0.6) {
          const pulse = Math.sin(timeSinceClick * Math.PI * 3) * 0.08;
          const baseScale = data.baseScale * (intersects.some(i => i.object === mesh) ? 1.2 : 1);
          mesh.scale.setScalar(baseScale + pulse);
        } else {
          this.clickPulseTime = 0; // Reset after animation
        }
      }
    });

    // Rotate camera for depth effect
    this.camera.rotation.z = this.currentRotationY * 0.1;
    this.camera.rotation.x = this.currentRotationX * 0.05;

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const container = this.canvasContainer?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Dispose geometries
    this.geometries.forEach(mesh => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    });

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }
}

