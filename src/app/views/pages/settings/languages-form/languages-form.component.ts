import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-languages-form',
  templateUrl: './languages-form.component.html',
  styleUrls: ['./languages-form.component.scss'],
})
export class LanguagesFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      name: ['', Validators.required],
      code: ['', Validators.required],
      status: [true],
    });

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.settingService.getLanguages().subscribe({
        next: (data) => {
          const rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
          const item = rows.find((row: any) => String(row.id || row._id) === String(this.entityId));
          if (!item) {
            this.error = 'Language not found';
            this.loadingData = false;
            return;
          }
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            name: item.name || '',
            code: item.code || '',
            status: item.status !== 0 && item.status !== false,
          });
          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load language';
          this.loadingData = false;
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = this.form.getRawValue();
    const body = { ...raw, status: raw.status ? 1 : 0 };
    const req$ = this.isEditMode
      ? this.settingService.updateLanguage(body)
      : this.settingService.createLanguage(body);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/settings/languages']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/settings/languages']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
