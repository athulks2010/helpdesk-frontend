import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FaqService } from '../../../../core/faq/_services/faq.service';

@Component({
  selector: 'app-faqs-list',
  templateUrl: './faqs-list.component.html',
  styleUrls: ['./faqs-list.component.scss'],
})
export class FaqsListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  statusFilter = '';
  deletingId: string | number | null = null;

  constructor(
    private service: FaqService,
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
        this.error = 'Failed to load faqs';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = (this.search || '').toLowerCase().trim();
    let list = [...this.rows];

    if (this.statusFilter === 'active') {
      list = list.filter((row) => this.isActive(row));
    } else if (this.statusFilter === 'inactive') {
      list = list.filter((row) => !this.isActive(row));
    }

    if (q) {
      list = list.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
    }

    this.filtered = list;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  createNew(): void {
    this.router.navigate(['/faqs/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/faqs', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm('Delete this faq? This can usually be restored from the API if soft-delete is enabled.')) {
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
        this.error = 'Failed to delete faq';
      },
    });
  }

  cell(row: any, key: string): any {
    if (!key.includes('.')) return row?.[key];
    return key.split('.').reduce((acc: any, k: string) => (acc == null ? null : acc[k]), row);
  }

  isActive(row: any): boolean {
    const s = row?.status;
    if (s === 0 || s === false || s === '0' || s === 'inactive' || s === 'Inactive' || s === 'draft' || s === 'Draft') {
      return false;
    }
    return true;
  }

  plainText(value: any): string {
    if (!value) return '';
    return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
