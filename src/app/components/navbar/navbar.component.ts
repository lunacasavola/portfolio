import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isScrolled = false;

  constructor(private translate: TranslateService) {}

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 8;
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setLang(lang: 'en' | 'es') {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}


