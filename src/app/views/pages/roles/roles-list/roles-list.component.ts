import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/role/_services/role.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
})
export class RolesListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  deletingId: string | number | null = null;

  constructor(
    private service: RoleService,
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
        this.error = 'Failed to load roles';
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
    this.router.navigate(['/roles/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/roles', id, 'edit']);
  }

  /** System roles 1–6 are protected; only custom roles can be deleted. */
  canDeleteRole(row: any): boolean {
    const id = Number(row?.id ?? row?._id);
    return Number.isFinite(id) && id > 6;
  }

  async remove(row: any): Promise<void> {
    if (!this.canDeleteRole(row)) return;
    const id = row.id || row._id;
    if (!id) return;
    const name = row.name || id;
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Role',
      message: `Are you sure you want to delete role "${name}"? This action cannot be undone.`,
      itemName: `${name}`,
      confirmText: 'Delete Role',
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
        this.error = 'Failed to delete role';
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
