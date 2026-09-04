import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/_services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
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
