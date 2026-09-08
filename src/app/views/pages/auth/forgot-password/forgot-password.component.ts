import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  error = '';
  success = '';
  logoFailed = false;
  private settingsSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.settingService.loadBrandSettings();
    this.settingsSub = this.settingService.settings$.subscribe(() => {
      this.logoFailed = false;
    });
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
    this.logoFailed = true;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'If that email exists, a reset link has been sent.';
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.response?.message ||
          err?.error?.message ||
          'Unable to send reset email';
      },
    });
  }
}
