import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/user/_services/user.service';
import { RoleService } from '../../../../core/role/_services/role.service';
import { FileUploadService } from '../../../../core/shared/file-upload.service';
import { CountryService, CountryItem } from '../../../../core/country/_services/country.service';
import { ToastService } from '../../../../core/toast/toast.service';

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
  countries: CountryItem[] = [];
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
    private roleService: RoleService,
    private fileUpload: FileUploadService,
    private countryService: CountryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      country: [null],
      city: [''],
      role_id: ['', Validators.required],
      password: [''],
      photo_path: [''],
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
            address: item.address ?? null,
            country: item.country_id ? +item.country_id : (item.country ? +item.country : null),
            city: item.city ?? null,
            role_id: item.role_id ?? null,
            password: item.password ?? null,
            photo_path: item.photo_path ?? item.photo ?? null,
          });
          // Password not required when editing
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.updateValueAndValidity();

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load user details';
          this.loadingData = false;
        },
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  loadExtras(): void {
    this.roleService.getAll().subscribe({
      next: (d) => {
        this.roles = Array.isArray(d) ? d : d?.items || d?.list || [];
      },
    });
    this.countryService.getAll().subscribe({
      next: (items) => {
        this.countries = items;
      },
      error: (err) => {
        console.error('Failed to load countries', err);
      },
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.fileUpload.upload(file, 'users').subscribe({
      next: (path: string) => {
        if (path) {
          this.form.patchValue({ photo_path: path });
        }
      },
      error: (err: any) => {
        console.error('File upload failed', err);
        this.error = 'Failed to upload photo';
      },
    });
  }

  getPhotoUrl(): string {
    return this.fileUpload.resolveUrl(this.form.get('photo_path')?.value);
  }

  getFileName(): string {
    return this.fileUpload.getFileName(this.form.get('photo_path')?.value);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };

    if (raw.country) {
      raw.country = +raw.country;
      raw.country_id = +raw.country;
    }

    if (!raw.password) {
      delete raw.password;
    }

    const req$ = this.isEditMode
      ? this.service.updateUser(raw)
      : this.service.createUser(raw);

    req$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'User updated successfully' : 'User created successfully');
        this.toast.success(msg);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.response?.message ||
          err?.error?.message ||
          err?.error?.error ||
          (Array.isArray(err?.error?.errors) ? err.error.errors[0] : null) ||
          err?.statusText ||
          'Save failed';
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
