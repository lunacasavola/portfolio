import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

export interface Project {
  name: string;
  description: string;
  url: string;
  imageUrl: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealDirective],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent {
  projects = PROJECTS;
}

// Shared with the terminal's `projects` command
export const PROJECTS: Project[] = [
  {
    name: 'projects.stringSistemas.name',
    description: 'projects.stringSistemas.description',
    url: 'https://www.stringsistemas.com/',
    imageUrl: 'assets/images/string-sistemas.png'
  },
  {
    name: 'projects.concreteQuality.name',
    description: 'projects.concreteQuality.description',
    url: 'https://www.concrete-quality.com/',
    imageUrl: 'assets/images/cq.png'
  },
  {
    name: 'projects.hippieHouse.name',
    description: 'projects.hippieHouse.description',
    url: 'https://www.hippiehouse.tv/index.html',
    imageUrl: 'assets/images/hh.png'
  }
];
