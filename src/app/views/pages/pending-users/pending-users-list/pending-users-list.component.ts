import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../core/user/_services/user.service';

@Component({
  selector: 'app-pending-users-list',
  templateUrl: './pending-users-list.component.html',
  styleUrls: ['./pending-users-list.component.scss'],
})
export class PendingUsersListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  actionId: string | number | null = null;

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getPending({}).subscribe({
      next: (data: any) => {
        this.rows = Array.isArray(data) ? data : (data?.items || data?.list || data?.data || []);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load pending users';
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

  displayName(row: any): string {
    const full = [row?.first_name, row?.last_name].filter(Boolean).join(' ').trim();
    return full || row?.name || '—';
  }

  rowId(row: any): string | number | null {
    return row?.id || row?._id || null;
  }

  approve(row: any): void {
    const id = this.rowId(row);
    if (!id) return;
    if (!confirm(`Approve pending user "${this.displayName(row)}"?`)) {
      return;
    }
    this.actionId = id;
    this.service.approvePending(id).subscribe({
      next: () => {
        this.actionId = null;
        this.load();
      },
      error: () => {
        this.actionId = null;
        this.error = 'Failed to approve user';
      },
    });
  }

  decline(row: any): void {
    const id = this.rowId(row);
    if (!id) return;
    if (!confirm(`Decline pending user "${this.displayName(row)}"? This cannot be undone.`)) {
      return;
    }
    this.actionId = id;
    this.service.declinePending(id).subscribe({
      next: () => {
        this.actionId = null;
        this.load();
      },
      error: () => {
        this.actionId = null;
        this.error = 'Failed to decline user';
      },
    });
  }

  formatDate(value: any): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return String(value);
    }
  }
}
