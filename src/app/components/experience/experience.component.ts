import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ExperienceItem {
  company: string;
  location: string;
  role: string;
  period: string;
  highlights: string[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './experience.component.html'
})
export class ExperienceComponent {
  items: ExperienceItem[] = [
    {
      company: 'experience.string.company',
      location: 'experience.string.location',
      role: 'experience.string.role',
      period: 'experience.string.period',
      highlights: [
        'experience.string.h1',
        'experience.string.h2',
        'experience.string.h3',
        'experience.string.h4',
        'experience.string.h5',
        'experience.string.h6',
        'experience.string.h7',
        'experience.string.h8',
        'experience.string.h9',
        'experience.string.h10',
        'experience.string.h11',
        'experience.string.h12'
      ]
    },
    {
      company: 'experience.concrete.company',
      location: 'experience.concrete.location',
      role: 'experience.concrete.role',
      period: 'experience.concrete.period',
      highlights: [
        'experience.concrete.h1',
        'experience.concrete.h2',
        'experience.concrete.h3',
        'experience.concrete.h4',
        'experience.concrete.h5',
        'experience.concrete.h6',
        'experience.concrete.h7',
        'experience.concrete.h8'
      ]
    }
  ];
}
