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
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'SQL Server', color: '#CC2927' },
    { name: 'Ionic', color: '#3880FF' }
  ];

  groups = ([
    {
      titleKey: 'skills.backend',
      items: 'C# • .NET Framework • .NET Core • .NET 6+ • ASP.NET • Entity Framework • REST APIs • OOP'
    },
    {
      titleKey: 'skills.databases',
      items: 'SQL Server • T-SQL • Database Design • Query Optimization • Erwin Data Modeler'
    },
    {
      titleKey: 'skills.frontend',
      items: 'Angular (v5–20) • TypeScript • JavaScript • HTML • CSS/SCSS • NgRx'
    },
    {
      titleKey: 'skills.mobile',
      items: 'Ionic • Cordova • Capacitor'
    },
    {
      titleKey: 'skills.devops',
      items: 'Git • Azure DevOps • Azure • Visual Studio • VS Code • Postman'
    },
    {
      titleKey: 'skills.systems',
      items: 'WMS • REST Integrations • Pick-to-Light • Robotic Sorter Automation • Zebra Devices • ZPL Printing'
    },
    {
      titleKey: 'skills.practices',
      items: 'Agile • Requirements Analysis • Debugging • Production Support • Configurable Business Logic'
    },
    {
      titleKey: 'skills.domain',
      items: 'Warehouse Management • Inventory • Picking • Logistics • Business Process Automation'
    }
  ]).map(group => ({ ...group, items: group.items.split(' • ') }));
}
