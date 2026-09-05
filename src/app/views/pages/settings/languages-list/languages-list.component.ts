import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  error = '';
  deletingId: any = null;

  Math = Math;
  currentPage = 1;
  totalCount = 0;
  totalPages = 1;
  pages: number[] = [];

  constructor(
    private settingService: SettingService,
    private confirmService: ConfirmDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getLanguages().subscribe({
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

  createNew(): void {
    this.router.navigate(['/settings/languages/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/settings/languages', id, 'edit']);
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

    this.deletingId = id;
    this.settingService.deleteLanguage(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete language';
      },
    });
  }
}
