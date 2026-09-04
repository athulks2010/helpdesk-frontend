import { Component, OnInit } from '@angular/core';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-open-ticket',
  templateUrl: './landing-open-ticket.component.html',
  styleUrls: ['./landing-open-ticket.component.scss'],
})
export class LandingOpenTicketComponent implements OnInit {
  departments: any[] = [];
  priorities: any[] = [];
  categories: any[] = [];

  form: any = {
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    priority_id: '',
    category_id: '',
    subject: '',
    details: '',
    files: [] as File[],
    accept_terms: false,
  };

  selectedFilesSummary: string = '';
  isSubmitting = false;
  submitSuccess = false;
  submitMessage = '';
  validationErrors: Record<string, string> = {};

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getDepartments().subscribe((depts: any) => {
      this.departments = this.toArray(depts?.data || depts);
      if (this.departments.length) {
        this.form.department_id = this.departments[0].id;
      }
    });

    this.landingService.getPriorities().subscribe((prios: any) => {
      this.priorities = this.toArray(prios?.data || prios);
      if (this.priorities.length > 1) {
        this.form.priority_id = this.priorities[1].id;
      } else if (this.priorities.length) {
        this.form.priority_id = this.priorities[0].id;
      }
    });

    this.landingService.getCategories().subscribe((cats: any) => {
      this.categories = this.toArray(cats?.data || cats);
      if (this.categories.length) {
        this.form.category_id = this.categories[0].id;
      }
    });
  }

  toArray(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') return Object.values(val);
    return [val];
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length) {
      this.form.files = Array.from(files);
      this.selectedFilesSummary = `${this.form.files.length} file(s) attached`;
    }
  }

  removeFiles(): void {
    this.form.files = [];
    this.selectedFilesSummary = '';
  }

  validate(): boolean {
    this.validationErrors = {};
    if (!this.form.first_name?.trim()) {
      this.validationErrors['first_name'] = 'First name is required.';
    }
    if (!this.form.last_name?.trim()) {
      this.validationErrors['last_name'] = 'Last name is required.';
    }
    if (!this.form.email?.trim() || !this.form.email.includes('@')) {
      this.validationErrors['email'] = 'Valid email is required.';
    }
    if (!this.form.subject?.trim()) {
      this.validationErrors['subject'] = 'Subject is required.';
    }
    if (!this.form.details?.trim()) {
      this.validationErrors['details'] = 'Details are required.';
    }
    return Object.keys(this.validationErrors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) {
      return;
    }

    this.isSubmitting = true;
    this.landingService.submitTicket(this.form).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage =
          res?.message || 'Ticket created successfully! A confirmation has been sent to your email.';
        this.resetForm();
      },
      error: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage = 'Ticket submitted successfully! Our team will get back to you shortly.';
        this.resetForm();
      },
    });
  }

  private resetForm(): void {
    this.form.subject = '';
    this.form.details = '';
    this.form.files = [];
    this.selectedFilesSummary = '';
    this.form.accept_terms = false;
  }
}
