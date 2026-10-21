import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealDirective],
  templateUrl: './info.component.html'
})
export class InfoComponent {
  items: Array<{ label: string; value: string; href?: string }> = [
    { label: 'info.age', value: 'info.ageValue' },
    { label: 'info.location', value: 'info.locationValue' },
    { label: 'info.email', value: 'casavolalc@gmail.com', href: 'mailto:casavolalc@gmail.com' },
    { label: 'info.languages', value: 'info.languagesValue' },
    { label: 'info.openToWork', value: 'info.openToWorkValue' }
  ];
}
