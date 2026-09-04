import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PriorityService } from '../../../../core/priority/_services/priority.service';

@Component({
  selector: 'app-priorities-list',
  templateUrl: './priorities-list.component.html',
  styleUrls: ['./priorities-list.component.scss'],
})
export class PrioritiesListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  deletingId: string | number | null = null;

  constructor(
    private service: PriorityService,
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
        this.error = 'Failed to load priorities';
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
    this.router.navigate(['/priorities/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/priorities', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm('Delete this priority? This can usually be restored from the API if soft-delete is enabled.')) {
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
        this.error = 'Failed to delete priority';
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
