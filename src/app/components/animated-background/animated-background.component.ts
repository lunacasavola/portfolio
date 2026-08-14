import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.css'
})
export class AnimatedBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  
  private animationFrameId?: number;
  private particles: Particle[] = [];
  private readonly particleCount = 50;
  private ctx?: CanvasRenderingContext2D;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d') || undefined;
    if (!this.ctx) return;

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize particles
    this.initParticles();
    
    // Start animation
    this.animate();

    // Listen for color changes
    const observer = new MutationObserver(() => {
      // Colors will be read from CSS in animate loop
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initParticles(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
  }

  private animate(): void {
    if (!this.ctx) return;

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    this.particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Draw particle - use CSS variable for color
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff41';
      this.ctx!.globalAlpha = particle.opacity;
      this.ctx!.fillStyle = accentColor;
      this.ctx!.beginPath();
      this.ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx!.fill();

      // Draw connections to nearby particles
      this.particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          this.ctx!.globalAlpha = (1 - distance / 150) * 0.1;
          this.ctx!.strokeStyle = accentColor;
          this.ctx!.lineWidth = 0.5;
          this.ctx!.beginPath();
          this.ctx!.moveTo(particle.x, particle.y);
          this.ctx!.lineTo(otherParticle.x, otherParticle.y);
          this.ctx!.stroke();
        }
      });
    });

    this.ctx.globalAlpha = 1;

    this.animationFrameId = requestAnimationFrame(() => this.animate());
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

