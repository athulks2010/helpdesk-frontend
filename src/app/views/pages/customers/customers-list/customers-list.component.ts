import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/user/_services/user.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss'],
})
export class CustomersListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  deletingId: string | number | null = null;

  constructor(
    private service: UserService,
    private router: Router,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll({ role: 'customer' }).subscribe({
      next: (data: any) => {
        this.rows = Array.isArray(data) ? data : (data?.items || data?.list || data?.data || []);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load customers';
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
    this.router.navigate(['/customers/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/customers', id, 'edit']);
  }

  async remove(row: any): Promise<void> {
    const id = row.id || row._id;
    if (!id) return;
    const name = row.name || row.title || row.email || 'this customer';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This can usually be restored from the API if soft-delete is enabled.',
      itemName: `${name}`,
      confirmText: 'Delete Customer',
      type: 'danger',
    });
    if (!confirmed) return;

    this.deletingId = id;
    this.service.deleteUser(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete customer';
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
