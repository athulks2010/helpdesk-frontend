import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../../../../core/department/_services/department.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-departments-form',
  templateUrl: './departments-form.component.html',
  styleUrls: ['./departments-form.component.scss'],
})
export class DepartmentsFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  deleting = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: DepartmentService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      name: ['', Validators.required],
    });

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            name: item.name ?? null,
          });
          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load department';
          this.loadingData = false;
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Department updated successfully' : 'Department created successfully');
        this.toast.success(msg);
        this.router.navigate(['/departments']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  remove(): void {
    if (!this.entityId) return;
    if (!confirm('Delete this department? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
    this.deleting = true;
    this.error = '';
    this.service.deleteById(this.entityId).subscribe({
      next: (res: any) => {
        this.deleting = false;
        const msg = res?.response?.message || res?.message || 'Department deleted successfully';
        this.toast.success(msg);
        this.router.navigate(['/departments']);
      },
      error: () => {
        this.deleting = false;
        this.error = 'Failed to delete department';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/departments']);
  }

  goToAgents(): void {
    this.router.navigate(['/users']);
  }

  goToCategories(): void {
    this.router.navigate(['/categories'], {
      queryParams: { department_id: this.entityId },
    });
  }

  goToTickets(): void {
    this.router.navigate(['/tickets'], {
      queryParams: { department_id: this.entityId },
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
