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
  showPassword = false;
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

  private extractItem(raw: any): any {
    return raw?.item ?? raw?.data?.item ?? raw?.data ?? raw ?? {};
  }

  private toApiBody(value: any): Record<string, any> {
    return {
      mail_host: value.host,
      mail_port: String(value.port ?? ''),
      mail_username: value.username,
      mail_password: value.password,
      mail_encryption: value.encryption,
      mail_from_address: value.from_address,
      mail_from_name: value.from_name,
    };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getSmtp().subscribe({
      next: (raw) => {
        const item = this.extractItem(raw);
        this.form.patchValue({
          host: item.mail_host ?? item.host ?? item.MAIL_HOST ?? '',
          port: Number(item.mail_port ?? item.port ?? item.MAIL_PORT ?? 587),
          username: item.mail_username ?? item.username ?? item.MAIL_USERNAME ?? '',
          password: item.mail_password ?? item.password ?? item.MAIL_PASSWORD ?? '',
          encryption: item.mail_encryption ?? item.encryption ?? item.MAIL_ENCRYPTION ?? 'tls',
          from_address: item.mail_from_address ?? item.from_address ?? item.MAIL_FROM_ADDRESS ?? '',
          from_name: item.mail_from_name ?? item.from_name ?? item.MAIL_FROM_NAME ?? '',
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
    this.settingService.updateSmtp(this.toApiBody(this.form.getRawValue())).subscribe({
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
    this.settingService.testSmtp(this.toApiBody(this.form.getRawValue())).subscribe({
      next: (res) => {
        this.testing = false;
        this.testResult = {
          success: res?.success !== false && res?.response?.status !== 'ERROR',
          message: res?.message || res?.response?.message || 'Connection successful',
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
