import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../core/ticket/_services/ticket.service';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss'],
})
export class TicketCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = true;
  error = '';

  isEditMode = false;
  ticketId: string | null = null;

  priorities: any[] = [];
  statuses: any[] = [];
  types: any[] = [];
  departments: any[] = [];
  categories: any[] = [];
  customers: any[] = [];
  assignees: any[] = [];
  contacts: any[] = [];

  attachedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.ticketId;

    this.form = this.fb.group({
      id: [this.ticketId ? Number(this.ticketId) : 0],
      user_id: [0],
      contact_id: [0],
      priority_id: [0, Validators.required],
      status_id: [0],
      type_id: [0],
      department_id: [0],
      category_id: [0],
      assigned_to: [0],
      subject: ['', Validators.required],
      body: ['', Validators.required],
    });

    // Create requires a customer; update API does not accept user_id
    if (!this.isEditMode) {
      this.form.get('user_id')?.setValidators([Validators.required, Validators.min(1)]);
      this.form.get('user_id')?.updateValueAndValidity();
      this.form.get('priority_id')?.setValidators([Validators.required, Validators.min(1)]);
      this.form.get('priority_id')?.updateValueAndValidity();
    }

    this.loadData();
  }

  loadData(): void {
    this.loadingData = true;
    this.ticketService.getFormDropdowns().subscribe({
      next: (dropdowns) => {
        this.priorities = dropdowns.priorities;
        this.statuses = dropdowns.statuses;
        this.types = dropdowns.types;
        this.departments = dropdowns.departments;
        this.categories = dropdowns.categories;
        this.customers = dropdowns.customers;
        this.assignees = dropdowns.assignees;
        this.contacts = dropdowns.contacts;

        if (this.isEditMode && this.ticketId) {
          this.ticketService.getById(this.ticketId).subscribe({
            next: (res) => {
              const t = res?.ticket || res?.item || res;
              if (t) {
                this.form.patchValue({
                  id: Number(t.id || this.ticketId) || 0,
                  user_id: Number(t.user_id || t.user?.id) || 0,
                  contact_id: Number(t.contact_id || t.contact?.id) || 0,
                  priority_id: Number(t.priority_id || t.priority?.id) || 0,
                  status_id: Number(t.status_id || t.status?.id) || 0,
                  type_id: Number(t.type_id || t.type?.id) || 0,
                  department_id: Number(t.department_id || t.department?.id) || 0,
                  category_id: Number(t.category_id || t.category?.id) || 0,
                  assigned_to: Number(t.assigned_to || t.assignedTo?.id || t.assignee?.id) || 0,
                  subject: t.subject || t.title || '',
                  body: t.body || t.details || t.description || '',
                });
              }
              this.loadingData = false;
            },
            error: () => {
              this.error = 'Failed to load ticket details';
              this.loadingData = false;
            },
          });
        } else {
          const defPriority = this.priorities.find((p) =>
            /generally|medium|normal/i.test(p.name || '')
          );
          const defStatus = this.statuses.find((s) =>
            /open|new/i.test(s.name || '')
          );
          this.form.patchValue({
            priority_id: defPriority?.id ? Number(defPriority.id) : 0,
            status_id: defStatus?.id ? Number(defStatus.id) : 0,
          });
          this.loadingData = false;
        }
      },
      error: () => {
        this.loadingData = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((f) => this.attachedFiles.push(f));
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  fileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';

    const raw = this.form.getRawValue();

    if (this.isEditMode) {
      this.ticketService.updateTicket(raw).subscribe({
        next: () => this.onSuccess(),
        error: (err) => this.onError(err, 'Failed to update ticket'),
      });
      return;
    }

    // Create uses JSON body matching /ticket/create contract
    this.ticketService.createTicket(raw).subscribe({
      next: () => this.onSuccess(),
      error: (err) => this.onError(err, 'Failed to create ticket'),
    });
  }

  private onSuccess(): void {
    this.loading = false;
    this.router.navigate(['/tickets']);
  }

  private onError(err: any, fallbackMsg: string): void {
    this.loading = false;
    this.error =
      err?.error?.response?.message ||
      err?.error?.message ||
      (Array.isArray(err?.error?.errors) ? err.error.errors[0] : null) ||
      fallbackMsg;
  }

  displayName(user: any): string {
    if (!user) return '';
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || user.name || '';
  }

  contactLabel(c: any): string {
    if (!c) return '';
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.name || '';
    return name ? `${name} (${c.email || 'no email'})` : c.email || String(c.id);
  }

  get f() {
    return this.form.controls;
  }
}
