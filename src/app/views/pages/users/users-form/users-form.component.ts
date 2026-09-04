import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/user/_services/user.service';
import { RoleService } from '../../../../core/role/_services/role.service';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
})
export class UsersFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  roles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      city: [''],
      address: [''],
      role_id: ['', Validators.required],
      password: [''],
    });


    this.loadExtras();

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
          first_name: item.first_name ?? null,
          last_name: item.last_name ?? null,
          email: item.email ?? null,
          phone: item.phone ?? null,
          city: item.city ?? null,
          address: item.address ?? null,
          role_id: item.role_id ?? null,
          password: item.password ?? null,
          });
          // Password not required when editing
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.updateValueAndValidity();

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load user';
          this.loadingData = false;
        },
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  loadExtras(): void {
    this.roleService.getAll().subscribe({ next: (d) => { this.roles = Array.isArray(d) ? d : (d?.items || d?.list || []); } });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };

    if (!raw.password) {
      delete raw.password;
    }

    const req$ = this.isEditMode
      ? this.service.updateUser(raw)
      : this.service.createUser(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
