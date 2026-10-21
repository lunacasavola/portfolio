import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

/**
 * Fades/slides an element in the first time it enters the viewport.
 * Usage: <div appReveal [revealDelay]="i * 80"></div>
 */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;

  // One observer shared by every revealed element
  private static observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${this.revealDelay}ms`);

    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('revealed');
      return;
    }

    RevealDirective.getObserver().observe(element);
  }

  ngOnDestroy(): void {
    RevealDirective.observer?.unobserve(this.el.nativeElement);
  }

  private static getObserver(): IntersectionObserver {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
      );
    }
    return this.observer;
  }
}
