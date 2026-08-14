import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'portfolio';
  private sectionObserver?: IntersectionObserver;

  constructor(private translate: TranslateService) {
    const saved = localStorage.getItem('lang') || 'en';
    this.translate.use(saved);
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    // Set up section visibility observer for animations
    setTimeout(() => {
      this.setupSectionObserver();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
  }

  private setupSectionObserver(): void {
    const sections = document.querySelectorAll('.section');
    if (sections.length === 0) return;

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger slide-up animation
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    sections.forEach((section) => {
      this.sectionObserver?.observe(section);
    });
  }
}
