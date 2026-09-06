import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { getApiErrorMessage } from '../../../../core/shared/api-error.util';
import { ToastService } from '../../../../core/toast/toast.service';

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
  showSecret = false;
  error = '';
  success = '';
  testResult: { success: boolean; message: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private toast: ToastService
  ) {}

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
        const item = raw?.item ?? raw?.data?.item ?? raw?.data ?? raw ?? {};
        this.form.patchValue({
          app_id: item.pusher_app_id ?? item.app_id ?? item.PUSHER_APP_ID ?? '',
          key: item.pusher_app_key ?? item.key ?? item.PUSHER_APP_KEY ?? '',
          secret: item.pusher_app_secret ?? item.secret ?? item.PUSHER_APP_SECRET ?? '',
          cluster: item.pusher_app_cluster ?? item.cluster ?? item.PUSHER_APP_CLUSTER ?? 'mt1',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load Pusher settings';
        this.loading = false;
      },
    });
  }

  private toApiBody(value: any): Record<string, any> {
    return {
      pusher_app_id: value.app_id,
      pusher_app_key: value.key,
      pusher_app_secret: value.secret,
      pusher_app_cluster: value.cluster,
    };
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.settingService.updatePusher(this.toApiBody(this.form.getRawValue())).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.success = 'Pusher settings saved';
        this.toast.success(res?.response?.message || res?.message || 'Pusher settings saved successfully');
      },
      error: (err) => {
        this.saving = false;
        this.error = getApiErrorMessage(err, 'Save failed');
      },
    });
  }

  test(): void {
    this.testing = true;
    this.testResult = null;
    this.settingService.testPusher(this.toApiBody(this.form.getRawValue())).subscribe({
      next: (res) => {
        this.testing = false;
        const ok = res?.success !== false && res?.response?.status !== 'ERROR';
        const msg = res?.message || res?.response?.message || 'Connection successful';
        this.testResult = {
          success: ok,
          message: msg,
        };
        if (ok) {
          this.toast.success(msg);
        } else {
          this.toast.warning(msg);
        }
      },
      error: (err) => {
        this.testing = false;
        const msg = getApiErrorMessage(err, 'Connection failed');
        this.testResult = {
          success: false,
          message: msg,
        };
      },
    });
  }
}
