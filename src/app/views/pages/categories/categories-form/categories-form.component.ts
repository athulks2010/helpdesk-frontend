import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../core/category/_services/category.service';
import { DepartmentService } from '../../../../core/department/_services/department.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss'],
})
export class CategoriesFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  departments: any[] = [];
  parents: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: CategoryService,
    private departmentService: DepartmentService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;
    const presetDepartmentId = this.route.snapshot.queryParamMap.get('department_id');

    this.form = this.fb.group({
      id: [this.entityId],
      department_id: [presetDepartmentId || ''],
      parent_id: [''],
      name: ['', Validators.required],
      color: ['#3b82f6'],
    });

    this.loadExtras();

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            department_id: item.department_id ?? null,
            parent_id: item.parent_id ?? null,
            name: item.name ?? null,
            color: item.color || '#3b82f6',
          });

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load category';
          this.loadingData = false;
        },
      });
    }
  }

  loadExtras(): void {
    this.departmentService.getAll().subscribe({ next: (d) => { this.departments = Array.isArray(d) ? d : (d?.items || d?.list || []); } });
    this.service.getAll().subscribe({ next: (d) => { this.parents = Array.isArray(d) ? d : (d?.items || d?.list || []); } });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };
    if (!this.isEditMode) {
      delete raw.color;
    }

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: (res) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Category updated successfully' : 'Category created successfully');
        this.toast.success(msg);
        const departmentId = raw.department_id;
        this.router.navigate(['/categories'], {
          queryParams: departmentId ? { department_id: departmentId } : {},
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    const departmentId = this.form.get('department_id')?.value;
    this.router.navigate(['/categories'], {
      queryParams: departmentId ? { department_id: departmentId } : {},
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
