import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface FocusArea {
  key: string;
  icon: string;
  stack: string[];
}

@Component({
  selector: 'app-focus-areas',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealDirective],
  templateUrl: './focus-areas.component.html'
})
export class FocusAreasComponent {
  // What each area is useful for, independent of industry
  areas: FocusArea[] = [
    { key: 'apis', icon: '⚙️', stack: ['.NET 8', 'ASP.NET Core', 'EF Core', 'Dapper', 'SQL Server', 'MySQL'] },
    { key: 'frontend', icon: '🖥️', stack: ['React', 'Next.js', 'Angular', 'TypeScript', 'Tailwind'] },
    { key: 'security', icon: '🔐', stack: ['JWT', 'OAuth', 'reCAPTCHA', 'Rate limiting'] },
    { key: 'integrations', icon: '🔌', stack: ['REST', 'SOAP', 'Webhooks', 'SignalR', 'SFTP'] },
    { key: 'cloud', icon: '📦', stack: ['Docker', 'GitLab CI/CD', 'Google Cloud'] },
    { key: 'ai', icon: '🤖', stack: ['Gemini', 'Vertex AI', 'Document AI'] }
  ];
}
