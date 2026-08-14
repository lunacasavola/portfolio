import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './summary.component.html'
})
export class SummaryComponent {}


