import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

export interface LanguagePhraseItem {
  name: string;
  value: string;
  original_name?: string;
}

@Component({
  selector: 'app-languages-form',
  templateUrl: './languages-form.component.html',
  styleUrls: ['./languages-form.component.scss'],
})
export class LanguagesFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  saving = false;
  deleting = false;
  error = '';
  saveSuccess = false;
  isEditMode = false;
  entityId: string | null = null;

  // Language info
  languageData = {
    id: '',
    name: '',
    code: '',
    status: true,
  };

  // Phrases list
  languageValues: LanguagePhraseItem[] = [];
  filteredValues: LanguagePhraseItem[] = [];
  searchQuery = '';

  // Pagination
  Math = Math;
  currentPage = 1;
  pageSize = 50;
  pageSizeOptions = [25, 50, 100, 200];
  totalCount = 0;
  totalPages = 1;
  pages: number[] = [];

  // Add Phrase Modal
  newLangFormOpen = false;
  newPhrase = {
    en: '',
    target: '',
  };
  newPhraseError = '';

  allLanguages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingService: SettingService,
    private confirmService: ConfirmDialogService
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
      this.loadLanguageData();
    }
  }

  loadLanguageData(): void {
    this.loadingData = true;
    this.error = '';

    this.settingService.getLanguages().subscribe({
      next: (data) => {
        const rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        this.allLanguages = rows;
        const item = rows.find(
          (row: any) => String(row.id || row._id) === String(this.entityId)
        );

        if (!item) {
          this.error = 'Language not found';
          this.loadingData = false;
          return;
        }

        this.languageData = {
          id: item.id || item._id || this.entityId,
          name: item.name || '',
          code: item.code || '',
          status: item.status !== 0 && item.status !== false && item.status !== '0',
        };

        this.form.patchValue({
          id: this.languageData.id,
          name: this.languageData.name,
          code: this.languageData.code,
          status: this.languageData.status,
        });

        this.loadTranslations(this.languageData.code, this.languageData.id);
      },
      error: () => {
        this.error = 'Failed to load language details';
        this.loadingData = false;
      },
    });
  }

  loadTranslations(code: string, id?: string): void {
    this.loadingData = true;
    const langCode = (code || '').toLowerCase().trim();

    this.settingService.getLanguageTranslations({ code: langCode, id }).subscribe({
      next: (res: any) => {
        let entries: LanguagePhraseItem[] = [];

        if (Array.isArray(res?.language_values)) {
          entries = res.language_values.map((item: any) => ({
            name: item.name,
            value: item.value,
            original_name: item.original_name || item.name,
          }));
        } else if (res?.translations && typeof res.translations === 'object') {
          for (const key of Object.keys(res.translations)) {
            entries.push({
              name: key,
              value: res.translations[key] !== undefined && res.translations[key] !== null ? String(res.translations[key]) : '',
              original_name: key,
            });
          }
        }

        this.languageValues = entries;
        this.loadingData = false;
        this.applyFilter();
      },
      error: () => {
        this.error = 'Failed to load translations from server';
        this.loadingData = false;
      },
    });
  }

  applyFilter(): void {
    const q = (this.searchQuery || '').toLowerCase().trim();
    let res = this.languageValues;

    if (q) {
      res = this.languageValues.filter((item) =>
        item.name.toLowerCase().includes(q) || item.value.toLowerCase().includes(q)
      );
    }

    this.totalCount = res.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize)));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.generatePagination();

    const start = (this.currentPage - 1) * Number(this.pageSize);
    this.filteredValues = res.slice(start, start + Number(this.pageSize));
  }

  generatePagination(): void {
    const current = this.currentPage;
    const total = this.totalPages;
    const maxButtons = 5;

    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    this.pages = pages;
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

  // --- Add New Phrase Modal ---
  addNew(): void {
    this.newPhrase = {
      en: '',
      target: '',
    };
    this.newPhraseError = '';
    this.newLangFormOpen = true;
  }

  closeNewModal(): void {
    this.newLangFormOpen = false;
    this.newPhraseError = '';
  }

  storeNewPhrase(): void {
    const enText = (this.newPhrase.en || '').trim();
    const targetText = (this.newPhrase.target || '').trim();

    if (!enText) {
      this.newPhraseError = 'Please input text for English!';
      return;
    }

    if (!targetText) {
      this.newPhraseError = `Please input text for the ${this.languageData.name || 'target'} language!`;
      return;
    }

    this.saving = true;
    this.newPhraseError = '';

    this.settingService
      .addLanguagePhrase({
        code: this.languageData.code,
        id: this.languageData.id || this.entityId,
        key: enText,
        value: targetText,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          const existingIndex = this.languageValues.findIndex(
            (item) => item.name.toLowerCase() === enText.toLowerCase()
          );

          if (existingIndex >= 0) {
            this.languageValues[existingIndex].value = targetText;
          } else {
            this.languageValues.unshift({
              name: enText,
              value: targetText,
              original_name: enText,
            });
          }

          this.newLangFormOpen = false;
          this.applyFilter();
          this.showSaveBanner();
        },
        error: (err: any) => {
          this.saving = false;
          this.newPhraseError = err?.error?.response?.message || err?.error?.message || err?.message || 'Failed to add phrase';
        },
      });
  }

  // --- Delete Phrase ---
  async destroy(item: LanguagePhraseItem): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Translation Phrase',
      message: 'Are you sure you want to delete this language data?',
      itemName: item.name,
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!confirmed) return;

    this.settingService
      .deleteLanguagePhrase({
        code: this.languageData.code,
        id: this.languageData.id || this.entityId,
        key: item.name,
      })
      .subscribe({
        next: () => {
          this.languageValues = this.languageValues.filter((x) => x !== item && x.name !== item.name);
          this.applyFilter();
          this.showSaveBanner();
        },
        error: (err: any) => {
          this.error = err?.error?.response?.message || err?.error?.message || err?.message || 'Failed to delete phrase';
        },
      });
  }

  // --- Save / Update ---
  update(): void {
    this.saving = true;
    this.error = '';
    this.saveSuccess = false;

    const formVal = this.form.getRawValue();
    const body = {
      ...formVal,
      id: this.languageData.id || this.entityId,
      code: this.languageData.code,
      status: formVal.status ? 1 : 0,
      language_values: this.languageValues,
    };

    this.settingService.updateLanguage(body).subscribe({
      next: () => {
        this.saving = false;
        this.languageData.name = formVal.name;
        this.languageData.code = formVal.code;
        for (const item of this.languageValues) {
          item.original_name = item.name;
        }
        this.showSaveBanner();
      },
      error: (err: any) => {
        this.saving = false;
        this.error = err?.error?.response?.message || err?.error?.message || err?.message || 'Failed to update language';
      },
    });
  }

  submit(): void {
    if (this.isEditMode) {
      this.update();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const raw = this.form.getRawValue();
    const body = {
      name: raw.name,
      code: (raw.code || '').toLowerCase().trim(),
      status: raw.status ? 1 : 0,
    };

    this.settingService.createLanguage(body).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/settings/languages']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.response?.message || err?.error?.message || err?.message || 'Failed to create language';
      },
    });
  }

  showSaveBanner(): void {
    this.saveSuccess = true;
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3500);
  }

  exportJson(): void {
    const dict: Record<string, string> = {};
    for (const item of this.languageValues) {
      dict[item.name] = item.value;
    }
    const blob = new Blob([JSON.stringify(dict, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.languageData.code || 'language'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  cancel(): void {
    this.router.navigate(['/settings/languages']);
  }

  goToGlobalSettings(): void {
    this.router.navigate(['/settings/global']);
  }

  async removeLanguage(): Promise<void> {
    if (!this.entityId) return;
    const name = this.languageData.name || this.languageData.code || 'this language';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Language',
      message: 'Are you sure you want to delete this language?',
      itemName: `${name}`,
      confirmText: 'Delete Language',
      type: 'danger',
    });
    if (!confirmed) return;

    this.deleting = true;
    this.error = '';
    this.settingService.deleteLanguage(this.entityId).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/settings/languages']);
      },
      error: () => {
        this.deleting = false;
        this.error = 'Failed to delete language';
      },
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
