import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-menus-list',
  templateUrl: './menus-list.component.html',
  styleUrls: ['./menus-list.component.scss'],
})
export class MenusListComponent implements OnInit {
  rows: any[] = [];
  loading = true;
  error = '';

  constructor(private settingService: SettingService, private router: Router) {}

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
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load menus';
        this.loading = false;
      },
    });
  }

  createNew(): void {
    this.router.navigate(['/settings/menus/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    this.router.navigate(['/settings/menus', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id || !confirm('Delete this menu item?')) return;
    this.settingService.deleteMenu(id).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete menu item'),
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
