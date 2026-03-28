import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [ReactiveFormsModule]
})
export class App {
  isMobileMenuOpen = false;
  sending = false;
  formStatus: 'idle' | 'success' | 'error' = 'idle';

  contactForm: FormGroup;

  // En producción apunta a api.arkhon.com.ar, en dev al localhost:3000
  private apiUrl = '/api/contact';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      nombre:   ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje:  ['', Validators.required]
    });
  }

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  sendContact() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.sending = true;
    this.formStatus = 'idle';

    this.http.post(this.apiUrl, this.contactForm.value).subscribe({
      next: () => {
        this.formStatus = 'success';
        this.sending = false;
        this.contactForm.reset();
      },
      error: () => {
        this.formStatus = 'error';
        this.sending = false;
      }
    });
  }
}
