import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-license',
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.scss'],
})
export class LicenseComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  error = '';

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      license_key: [{ value: '', disabled: true }],
      license_status: [{ value: 'Unknown', disabled: true }],
      licensed_to: [{ value: '', disabled: true }],
      expires_at: [{ value: '', disabled: true }],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getAll({}).subscribe({
      next: (raw) => {
        const settings = this.normalize(raw);
        this.form.patchValue({
          license_key: this.val(settings, 'license_key', this.val(settings, 'purchase_code', '')),
          license_status: this.val(settings, 'license_status', this.val(settings, 'license', 'Active')),
          licensed_to: this.val(settings, 'licensed_to', this.val(settings, 'app_name', '')),
          expires_at: this.val(settings, 'license_expires_at', this.val(settings, 'expires_at', '—')),
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load license information';
        this.loading = false;
      },
    });
  }

  private normalize(raw: any): Record<string, any> {
    const data = raw?.data ?? raw?.settings ?? raw;
    if (Array.isArray(data)) {
      const map: Record<string, any> = {};
      data.forEach((row) => {
        const key = row?.slug || row?.key;
        if (key) map[key] = row;
      });
      return map;
    }
    return data && typeof data === 'object' ? data : {};
  }

  private val(settings: Record<string, any>, key: string, fallback: any): any {
    const entry = settings[key];
    if (entry == null) return fallback;
    if (typeof entry === 'object' && 'value' in entry) return entry.value ?? fallback;
    return entry;
  }
}
