import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-languages-list',
  templateUrl: './languages-list.component.html',
  styleUrls: ['./languages-list.component.scss'],
})
export class LanguagesListComponent implements OnInit {
  rows: any[] = [];
  loading = true;
  saving = false;
  error = '';
  editingId: string | number | null = null;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code: ['', Validators.required],
      status: [1],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getLanguages({}).subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load languages';
        this.loading = false;
      },
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({ id: null, name: '', code: '', status: 1 });
  }

  startEdit(row: any): void {
    this.editingId = row.id || row._id;
    this.form.patchValue({
      id: this.editingId,
      name: row.name || '',
      code: row.code || '',
      status: row.status ?? 1,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const body = this.form.getRawValue();
    const req$ = this.editingId
      ? this.settingService.updateLanguage(body)
      : this.settingService.createLanguage(body);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.startCreate();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id || !confirm('Delete this language?')) return;
    this.settingService.deleteLanguage(id).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete language'),
    });
  }
}
