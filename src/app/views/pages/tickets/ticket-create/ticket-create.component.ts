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

  // Mode
  isEditMode = false;
  ticketId: string | null = null;

  // Dropdown data
  priorities: any[] = [];
  statuses: any[] = [];
  types: any[] = [];
  departments: any[] = [];
  customers: any[] = [];
  assignees: any[] = [];

  // File attachments
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
      id:            [this.ticketId],
      user_id:       [null, Validators.required],
      priority_id:   [null, Validators.required],
      status_id:     [null],
      type_id:       [null],
      department_id: [null],
      assigned_to:   [null],
      subject:       ['', Validators.required],
      details:       [''],
    });

    this.loadData();
  }

  loadData(): void {
    this.loadingData = true;
    this.ticketService.getFormDropdowns().subscribe({
      next: (dropdowns) => {
        this.priorities  = dropdowns.priorities;
        this.statuses    = dropdowns.statuses;
        this.types       = dropdowns.types;
        this.departments = dropdowns.departments;
        this.customers   = dropdowns.customers;
        this.assignees   = dropdowns.assignees;

        if (this.isEditMode && this.ticketId) {
          // Fetch existing ticket for edit
          this.ticketService.getById(this.ticketId).subscribe({
            next: (res) => {
              const t = res?.ticket || res;
              if (t) {
                this.form.patchValue({
                  id:            t.id || this.ticketId,
                  user_id:       t.user_id || t.user?.id || null,
                  priority_id:   t.priority_id || t.priority?.id || null,
                  status_id:     t.status_id || t.status?.id || null,
                  type_id:       t.type_id || t.type?.id || null,
                  department_id: t.department_id || t.department?.id || null,
                  assigned_to:   t.assigned_to || t.assignee?.id || null,
                  subject:       t.subject || t.title || '',
                  details:       t.details || t.body || t.description || '',
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
          // Set default priority if "Generally" or "Medium" exists
          const defPriority = this.priorities.find((p) =>
            /generally|medium|normal/i.test(p.name)
          );
          if (defPriority) this.form.patchValue({ priority_id: defPriority.id });
          this.loadingData = false;
        }
      },
      error: () => {
        this.loadingData = false;
      },
    });
  }

  // ─── File attachments ───
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

  // ─── Submit (Create or Update) ───
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';

    const payload: Record<string, any> = { ...this.form.value };

    if (this.isEditMode) {
      this.ticketService.updateTicket(payload).subscribe({
        next: () => this.onSuccess(),
        error: (err) => this.onError(err, 'Failed to update ticket'),
      });
    } else {
      if (this.attachedFiles.length) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] != null) fd.append(k, payload[k]);
        });
        this.attachedFiles.forEach((f) => fd.append('files[]', f, f.name));
        this.ticketService.createTicket(fd).subscribe({
          next: () => this.onSuccess(),
          error: (err) => this.onError(err, 'Failed to create ticket'),
        });
      } else {
        this.ticketService.createTicket(payload).subscribe({
          next: () => this.onSuccess(),
          error: (err) => this.onError(err, 'Failed to create ticket'),
        });
      }
    }
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
      err?.error?.errors?.[0] ||
      fallbackMsg;
  }

  displayName(user: any): string {
    if (!user) return '';
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '';
  }

  get f() {
    return this.form.controls;
  }
}
