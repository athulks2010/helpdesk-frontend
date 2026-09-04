import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-languages-list',
  templateUrl: './languages-list.component.html',
  styleUrls: ['./languages-list.component.scss'],
})
export class LanguagesListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  search = '';
  pageSize = 10;
  loading = true;
  saving = false;
  error = '';
  editingId: string | number | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private confirmService: ConfirmDialogService
  ) {}

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
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load languages';
        this.loading = false;
      },
    });
  }

  Math = Math;
  currentPage = 1;
  totalCount = 0;
  totalPages = 1;
  pages: number[] = [];

  applyFilter(): void {
    const q = (this.search || '').toLowerCase().trim();
    let res = this.rows;
    if (q) {
      res = this.rows.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(q)
      );
    }
    this.totalCount = res.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize)));
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * Number(this.pageSize);
    this.filtered = res.slice(start, start + Number(this.pageSize));
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilter();
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

  async remove(row: any): Promise<void> {
    const id = row.id || row._id;
    if (!id) return;
    const name = row.name || row.code || 'this language';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Language',
      message: 'Are you sure you want to delete this language?',
      itemName: `${name}`,
      confirmText: 'Delete Language',
      type: 'danger',
    });
    if (!confirmed) return;

    this.settingService.deleteLanguage(id).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete language'),
    });
  }
}
