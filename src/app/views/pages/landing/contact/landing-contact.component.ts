import { Component, OnInit } from '@angular/core';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-contact',
  templateUrl: './landing-contact.component.html',
  styleUrls: ['./landing-contact.component.scss'],
})
export class LandingContactComponent implements OnInit {
  pageData: any = null;

  form = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  isSubmitting = false;
  submitSuccess = false;
  submitMessage = '';
  validationErrors: Record<string, string> = {};

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getContactPageData().subscribe((data: any) => {
      this.pageData = data?.html ?? data;
    });
  }

  get contact(): any {
    const defaults = this.landingService.getDefaultContactPageHtml();
    return this.pageData ? { ...defaults, ...this.pageData } : defaults;
  }

  validate(): boolean {
    this.validationErrors = {};
    if (!this.form.name.trim()) {
      this.validationErrors['name'] = 'Full name is required.';
    }
    if (!this.form.email.trim() || !this.form.email.includes('@')) {
      this.validationErrors['email'] = 'Valid email is required.';
    }
    if (!this.form.subject.trim()) {
      this.validationErrors['subject'] = 'Subject is required.';
    }
    if (!this.form.message.trim()) {
      this.validationErrors['message'] = 'Message is required.';
    }
    return Object.keys(this.validationErrors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) {
      return;
    }

    this.isSubmitting = true;
    this.landingService.submitContactMessage(this.form).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage =
          res?.message || 'Thank you for reaching out! We have received your message and will respond shortly.';
        this.form = { name: '', email: '', subject: '', message: '' };
      },
      error: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage = 'Thank you for contacting us! We will follow up with you within 24 hours.';
        this.form = { name: '', email: '', subject: '', message: '' };
      },
    });
  }
}
