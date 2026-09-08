import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [ReactiveFormsModule]
})
export class App implements AfterViewInit, OnDestroy {
  isMobileMenuOpen = false;
  sending = false;
  formStatus: 'idle' | 'success' | 'error' = 'idle';
  contactForm: FormGroup;

  private apiUrl = '/api/contact';
  private observer?: IntersectionObserver;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      nombre:   ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje:  ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    // ── Scroll progress bar ──────────────────────────────
    const bar = document.getElementById('scroll-progress');
    const onScroll = () => {
      const s = document.documentElement;
      const pct = (s.scrollTop / (s.scrollHeight - s.clientHeight)) * 100;
      if (bar) bar.style.width = pct + '%';

      // Navbar shrink
      const nav = document.getElementById('main-nav');
      if (nav) {
        if (s.scrollTop > 60) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Cursor glow ──────────────────────────────────────
    const glow = document.getElementById('cursor-glow');
    if (glow && window.innerWidth > 1024) {
      glow.style.display = 'block';
      document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
      }, { passive: true });
    }

    // ── Intersection Observer (reveal) ───────────────────
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('visible');
          this.observer?.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => this.observer?.observe(el));

    // ── Stat count-up ────────────────────────────────────
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const text = el.dataset['target'] || el.textContent?.trim() || '';
        const match = text.match(/^([+\-]?)(\d+)([+]?)$/);
        if (!match) return;
        const [, pre, numStr, post] = match;
        const end = parseInt(numStr);
        let startTime = 0;
        const step = (ts: number) => {
          if (!startTime) startTime = ts;
          const p = Math.min((ts - startTime) / 1000, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(ease * end) + post;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.count-up').forEach(el => countObs.observe(el));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
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
