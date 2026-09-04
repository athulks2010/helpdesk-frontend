import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KnowledgeBaseService } from '../../../../core/knowledge-base/_services/knowledge-base.service';

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
    private router: Router
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

  applyFilter(): void {
    const q = (this.search || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.rows];
      return;
    }
    this.filtered = this.rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(q)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  createNew(): void {
    this.router.navigate(['/knowledge-base/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/knowledge-base', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm('Delete this article? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
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
