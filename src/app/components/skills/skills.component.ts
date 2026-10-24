import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealDirective],
  templateUrl: './skills.component.html',
  styles: [`
    .skill-card:hover {
      border-color: color-mix(in srgb, var(--skill-color) 50%, transparent);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 24px color-mix(in srgb, var(--skill-color) 35%, transparent);
    }
  `]
})
export class SkillsComponent {
  skills = [
    { name: 'C#', color: '#239120' },
    { name: '.NET', color: '#512BD4' },
    { name: 'Angular', color: '#DD0031' },
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#E5E5E5' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'SQL Server', color: '#CC2927' },
    { name: 'MySQL', color: '#4479A1' },
    { name: 'Google Cloud', color: '#4285F4' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'Tailwind', color: '#06B6D4' },
    { name: 'Ionic', color: '#3880FF' }
  ];

  groups = SKILL_GROUPS.map(group => ({ ...group, items: group.items.split(' • ') }));
}

// Shared with the terminal's `skills` command
export const SKILL_GROUPS = [
  {
    titleKey: 'skills.backend',
    items: 'C# • .NET 8 • ASP.NET Core Web API • .NET Framework • Entity Framework Core • Dapper • ADO.NET • REST APIs • Swagger / OpenAPI • SignalR • Background workers • SOAP / WCF • FluentValidation • Serilog'
  },
  {
    titleKey: 'skills.frontend',
    items: 'Angular (v5–20) • React 19 • Next.js (App Router, SSR / SSG / ISR) • TypeScript • JavaScript • Tailwind CSS • Radix UI • Material UI • Zustand • TanStack Query / Table • React Hook Form • NgRx • HTML • CSS / SCSS'
  },
  {
    titleKey: 'skills.databases',
    items: 'SQL Server • MySQL • T-SQL • Stored procedures • Database design • Query optimization • Versioned SQL scripts • Erwin Data Modeler'
  },
  {
    titleKey: 'skills.devops',
    items: 'Google Cloud Run • Artifact Registry • Docker (multi-stage) • GitLab CI/CD • Azure DevOps • Azure • IIS • Git • Visual Studio • VS Code • Postman'
  },
  {
    titleKey: 'skills.security',
    items: 'JWT + refresh tokens • OAuth / Google Sign-In • NextAuth • BCrypt • reCAPTCHA v3 • Rate limiting • CORS • Content-Security-Policy • Webhook signature validation'
  },
  {
    titleKey: 'skills.ai',
    items: 'Gemini • Vertex AI • Document AI (OCR / extraction) • AI-assisted workflows'
  },
  {
    titleKey: 'skills.systems',
    items: 'WMS • REST & SOAP integrations • Payment APIs • Transactional email • SFTP • PDF generation • Excel exports • Pick-to-Light • Robotic Sorter Automation • Zebra Devices • ZPL Printing'
  },
  {
    titleKey: 'skills.visual',
    items: 'Framer Motion • GSAP • Three.js / React Three Fiber • Lottie • Recharts • Chart.js • D3 • Leaflet / Mapbox'
  },
  {
    titleKey: 'skills.testing',
    items: 'xUnit • Integration tests • Playwright • Coverlet • React Testing Library • ESLint • TypeScript strict mode'
  },
  {
    titleKey: 'skills.mobile',
    items: 'Ionic • Cordova • Capacitor'
  },
  {
    titleKey: 'skills.practices',
    items: 'Clean Architecture • Layered architecture • Repository pattern • Microservices • Backend-for-frontend • Agile • Requirements Analysis • Debugging • Production Support'
  },
  {
    titleKey: 'skills.domain',
    items: 'Warehouse Management • Inventory • Picking • Logistics • Business Process Automation'
  }
];
