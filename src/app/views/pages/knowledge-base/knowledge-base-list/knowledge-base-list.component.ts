import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KnowledgeBaseService } from '../../../../core/knowledge-base/_services/knowledge-base.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-knowledge-base-list',
  templateUrl: './knowledge-base-list.component.html',
  styleUrls: ['./knowledge-base-list.component.scss'],
})
export class KnowledgeBaseListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  deletingId: string | number | null = null;

  constructor(
    private service: KnowledgeBaseService,
    private router: Router,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll({}).subscribe({
      next: (data: any) => {
        this.rows = Array.isArray(data) ? data : (data?.items || data?.list || data?.data || []);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load knowledge base';
        this.loading = false;
      },
    });
  }

  Math = Math;
  pageSize = 10;
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

  createNew(): void {
    this.router.navigate(['/knowledge-base/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/knowledge-base', id, 'edit']);
  }

  async remove(row: any): Promise<void> {
    const id = row.id || row._id;
    if (!id) return;
    const name = row.name || row.title || 'this article';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Article',
      message: 'Are you sure you want to delete this article? This can usually be restored from the API if soft-delete is enabled.',
      itemName: `${name}`,
      confirmText: 'Delete Article',
      type: 'danger',
    });
    if (!confirmed) return;

    this.deletingId = id;
    this.service.deleteById(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete article';
      },
    });
  }

  cell(row: any, key: string): any {
    if (!key.includes('.')) return row?.[key];
    return key.split('.').reduce((acc: any, k: string) => (acc == null ? null : acc[k]), row);
  }

  formatDate(value: any): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
}
