import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { getApiErrorMessage } from '../../../../core/shared/api-error.util';

@Component({
  selector: 'app-piping-settings',
  templateUrl: './piping-settings.component.html',
  styleUrls: ['./piping-settings.component.scss'],
})
export class PipingSettingsComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  testing = false;
  showPassword = false;
  error = '';
  success = '';
  testResult: { success: boolean; message: string } | null = null;
  vpsCron = '';
  sharedCron = '';

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    const base = (environment.apiUrl || '').replace(/\/$/, '') || 'http://127.0.0.1:8000';
    this.vpsCron = `*/3 * * * * /usr/bin/php ${base}/artisan command:piping_email`;
    this.sharedCron = `*/3 * * * * wget -q -O - ${base}/cron/piping >/dev/null 2>&1`;

    this.form = this.fb.group({
      enabled: [false],
      host: [''],
      port: [993],
      protocol: ['imap'],
      username: [''],
      password: [''],
      encryption: ['ssl'],
    });
    this.load();
  }

  private asBool(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      return v === '1' || v === 'true' || v === 'yes' || v === 'on';
    }
    return !!value;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getPiping().subscribe({
      next: (raw) => {
        const item = raw?.item ?? raw?.data?.item ?? raw?.data ?? raw ?? {};
        const enabled = this.asBool(
          item.enabled ?? item.imap_enabled ?? item.IMAP_ENABLED ?? item.value
        );
        this.form.patchValue({
          enabled,
          host: item.imap_host ?? item.host ?? item.IMAP_HOST ?? '',
          port: Number(item.imap_port ?? item.port ?? item.IMAP_PORT ?? 993) || 993,
          protocol: item.imap_protocol ?? item.protocol ?? item.IMAP_PROTOCOL ?? 'imap',
          username: item.imap_username ?? item.username ?? item.user ?? item.IMAP_USERNAME ?? '',
          password: item.imap_password ?? item.password ?? item.IMAP_PASSWORD ?? '',
          encryption: item.imap_encryption ?? item.encryption ?? item.IMAP_ENCRYPTION ?? 'ssl',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load piping settings';
        this.loading = false;
      },
    });
  }

  private toApiBody(value: any, enabledOverride?: boolean): Record<string, any> {
    const enabled = enabledOverride !== undefined ? enabledOverride : !!value.enabled;
    if (!enabled) {
      return {
        enabled: false,
        imap_enabled: false,
        imap_host: '',
        imap_port: '',
        imap_protocol: '',
        imap_username: '',
        imap_password: '',
        imap_encryption: '',
      };
    }
    return {
      enabled: true,
      imap_enabled: true,
      imap_host: value.host ?? '',
      imap_port: String(value.port ?? ''),
      imap_protocol: value.protocol ?? '',
      imap_username: value.username ?? '',
      imap_password: value.password ?? '',
      imap_encryption: value.encryption ?? '',
    };
  }

  onToggleEnabled(): void {
    if (this.saving) return;
    const next = !this.form.get('enabled')?.value;

    if (next) {
      this.form.patchValue({ enabled: true });
      this.error = '';
      this.success = '';
      return;
    }

    this.form.patchValue({ enabled: false });
    this.saving = true;
    this.error = '';
    this.success = '';
    this.testResult = null;

    this.settingService.updatePiping(this.toApiBody(this.form.getRawValue(), false)).subscribe({
      next: () => {
        this.saving = false;
        this.form.patchValue({
          host: '',
          port: '',
          protocol: '',
          username: '',
          password: '',
          encryption: '',
        });
        this.success = 'Email piping disabled';
      },
      error: (err) => {
        this.saving = false;
        this.form.patchValue({ enabled: true });
        this.error = getApiErrorMessage(err, 'Failed to disable piping');
      },
    });
  }

  save(): void {
    if (!this.form.get('enabled')?.value) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    this.settingService.updatePiping(this.toApiBody(this.form.getRawValue(), true)).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Piping settings saved';
      },
      error: (err) => {
        this.saving = false;
        this.error = getApiErrorMessage(err, 'Save failed');
      },
    });
  }

  test(): void {
    if (!this.form.get('enabled')?.value) return;
    this.testing = true;
    this.testResult = null;
    this.settingService.testPiping(this.toApiBody(this.form.getRawValue(), true)).subscribe({
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
          message: getApiErrorMessage(err, 'Connection failed'),
        };
      },
    });
  }
}
