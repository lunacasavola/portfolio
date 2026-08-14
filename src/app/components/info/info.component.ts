import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './info.component.html'
})
export class InfoComponent {}


