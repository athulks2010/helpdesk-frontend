import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/role/_services/role.service';

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
        this.error = 'Failed to load roles';
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
    this.router.navigate(['/roles/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/roles', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm(`Delete role "${row.name || id}"? This action cannot be undone.`)) {
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
