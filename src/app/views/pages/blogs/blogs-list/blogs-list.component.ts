import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../../core/blog/_services/blog.service';
import { TypeService } from '../../../../core/type/_services/type.service';

@Component({
  selector: 'app-blogs-list',
  templateUrl: './blogs-list.component.html',
  styleUrls: ['./blogs-list.component.scss'],
})
export class BlogsListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  types: any[] = [];
  loading = true;
  error = '';
  search = '';
  typeFilter: string | number = '';
  statusFilter = '';
  deletingId: string | number | null = null;

  constructor(
    private service: BlogService,
    private typeService: TypeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
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
        this.error = 'Failed to load blog posts';
        this.loading = false;
      },
    });
  }

  loadTypes(): void {
    this.typeService.getAll().subscribe({
      next: (d) => {
        this.types = Array.isArray(d) ? d : (d?.items || d?.list || d?.data || []);
      },
    });
  }

  applyFilter(): void {
    const q = (this.search || '').toLowerCase().trim();
    let list = [...this.rows];

    if (this.typeFilter !== '' && this.typeFilter != null) {
      list = list.filter((row) => {
        const id = row.type_id ?? row.type?.id ?? row.type?._id;
        return String(id) === String(this.typeFilter);
      });
    }

    if (this.statusFilter === 'published') {
      list = list.filter((row) => this.isActive(row));
    } else if (this.statusFilter === 'draft') {
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
    this.router.navigate(['/blogs/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/blogs', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm('Delete this blog post? This can usually be restored from the API if soft-delete is enabled.')) {
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
        this.error = 'Failed to delete blog post';
      },
    });
  }

  cell(row: any, key: string): any {
    if (!key.includes('.')) return row?.[key];
    return key.split('.').reduce((acc: any, k: string) => (acc == null ? null : acc[k]), row);
  }

  isActive(row: any): boolean {
    const s = row?.is_active ?? row?.status;
    if (s === 0 || s === false || s === '0' || s === 'draft' || s === 'Draft' || s === 'inactive' || s === 'Inactive') {
      return false;
    }
    return true;
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
