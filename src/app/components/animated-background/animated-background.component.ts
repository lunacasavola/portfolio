import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.css'
})
export class AnimatedBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  private animationFrameId?: number;
  private particles: Particle[] = [];
  private ctx?: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private accentColor = '#00ff41';
  private lastTime = 0;
  private reducedMotion = false;
  private colorObserver?: MutationObserver;
  private readonly linkDistance = 150;

  private readonly onResize = () => {
    this.resizeCanvas();
    this.initParticles();
    if (this.reducedMotion) this.draw();
  };

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.stop();
    } else if (!this.reducedMotion) {
      this.start();
    }
  };

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d') || undefined;
    if (!this.ctx) return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.readAccentColor();
    this.resizeCanvas();
    this.initParticles();

    // Read the accent color once per change instead of on every frame
    this.colorObserver = new MutationObserver(() => {
      this.readAccentColor();
      if (this.reducedMotion) this.draw();
    });
    this.colorObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    // The animation loop doesn't touch Angular state, so keep it out of change detection
    this.zone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      if (this.reducedMotion) {
        this.draw();
      } else {
        this.start();
      }
    });
  }

  ngOnDestroy(): void {
    this.stop();
    this.colorObserver?.disconnect();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private start(): void {
    if (this.animationFrameId) return;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      // Normalize to 60fps so speed is the same on 120/144Hz screens
      const dt = Math.min((now - this.lastTime) / 16.667, 3);
      this.lastTime = now;
      this.update(dt);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private readAccentColor(): void {
    this.accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff41';
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initParticles(): void {
    // Scale particle count with screen area so mobile isn't crowded
    const count = Math.round(Math.min(70, Math.max(25, (this.width * this.height) / 22000)));

    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.2
      });
    }
  }

  private update(dt: number): void {
    for (const p of this.particles) {
      p.x += p.speedX * dt;
      p.y += p.speedY * dt;

      // Wrap around edges
      if (p.x < 0) p.x += this.width;
      else if (p.x > this.width) p.x -= this.width;
      if (p.y < 0) p.y += this.height;
      else if (p.y > this.height) p.y -= this.height;
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.accentColor;
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 0.6;

    const maxDistSq = this.linkDistance * this.linkDistance;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      for (let j = i + 1; j < this.particles.length; j++) {
        const o = this.particles[j];
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          ctx.globalAlpha = (1 - Math.sqrt(distSq) / this.linkDistance) * 0.35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
}
