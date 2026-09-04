import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-pusher-settings',
  templateUrl: './pusher-settings.component.html',
  styleUrls: ['./pusher-settings.component.scss'],
})
export class PusherSettingsComponent implements OnInit {
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
      app_id: ['', Validators.required],
      key: ['', Validators.required],
      secret: ['', Validators.required],
      cluster: ['mt1', Validators.required],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getPusher().subscribe({
      next: (raw) => {
        const data = raw?.data ?? raw ?? {};
        this.form.patchValue({
          app_id: data.app_id ?? data.PUSHER_APP_ID ?? '',
          key: data.key ?? data.PUSHER_APP_KEY ?? '',
          secret: data.secret ?? data.PUSHER_APP_SECRET ?? '',
          cluster: data.cluster ?? data.PUSHER_APP_CLUSTER ?? 'mt1',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load Pusher settings';
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
    this.settingService.updatePusher(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Pusher settings saved';
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
    this.settingService.testPusher(this.form.getRawValue()).subscribe({
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
