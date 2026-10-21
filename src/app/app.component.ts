import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { InfoComponent } from './components/info/info.component';
import { SummaryComponent } from './components/summary/summary.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ContactComponent } from './components/contact/contact.component';
import { AnimatedBackgroundComponent } from './components/animated-background/animated-background.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NavbarComponent,
    HeroComponent,
    InfoComponent,
    SummaryComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    ContactComponent,
    AnimatedBackgroundComponent,
    ColorPickerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'portfolio';
  year = new Date().getFullYear();
  private sectionObserver?: IntersectionObserver;

  constructor(private translate: TranslateService) {
    const saved = localStorage.getItem('lang') || 'en';
    this.translate.use(saved);
    document.documentElement.lang = saved;
  }

  ngAfterViewInit(): void {
    this.setupSectionObserver();
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  // Draws the accent divider line of each section once it scrolls into view.
  // Content animations are handled per element by RevealDirective.
  private setupSectionObserver(): void {
    const sections = document.querySelectorAll('.section');
    if (sections.length === 0) return;

    this.sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );

    sections.forEach((section) => this.sectionObserver?.observe(section));
  }
}
