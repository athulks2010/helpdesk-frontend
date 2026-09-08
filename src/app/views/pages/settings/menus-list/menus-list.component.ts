import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-menus-list',
  templateUrl: './menus-list.component.html',
  styleUrls: ['./menus-list.component.scss'],
})
export class MenusListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  search = '';
  pageSize = 10;
  loading = true;
  error = '';
  deletingId: any = null;

  Math = Math;
  currentPage = 1;
  totalCount = 0;
  totalPages = 1;
  pages: number[] = [];

  constructor(
    private settingService: SettingService,
    private confirmService: ConfirmDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getMenus().subscribe({
      next: (data) => {
        this.rows = (Array.isArray(data) ? data : data?.items || data?.list || data?.data || []).sort(
          (a: any, b: any) => Number(a.order ?? a.sort_order ?? 0) - Number(b.order ?? b.sort_order ?? 0)
        );
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load menus';
        this.loading = false;
      },
    });
  }

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
    this.router.navigate(['/settings/menus/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/settings/menus', id, 'edit']);
  }

  async remove(row: any): Promise<void> {
    const id = row.id || row._id;
    if (!id) return;
    const name = row.label || row.name || 'this menu item';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this menu item?',
      itemName: `${name}`,
      confirmText: 'Delete Menu Item',
      type: 'danger',
    });
    if (!confirmed) return;

    this.deletingId = id;
    this.settingService.deleteMenu(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete menu item';
      },
    });
  }

  move(row: any, direction: -1 | 1): void {
    const index = this.rows.findIndex((r) => (r.id || r._id) === (row.id || row._id));
    const swap = this.rows[index + direction];
    if (!swap) return;
    const currentOrder = row.order ?? row.sort_order ?? index;
    const swapOrder = swap.order ?? swap.sort_order ?? index + direction;
    this.settingService
      .reorderMenus({
        items: [
          { id: row.id || row._id, sort_order: swapOrder, order: swapOrder },
          { id: swap.id || swap._id, sort_order: currentOrder, order: currentOrder },
        ],
      })
      .subscribe({
        next: () => this.load(),
        error: () => (this.error = 'Failed to reorder menus'),
      });
  }
}
