import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/user/_services/user.service';


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


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService
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
      password: [''],
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
          password: item.password ?? null,
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
    // no extras
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };
    raw.role = 'customer';

    if (!raw.password) {
      delete raw.password;
    }

    const req$ = this.isEditMode
      ? this.service.updateUser(raw)
      : this.service.createUser(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
