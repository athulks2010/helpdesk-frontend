import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../core/category/_services/category.service';
import { DepartmentService } from '../../../../core/department/_services/department.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  departmentId: string = '';
  departments: any[] = [];
  deletingId: string | number | null = null;

  constructor(
    private service: CategoryService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private confirmService: ConfirmDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.departmentId = this.route.snapshot.queryParamMap.get('department_id') || '';
    this.loadDepartments();
    this.load();
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (d) => {
        this.departments = Array.isArray(d) ? d : (d?.items || d?.list || d?.data || []);
      },
    });
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
        this.error = 'Failed to load categories';
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
    let list = [...this.rows];

    if (this.departmentId) {
      list = list.filter((row) =>
        String(row.department_id ?? row.department?.id ?? '') === String(this.departmentId)
      );
    }

    const q = (this.search || '').toLowerCase().trim();
    if (q) {
      list = list.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
    }

    this.totalCount = list.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize)));
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * Number(this.pageSize);
    this.filtered = list.slice(start, start + Number(this.pageSize));
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

  onDepartmentFilterChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { department_id: this.departmentId || null },
      queryParamsHandling: 'merge',
    });
    this.applyFilter();
  }

  clearDepartmentFilter(): void {
    this.departmentId = '';
    this.onDepartmentFilterChange();
  }

  departmentFilterLabel(): string {
    if (!this.departmentId) return '';
    const dept = this.departments.find(
      (d) => String(d.id || d._id) === String(this.departmentId)
    );
    return dept?.name || `Department #${this.departmentId}`;
  }

  createNew(): void {
    this.router.navigate(['/categories/create'], {
      queryParams: this.departmentId ? { department_id: this.departmentId } : {},
    });
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/categories', id, 'edit']);
  }

  async remove(row: any): Promise<void> {
    const id = row.id || row._id;
    if (!id) return;
    const name = row.name || row.title || 'this category';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This can usually be restored from the API if soft-delete is enabled.',
      itemName: `${name}`,
      confirmText: 'Delete Category',
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
        this.error = 'Failed to delete category';
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
