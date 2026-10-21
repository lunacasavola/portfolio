import { Injectable, NgZone } from '@angular/core';

/**
 * Full-screen canvas easter eggs (Matrix rain, confetti).
 * Each effect creates its own temporary canvas and removes it when done.
 */
@Injectable({
  providedIn: 'root'
})
export class EffectsService {
  private running = new Set<string>();

  constructor(private zone: NgZone) {}

  matrixRain(durationMs = 6000): void {
    this.run('matrix', durationMs, (ctx, width, height) => {
      const fontSize = 16;
      const columns = Math.ceil(width / fontSize);
      const drops = Array.from({ length: columns }, () => Math.random() * -50);
      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}=;$';
      const accent = this.accent();

      return () => {
        // Translucent fill leaves fading trails behind each column
        ctx.fillStyle = 'rgba(11, 13, 16, 0.12)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = `${fontSize}px "Roboto Mono", monospace`;

        drops.forEach((y, i) => {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = Math.random() > 0.96 ? '#fff' : accent;
          ctx.fillText(char, i * fontSize, y * fontSize);
          drops[i] = y * fontSize > height && Math.random() > 0.975 ? 0 : y + 1;
        });
      };
    });
  }

  confetti(durationMs = 3500): void {
    this.run('confetti', durationMs, (ctx, width, height) => {
      const colors = [this.accent(), '#ffffff', '#ffd166', '#ef476f', '#06d6a0', '#118ab2'];
      const pieces = Array.from({ length: 160 }, () => ({
        x: width / 2 + (Math.random() - 0.5) * 120,
        y: height * 0.35,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));

      return () => {
        ctx.clearRect(0, 0, width, height);
        for (const p of pieces) {
          p.vy += 0.35;          // gravity
          p.vx *= 0.99;          // air drag
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.spin;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
      };
    });
  }

  private run(
    name: string,
    durationMs: number,
    setup: (ctx: CanvasRenderingContext2D, width: number, height: number) => () => void
  ): void {
    if (this.running.has(name)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.zone.runOutsideAngular(() => {
      const canvas = document.createElement('canvas');
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '90',
        pointerEvents: 'none',
        transition: 'opacity 0.8s ease'
      });
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        canvas.remove();
        return;
      }

      this.running.add(name);
      const frame = setup(ctx, width, height);
      const start = performance.now();
      let rafId = 0;

      const loop = (now: number) => {
        frame();
        if (now - start < durationMs) {
          rafId = requestAnimationFrame(loop);
        } else {
          canvas.style.opacity = '0';
          setTimeout(() => {
            cancelAnimationFrame(rafId);
            canvas.remove();
            this.running.delete(name);
          }, 800);
          // keep animating while it fades out
          const fade = () => {
            frame();
            if (canvas.isConnected) rafId = requestAnimationFrame(fade);
          };
          rafId = requestAnimationFrame(fade);
        }
      };
      rafId = requestAnimationFrame(loop);
    });
  }

  private accent(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff41';
  }
}
