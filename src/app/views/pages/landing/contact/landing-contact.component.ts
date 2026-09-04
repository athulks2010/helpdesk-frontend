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
      // unwrap() strips outer `data`, so we get { id, slug, html, content, ... }
      // The `html` / `content` field is DOUBLE-encoded JSON — parse it up to twice
      const raw = data?.html ?? data?.content ?? data;
      let parsed: any = null;

      if (typeof raw === 'string') {
        try {
          let once = JSON.parse(raw);
          // If still a string after first parse, parse again (double-encoded)
          if (typeof once === 'string') {
            once = JSON.parse(once);
          }
          parsed = once;
        } catch {
          parsed = null;
        }
      } else if (raw && typeof raw === 'object') {
        parsed = raw;
      }

      this.pageData = parsed;
    });
  }

  get contact(): any {
    // Static fallbacks for fields not returned by the API
    const defaults = {
      content_text: 'Connect With Our Support Team',
      content_details:
        'Need help with onboarding, ticket workflows, or account issues? Reach out and our team will connect you with the right specialist.',
      email: 'support@yourhelpdesk.com',
      phone: '+1 (415) 555-0198',
      location: '8013 Alderwood St, South San Francisco, CA 94080',
      email_details: 'Use email for product questions, integration requests, and account-related support.',
      phone_details: 'Call for urgent operational issues that require immediate triage.',
    };
    // Merge API data over defaults so any field present in API wins
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
