import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-contact',
  templateUrl: './landing-contact.component.html',
  styleUrls: ['./landing-contact.component.scss'],
})
export class LandingContactComponent implements OnInit {
  pageData: any = null;
  loading = true;

  form = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  submitMessage = '';
  validationErrors: Record<string, string> = {};

  constructor(
    private landingService: LandingService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loading = true;

    this.landingService.getContactPageData().subscribe({
      next: (data: any) => {
        this.pageData = data?.html ?? data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get contact(): any {
    const defaults = this.landingService.getDefaultContactPageHtml();
    return this.pageData ? { ...defaults, ...this.pageData } : defaults;
  }

  get mapUrl(): SafeResourceUrl | null {
    const src = this.contact?.location_map;
    if (!src) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }

  isHashLink(link: string | null | undefined): boolean {
    return !!link && String(link).startsWith('#');
  }

  validate(): boolean {
    this.validationErrors = {};
    if (!this.form.first_name.trim()) {
      this.validationErrors['first_name'] = 'First name is required.';
    }
    if (!this.form.last_name.trim()) {
      this.validationErrors['last_name'] = 'Last name is required.';
    }
    if (!this.form.email.trim() || !this.form.email.includes('@')) {
      this.validationErrors['email'] = 'Valid email is required.';
    }
    if (!this.form.phone.trim() || !/\d{7,}/.test(this.form.phone.replace(/\D/g, ''))) {
      this.validationErrors['phone'] = 'Valid phone number is required.';
    }
    if (!this.form.message.trim()) {
      this.validationErrors['message'] = 'Message is required.';
    }
    return Object.keys(this.validationErrors).length === 0;
  }

  onSubmit(): void {
    if (this.isSubmitting || !this.validate()) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const firstName = this.form.first_name.trim();
    const lastName = this.form.last_name.trim();
    const payload = {
      first_name: firstName,
      last_name: lastName,
      name: [firstName, lastName].filter(Boolean).join(' '),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
      message: this.form.message.trim(),
      recipient: this.contact.contact_recipient || this.contact.email,
    };

    this.landingService.submitContactMessage(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage =
          res?.response?.message ||
          res?.message ||
          'Thank you for reaching out! We have received your message and will respond shortly.';
        this.form = { first_name: '', last_name: '', email: '', phone: '', message: '' };
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError =
          err?.error?.response?.message ||
          err?.error?.message ||
          err?.message ||
          'Failed to send message. Please try again.';
      },
    });
  }
}
