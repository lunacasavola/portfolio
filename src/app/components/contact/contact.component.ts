import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  submitted = false;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;
    alert(this.translate.instant('contact.thanks'));
    this.form.reset();
    this.submitted = false;
  }
}
