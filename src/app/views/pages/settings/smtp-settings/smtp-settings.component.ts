import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-smtp-settings',
  templateUrl: './smtp-settings.component.html',
  styleUrls: ['./smtp-settings.component.scss'],
})
export class SmtpSettingsComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  testing = false;
  error = '';
  success = '';
  testResult: { success: boolean; message: string } | null = null;

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      host: ['', Validators.required],
      port: [587, Validators.required],
      username: [''],
      password: [''],
      encryption: ['tls'],
      from_address: [''],
      from_name: [''],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getSmtp().subscribe({
      next: (raw) => {
        const data = raw?.data ?? raw ?? {};
        this.form.patchValue({
          host: data.host ?? data.MAIL_HOST ?? '',
          port: Number(data.port ?? data.MAIL_PORT ?? 587),
          username: data.username ?? data.MAIL_USERNAME ?? '',
          password: data.password ?? data.MAIL_PASSWORD ?? '',
          encryption: data.encryption ?? data.MAIL_ENCRYPTION ?? 'tls',
          from_address: data.from_address ?? data.MAIL_FROM_ADDRESS ?? '',
          from_name: data.from_name ?? data.MAIL_FROM_NAME ?? '',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load SMTP settings';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.settingService.updateSmtp(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'SMTP settings saved';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  test(): void {
    this.testing = true;
    this.testResult = null;
    this.settingService.testSmtp(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.testing = false;
        this.testResult = {
          success: res?.success !== false,
          message: res?.message || 'Connection successful',
        };
      },
      error: (err) => {
        this.testing = false;
        this.testResult = {
          success: false,
          message: err?.error?.message || err?.message || 'Connection failed',
        };
      },
    });
  }
}
