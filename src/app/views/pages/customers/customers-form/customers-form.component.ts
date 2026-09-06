import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/user/_services/user.service';
import { FileUploadService } from '../../../../core/shared/file-upload.service';


import { CountryService, CountryItem } from '../../../../core/country/_services/country.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-customers-form',
  templateUrl: './customers-form.component.html',
  styleUrls: ['./customers-form.component.scss'],
})
export class CustomersFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  showPassword = false;
  countries: CountryItem[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
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
      email: ['', Validators.required],
      phone: [''],
      city: [''],
      address: [''],
      country: [null],
      password: [''],
      photo_path: [''],
    });

    // Customers are users with customer role (Laravel parity)
    // role_id may be set by API from slug; keep password optional on edit.

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
            country: item.country_id ? +item.country_id : (item.country ? +item.country : null),
            password: item.password ?? null,
            photo_path: item.photo_path ?? item.photo ?? null,
          });
          // Password not required when editing
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.updateValueAndValidity();

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load customer';
          this.loadingData = false;
        },
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  loadExtras(): void {
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
    this.fileUpload.upload(file, 'customers').subscribe({
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
    // Pass role_id for customer role (role_id = 2)
    if (!this.isEditMode) {
      raw.role_id = 2;
      raw.is_active = true;
    }
    delete raw.role;

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
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Customer updated successfully' : 'Customer created successfully');
        this.toast.success(msg);
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          (Array.isArray(err?.error?.errors) ? err.error.errors[0] : null) ||
          err?.statusText ||
          'Save failed';
        this.error = msg;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }

  goToTickets(): void {
    this.router.navigate(['/tickets'], {
      queryParams: { user_id: this.entityId },
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
