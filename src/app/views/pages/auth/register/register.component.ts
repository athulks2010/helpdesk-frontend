import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { environment } from '../../../../../environments/environment';
import { apiUrl } from '../../../../core/_config/api.config';

export interface RoleOption {
  id: number;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  loadingRoles = false;
  error = '';
  success = '';
  logoFailed = false;
  private settingsSub?: Subscription;

  // Password visibility toggles
  showPassword = false;
  showConfirmPassword = false;

  // Roles list fetched from API
  roles: RoleOption[] = [
    { id: 1, name: 'Admin', slug: 'admin' },
    { id: 2, name: 'Customer', slug: 'customer' },
    { id: 3, name: 'Agency', slug: 'agency' },
    { id: 4, name: 'Manager', slug: 'manager' },
    { id: 5, name: 'General', slug: 'general' },
    { id: 6, name: 'Agent', slug: 'agent' },
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: HttpClient,
    private router: Router,
    public settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        last_name: [''],
        email: ['', [Validators.required, Validators.email]],
        role_id: [2, [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
        password_confirmation: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.settingService.loadBrandSettings();
    this.settingsSub = this.settingService.settings$.subscribe(() => {
      this.logoFailed = false;
    });
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
    this.logoFailed = true;
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.http
      .get<any>(`${environment.apiUrl}${apiUrl.rolesAll}`)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        this.loadingRoles = false;
        const data = res?.data || res;
        if (Array.isArray(data) && data.length) {
          this.roles = data.map((r: any) => ({ id: r.id, name: r.name || r.slug, slug: r.slug }));
        }
      });
  }

  // Custom password strength validator
  passwordStrengthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const val = control.value || '';
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    if (val.length >= 8 && hasUpper && hasLower && hasNumber) return null;
    return { weakPassword: true };
  }

  // Custom cross-field password match validator
  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const pw = group.get('password')?.value;
    const conf = group.get('password_confirmation')?.value;
    return pw && conf && pw !== conf ? { passwordMismatch: true } : null;
  }

  get passwordStrength(): number {
    const val = this.form.get('password')?.value || '';
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return Math.min(score, 4);
  }

  get passwordStrengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  }

  get passwordStrengthColor(): string {
    const s = this.passwordStrength;
    if (s <= 1) return '#ef4444'; // red
    if (s === 2) return '#f59e0b'; // amber
    if (s === 3) return '#3b82f6'; // blue
    return '#10b981'; // emerald
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const payload = {
      first_name: this.f['first_name'].value,
      last_name: this.f['last_name'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      password_confirmation: this.f['password_confirmation'].value,
      role_id: Number(this.f['role_id'].value),
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created successfully! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.response?.message ||
          err?.error?.message ||
          err?.error?.errors?.[0] ||
          'Registration failed. Please try again.';
      },
    });
  }
}
