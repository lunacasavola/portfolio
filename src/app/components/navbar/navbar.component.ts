import { Component, HostListener, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TerminalService } from '../../services/terminal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  isScrolled = false;
  menuOpen = false;
  activeSection = 'hero';
  currentLang: string;

  // Same order as the sections on the page
  readonly links = [
    { id: 'hero', key: 'nav.home' },
    { id: 'summary', key: 'nav.summary' },
    { id: 'projects', key: 'nav.projects' },
    { id: 'wms', key: 'nav.wms' },
    { id: 'skills', key: 'nav.skills' },
    { id: 'experience', key: 'nav.experience' },
    { id: 'info', key: 'nav.info' },
    { id: 'contact', key: 'nav.contact' }
  ];

  private sectionObserver?: IntersectionObserver;
  private langSubscription: Subscription;

  constructor(private translate: TranslateService, private zone: NgZone, private terminal: TerminalService) {
    this.currentLang = this.translate.currentLang || localStorage.getItem('lang') || 'en';

    // The language can also change from the terminal (`lang es`), so follow every change
    this.langSubscription = this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
    });
  }

  ngAfterViewInit(): void {
    // Highlight the link of the section crossing the middle of the viewport
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting);
        if (visible) {
          this.zone.run(() => (this.activeSection = visible.target.id));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    this.links.forEach(link => {
      const el = document.getElementById(link.id);
      if (el) this.sectionObserver!.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
    this.langSubscription.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrolled = window.scrollY > 8;
    if (scrolled !== this.isScrolled) this.isScrolled = scrolled;
  }

  @HostListener('document:keydown.escape')
  closeMenu() {
    this.menuOpen = false;
  }

  scrollTo(id: string) {
    this.menuOpen = false;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setLang(lang: 'en' | 'es') {
    this.translate.use(lang);
  }

  openTerminal() {
    this.menuOpen = false;
    this.terminal.open();
  }
}
