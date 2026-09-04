import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-piping-settings',
  templateUrl: './piping-settings.component.html',
  styleUrls: ['./piping-settings.component.scss'],
})
export class PipingSettingsComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      enabled: [false],
      host: [''],
      port: [993],
      username: [''],
      password: [''],
      encryption: ['ssl'],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getPiping().subscribe({
      next: (raw) => {
        const data = raw?.data ?? raw ?? {};
        this.form.patchValue({
          enabled: !!(data.enabled ?? data.IMAP_ENABLED ?? data.value),
          host: data.host ?? data.IMAP_HOST ?? '',
          port: Number(data.port ?? data.IMAP_PORT ?? 993),
          username: data.username ?? data.user ?? data.IMAP_USERNAME ?? '',
          password: data.password ?? data.IMAP_PASSWORD ?? '',
          encryption: data.encryption ?? data.IMAP_ENCRYPTION ?? 'ssl',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load piping settings';
        this.loading = false;
      },
    });
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    this.settingService.updatePiping(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Piping settings saved';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }
}
