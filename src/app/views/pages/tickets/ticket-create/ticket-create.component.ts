import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { TicketService } from '../../../../core/ticket/_services/ticket.service';
import { ToastService } from '../../../../core/toast/toast.service';

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
  allCategories: any[] = [];
  filteredCategories: any[] = [];
  filteredSubCategories: any[] = [];
  categories: any[] = [];
  customers: any[] = [];
  assignees: any[] = [];
  contacts: any[] = [];
  /** ticket_fields definitions */
  customFieldDefs: any[] = [];

  attachedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private ticketService: TicketService,
    private toast: ToastService
  ) {}

  get currentUser(): any {
    return this.auth.currentUserValue;
  }

  get roleSlug(): string {
    const role = this.currentUser?.role;
    if (!role) return '';
    return typeof role === 'string' ? role : role.slug || role.name || '';
  }

  get isCustomer(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const roleId = Number(user.role_id ?? user.role?.id ?? 0);
    const slug = (this.roleSlug || '').toLowerCase();
    const name = (user.role?.name || '').toLowerCase();
    return roleId === 2 || slug === 'customer' || name === 'customer';
  }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.ticketId;

    const currentUserId = Number(this.currentUser?.id) || 0;

    this.form = this.fb.group({
      id: [this.ticketId ? Number(this.ticketId) : 0],
      user_id: [this.isCustomer ? currentUserId : 0],
      contact_id: [0],
      priority_id: [0],
      status_id: [0],
      type_id: [0],
      department_id: [0],
      category_id: [0],
      sub_category_id: [0],
      assigned_to: [0],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      custom_field: this.fb.group({}),
    });

    if (!this.isEditMode) {
      if (this.isCustomer) {
        this.form.patchValue({
          user_id: currentUserId,
          assigned_to: 0,
        });
      } else {
        this.form.get('user_id')?.setValidators([Validators.required, Validators.min(1)]);
        this.form.get('user_id')?.updateValueAndValidity();
        this.form.get('priority_id')?.setValidators([Validators.required, Validators.min(1)]);
        this.form.get('priority_id')?.updateValueAndValidity();
      }
    }

    this.form.get('department_id')?.valueChanges.subscribe((deptId) => {
      this.onDepartmentChange(deptId);
    });

    this.form.get('category_id')?.valueChanges.subscribe((catId) => {
      this.onCategoryChange(catId);
    });

    this.loadData();
  }

  onDepartmentChange(deptId: any): void {
    const dId = Number(deptId) || 0;
    if (dId > 0) {
      // Find top-level categories that belong to this department (no parent_id or parent_id == 0)
      this.filteredCategories = this.allCategories.filter((c) => {
        const cDept = Number(c.department_id || c.department?.id || 0);
        const pId = Number(c.parent_id || c.parent?.id || 0);
        return cDept === dId && pId === 0;
      });
      // Fallback: If no top-level category filtered, include any category with matching department_id
      if (this.filteredCategories.length === 0) {
        this.filteredCategories = this.allCategories.filter(
          (c) => Number(c.department_id || c.department?.id || 0) === dId
        );
      }
    } else {
      this.filteredCategories = [];
    }
    this.categories = this.filteredCategories;

    // If currently selected category does not belong to filteredCategories, reset it
    const currentCatId = Number(this.form.get('category_id')?.value) || 0;
    if (!this.filteredCategories.some((c) => Number(c.id) === currentCatId)) {
      this.form.get('category_id')?.setValue(0, { emitEvent: false });
      this.filteredSubCategories = [];
      this.form.get('sub_category_id')?.setValue(0, { emitEvent: false });
    } else {
      this.onCategoryChange(currentCatId);
    }
  }

  onCategoryChange(catId: any): void {
    const cId = Number(catId) || 0;
    if (cId > 0) {
      // Subcategories are categories where parent_id matches selected category_id
      this.filteredSubCategories = this.allCategories.filter((c) => {
        const pId = Number(c.parent_id || c.parent?.id || 0);
        return pId === cId;
      });
    } else {
      this.filteredSubCategories = [];
    }

    const currentSubCatId = Number(this.form.get('sub_category_id')?.value) || 0;
    if (!this.filteredSubCategories.some((c) => Number(c.id) === currentSubCatId)) {
      this.form.get('sub_category_id')?.setValue(0, { emitEvent: false });
    }
  }

  get customFieldGroup(): FormGroup {
    return this.form.get('custom_field') as FormGroup;
  }

  fieldOptions(field: any): string[] {
    const raw = field?.options;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // comma-separated
    }
    return String(raw)
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private buildCustomFieldControls(defs: any[], values: Record<string, any> = {}): void {
    const group = this.fb.group({});
    for (const field of defs) {
      const name = field.name;
      if (!name) continue;
      const required = field.required === 1 || field.required === true || field.required === '1';
      const validators = required ? [Validators.required] : [];
      let initial: any = values[name] ?? '';
      if (field.type === 'checkbox') {
        initial = initial === true || initial === '1' || initial === 1 || initial === 'true';
      }
      group.addControl(name, new FormControl(initial, validators));
    }
    this.form.setControl('custom_field', group);
  }

  loadData(): void {
    this.loadingData = true;
    forkJoin({
      dropdowns: this.ticketService.getFormDropdowns(),
      fields: this.ticketService.getCustomFieldDefinitions({ pageSize: 200 }),
    }).subscribe({
      next: ({ dropdowns, fields }) => {
        this.priorities = dropdowns.priorities || [];
        this.statuses = dropdowns.statuses || [];
        this.types = dropdowns.types || [];
        this.departments = dropdowns.departments || [];
        this.allCategories = dropdowns.categories || [];
        this.customers = dropdowns.customers || [];
        this.assignees = dropdowns.assignees || [];
        this.contacts = dropdowns.contacts || [];
        this.customFieldDefs = fields || [];

        if (this.isEditMode && this.ticketId) {
          this.ticketService.getById(this.ticketId).subscribe({
            next: (res) => {
              const t = res?.ticket || res?.item || res;
              if (t) {
                const deptId = Number(t.department_id || t.department?.id) || 0;
                const catId = Number(t.category_id || t.category?.id) || 0;
                const subCatId = Number(t.sub_category_id || t.subCategory?.id || t.sub_category?.id) || 0;

                if (deptId > 0) {
                  this.filteredCategories = this.allCategories.filter((c) => {
                    const cDept = Number(c.department_id || c.department?.id || 0);
                    const pId = Number(c.parent_id || c.parent?.id || 0);
                    return cDept === deptId && pId === 0;
                  });
                  if (this.filteredCategories.length === 0) {
                    this.filteredCategories = this.allCategories.filter(
                      (c) => Number(c.department_id || c.department?.id || 0) === deptId
                    );
                  }
                  this.categories = this.filteredCategories;
                }
                if (catId > 0) {
                  this.filteredSubCategories = this.allCategories.filter((c) => {
                    const pId = Number(c.parent_id || c.parent?.id || 0);
                    return pId === catId;
                  });
                }

                this.form.patchValue(
                  {
                    id: Number(t.id || this.ticketId) || 0,
                    user_id: Number(t.user_id || t.user?.id) || 0,
                    contact_id: Number(t.contact_id || t.contact?.id) || 0,
                    priority_id: Number(t.priority_id || t.priority?.id) || 0,
                    status_id: Number(t.status_id || t.status?.id) || 0,
                    type_id: Number(t.type_id || t.type?.id) || 0,
                    department_id: deptId,
                    category_id: catId,
                    sub_category_id: subCatId,
                    assigned_to: Number(t.assigned_to || t.assignedTo?.id || t.assignee?.id) || 0,
                    subject: t.subject || t.title || '',
                    body: t.body || t.details || t.description || '',
                  },
                  { emitEvent: false }
                );

                const values = t.custom_field || t.custom_fields || {};
                this.buildCustomFieldControls(this.customFieldDefs, values);
              } else {
                this.buildCustomFieldControls(this.customFieldDefs);
              }
              this.loadingData = false;
            },
            error: () => {
              this.error = 'Failed to load ticket details';
              this.buildCustomFieldControls(this.customFieldDefs);
              this.loadingData = false;
            },
          });
        } else {
          const defPriority =
            this.priorities.find((p) => /generally|medium|normal/i.test(p.name || '')) ||
            this.priorities[0];
          const pendingStatus =
            this.statuses.find((s) => /pending/i.test(s.name || s.slug || '')) ||
            this.statuses.find((s) => /open|new|active/i.test(s.name || s.slug || '')) ||
            this.statuses[0];

          this.form.patchValue(
            {
              user_id: this.isCustomer ? (Number(this.currentUser?.id) || 0) : 0,
              priority_id: defPriority?.id ? Number(defPriority.id) : 0,
              status_id: pendingStatus?.id ? Number(pendingStatus.id) : 0,
              assigned_to: 0,
            },
            { emitEvent: false }
          );
          this.buildCustomFieldControls(this.customFieldDefs);
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
    if (this.isCustomer && this.currentUser?.id) {
      this.form.patchValue({
        user_id: Number(this.currentUser.id),
        assigned_to: 0,
      });
    }

    if (!this.isEditMode) {
      const pendingStatus =
        this.statuses.find((s) => /pending/i.test(s.name || s.slug || '')) ||
        this.statuses.find((s) => /open|new|active/i.test(s.name || s.slug || '')) ||
        this.statuses[0];
      if (pendingStatus?.id) {
        this.form.patchValue({ status_id: Number(pendingStatus.id) });
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';

    const raw = this.form.getRawValue();

    if (this.isEditMode) {
      this.ticketService.updateTicket(raw).subscribe({
        next: (res) => this.onSuccess(res),
        error: (err) => this.onError(err, 'Failed to update ticket'),
      });
      return;
    }

    // Create uses JSON body matching /ticket/create contract
    this.ticketService.createTicket(raw).subscribe({
      next: (res) => this.onSuccess(res),
      error: (err) => this.onError(err, 'Failed to create ticket'),
    });
  }

  private onSuccess(res?: any): void {
    this.loading = false;
    const msg =
      res?.response?.message ||
      res?.message ||
      (this.isEditMode ? 'Ticket updated successfully' : 'Ticket created successfully');
    this.toast.success(msg);
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
