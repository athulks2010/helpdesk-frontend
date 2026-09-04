import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-menus-list',
  templateUrl: './menus-list.component.html',
  styleUrls: ['./menus-list.component.scss'],
})
export class MenusListComponent implements OnInit {
  rows: any[] = [];
  loading = true;
  saving = false;
  error = '';
  editingId: string | number | null = null;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      location: ['header', Validators.required],
      label: ['', Validators.required],
      url: [''],
      icon: [''],
      order: [0],
      sort_order: [0],
      is_active: [true],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getMenus({}).subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load menus';
        this.loading = false;
      },
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({
      id: null,
      location: 'header',
      label: '',
      url: '',
      icon: '',
      order: 0,
      sort_order: 0,
      is_active: true,
    });
  }

  startEdit(row: any): void {
    this.editingId = row.id || row._id;
    const order = row.order ?? row.sort_order ?? 0;
    this.form.patchValue({
      id: this.editingId,
      location: row.location || 'header',
      label: row.label || '',
      url: row.url || '',
      icon: row.icon || '',
      order,
      sort_order: order,
      is_active: row.is_active !== false,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const body = { ...this.form.getRawValue() };
    body.sort_order = body.order;
    const req$ = this.editingId
      ? this.settingService.updateMenu(body)
      : this.settingService.createMenu(body);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.startCreate();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
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
