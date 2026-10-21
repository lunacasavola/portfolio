import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RevealDirective],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private readonly email = 'casavolalc@gmail.com';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  submitted = false;
  sent = false;

  constructor(private fb: FormBuilder) {}

  // There is no backend, so the message is handed to the visitor's mail client
  submit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const { name, email, message } = this.form.getRawValue();
    const subject = encodeURIComponent(`Portfolio - ${name}`);
    const body = encodeURIComponent(`${message}\n\n${name} <${email}>`);
    window.location.href = `mailto:${this.email}?subject=${subject}&body=${body}`;

    this.sent = true;
    this.form.reset();
    this.submitted = false;
  }
}
