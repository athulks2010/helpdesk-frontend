import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { LandingService } from '../../../../core/landing/_services/landing.service';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { FileUploadService } from '../../../../core/shared/file-upload.service';

@Component({
  selector: 'app-landing-open-ticket',
  templateUrl: './landing-open-ticket.component.html',
  styleUrls: ['./landing-open-ticket.component.scss'],
})
export class LandingOpenTicketComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  departments: any[] = [];
  priorities: any[] = [];
  types: any[] = [];
  allCategories: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];
  customFields: any[] = [];
  loadingData = true;

  form: any = {
    first_name: '',
    last_name: '',
    email: '',
    priority_id: null,
    type_id: null,
    department_id: null,
    category_id: null,
    sub_category_id: null,
    subject: '',
    details: '',
    custom_field: {} as Record<string, any>,
    files: [] as File[],
    accept_terms: false,
  };

  selectedFilesSummary: string = '';
  isUploadingFiles = false;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  submitMessage = '';
  validationErrors: Record<string, string> = {};

  constructor(
    private landingService: LandingService,
    private authService: AuthService,
    private fileUpload: FileUploadService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Pre-populate requester information if user is already logged in
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.form.first_name = currentUser.first_name || '';
      this.form.last_name = currentUser.last_name || '';
      this.form.email = currentUser.email || '';
    }

    this.loadFormData();
  }

  loadFormData(): void {
    this.loadingData = true;
    forkJoin({
      departments: this.landingService.getDepartments(),
      categories: this.landingService.getCategories(),
      priorities: this.landingService.getPriorities(),
      types: this.landingService.getTypes(),
    }).subscribe({
      next: (res: any) => {
        this.departments = res.departments || [];
        this.allCategories = res.categories || [];
        this.priorities = res.priorities || [];
        this.types = res.types || [];

        // Set default priority if available
        if (!this.form.priority_id && this.priorities.length > 0) {
          const highPrio = this.priorities.find((p: any) => /high/i.test(p.name));
          this.form.priority_id = highPrio ? highPrio.id : this.priorities[0].id;
        }

        this.loadingData = false;
      },
      error: () => {
        this.loadingData = false;
      },
    });
  }

  onDepartmentChange(event: any): void {
    const deptId = event.target ? event.target.value : event;
    const dId = Number(deptId) || 0;
    if (dId > 0) {
      // Find top-level categories that belong to this department (no parent_id or parent_id == 0)
      this.categories = this.allCategories.filter((c) => {
        const cDept = Number(c.department_id || c.department?.id || 0);
        const pId = Number(c.parent_id || c.parent?.id || 0);
        return cDept === dId && pId === 0;
      });
      // Fallback: If no top-level category matches, include any category with matching department_id
      if (this.categories.length === 0) {
        this.categories = this.allCategories.filter(
          (c) => Number(c.department_id || c.department?.id || 0) === dId
        );
      }
    } else {
      this.categories = [];
    }

    const currentCatId = Number(this.form.category_id) || 0;
    if (!this.categories.some((c) => Number(c.id) === currentCatId)) {
      this.form.category_id = null;
      this.subCategories = [];
      this.form.sub_category_id = null;
    } else {
      this.onCategoryChange(currentCatId);
    }
  }

  onCategoryChange(event: any): void {
    const catId = event.target ? event.target.value : event;
    const cId = Number(catId) || 0;
    if (cId > 0) {
      // Subcategories are categories where parent_id matches selected category_id
      this.subCategories = this.allCategories.filter((c) => {
        const pId = Number(c.parent_id || c.parent?.id || 0);
        return pId === cId;
      });
    } else {
      this.subCategories = [];
    }

    const currentSubCatId = Number(this.form.sub_category_id) || 0;
    if (!this.subCategories.some((c) => Number(c.id) === currentSubCatId)) {
      this.form.sub_category_id = null;
    }
  }

  fieldOptions(field: any): string[] {
    const raw = field?.options;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // Comma-separated fallback
    }
    return String(raw)
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (!files || !files.length) return;

    this.isUploadingFiles = true;
    this.selectedFilesSummary = `Uploading ${files.length} file(s)...`;

    const firstFile = files[0];
    const fileArray = Array.from(files);
    const uploadTasks: Observable<string>[] = fileArray.map((file) =>
      this.fileUpload.upload(file, 'tickets')
    );

    forkJoin(uploadTasks).subscribe({
      next: (paths: string[]) => {
        this.isUploadingFiles = false;
        const validPaths = paths.filter(Boolean);
        this.form.attachments = validPaths;
        this.form.attachment = validPaths;
        this.form.path = validPaths[0] || '';
        this.form.filename = firstFile ? firstFile.name : '';
        this.form.size = firstFile ? firstFile.size : 0;
        this.selectedFilesSummary = `${validPaths.length} file(s) attached`;
      },
      error: () => {
        this.isUploadingFiles = false;
        this.selectedFilesSummary = '';
        this.validationErrors['files'] = 'Failed to upload attachments. Please try again.';
      },
    });
  }

  removeFiles(): void {
    this.form.files = [];
    this.form.attachments = [];
    this.form.attachment = [];
    this.form.path = '';
    this.form.filename = '';
    this.form.size = 0;
    this.selectedFilesSummary = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
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
    if (!this.form.priority_id) {
      this.validationErrors['priority_id'] = 'Priority is required.';
    }
    if (!this.form.subject?.trim()) {
      this.validationErrors['subject'] = 'Subject is required.';
    }
    if (!this.form.details?.trim()) {
      this.validationErrors['details'] = 'Details are required.';
    }

    if (this.customFields && this.customFields.length) {
      for (const field of this.customFields) {
        if (field.required && !this.form.custom_field[field.name]) {
          this.validationErrors[field.name] = `${field.label || field.name} is required.`;
        }
      }
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  onSubmit(): void {
    if (this.isSubmitting || this.isUploadingFiles || !this.validate()) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';
    this.submitMessage = '';

    this.landingService.submitTicket(this.form).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage =
          res?.response?.message ||
          res?.message ||
          'Ticket created successfully! A confirmation has been sent to your email.';
        this.resetForm();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError =
          err?.error?.response?.message ||
          err?.error?.message ||
          'Failed to submit ticket. Please try again.';
      },
    });
  }

  private resetForm(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.form.first_name = currentUser.first_name || '';
      this.form.last_name = currentUser.last_name || '';
      this.form.email = currentUser.email || '';
    } else {
      this.form.first_name = '';
      this.form.last_name = '';
      this.form.email = '';
    }

    if (this.priorities && this.priorities.length > 0) {
      const highPrio = this.priorities.find((p: any) => /high/i.test(p.name));
      this.form.priority_id = highPrio ? highPrio.id : this.priorities[0].id;
    } else {
      this.form.priority_id = null;
    }

    this.form.type_id = null;
    this.form.department_id = null;
    this.form.category_id = null;
    this.form.sub_category_id = null;
    this.categories = [];
    this.subCategories = [];

    this.form.custom_field = {};
    if (this.customFields && this.customFields.length > 0) {
      this.customFields.forEach((cf: any) => {
        if (cf.name) {
          this.form.custom_field[cf.name] = cf.type === 'checkbox' ? false : '';
        }
      });
    }

    this.form.subject = '';
    this.form.details = '';
    this.form.files = [];
    this.selectedFilesSummary = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.form.accept_terms = false;
    this.validationErrors = {};
  }
}
