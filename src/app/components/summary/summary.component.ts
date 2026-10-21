import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealDirective],
  templateUrl: './summary.component.html'
})
export class SummaryComponent {}
