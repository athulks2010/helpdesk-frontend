import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoteService } from '../../../../core/note/_services/note.service';
import { ConfirmDialogService } from '../../../theme/confirm-dialog/confirm-dialog.service';
import { AuthService } from '../../../../core/auth/_services/auth.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  saving = false;
  error = '';
  search = '';
  deletingId: string | number | null = null;

  panelOpen = false;
  form!: FormGroup;
  editingId: string | number | null = null;

  constructor(
    private service: NoteService,
    private fb: FormBuilder,
    private confirmService: ConfirmDialogService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      details: ['', Validators.required],
      user_id: [this.currentUserId()],
    });
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
        this.error = 'Failed to load notes';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = (this.search || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.rows];
    } else {
      this.filtered = this.rows.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(q)
      );
    }
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({
      id: null,
      name: '',
      details: '',
      user_id: this.currentUserId(),
    });
    this.panelOpen = true;
  }

  openEdit(row: any): void {
    const id = row.id || row._id;
    this.editingId = id;
    this.form.patchValue({
      id,
      name: row.name ?? '',
      details: row.details ?? '',
      user_id: row.user_id ?? this.currentUserId(),
    });
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen = false;
    this.editingId = null;
    this.form.reset({
      id: null,
      name: '',
      details: '',
      user_id: this.currentUserId(),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };
    if (!this.editingId) {
      raw.user_id = this.currentUserId();
      delete raw.id;
    }
    const req$ = this.editingId
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.closePanel();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error =
          err?.error?.response?.message ||
          err?.error?.message ||
          err?.message ||
          'Save failed';
      },
    });
  }

  async remove(row: any, event?: Event): Promise<void> {
    event?.stopPropagation();
    const id = row?.id || row?._id || this.editingId;
    if (!id) return;
    const name = row?.title || row?.name || 'this note';
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      itemName: `${name}`,
      confirmText: 'Delete Note',
      type: 'danger',
    });
    if (!confirmed) return;

    this.deletingId = id;
    this.service.deleteById(id).subscribe({
      next: () => {
        this.deletingId = null;
        if (this.editingId === id) {
          this.closePanel();
        }
        this.load();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete note';
      },
    });
  }

  preview(text: string | null | undefined, max = 180): string {
    const t = (text || '').trim();
    if (!t) return '—';
    return t.length > max ? t.slice(0, max) + '…' : t;
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

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  rowId(row: any): string | number | null {
    return row?.id || row?._id || null;
  }

  private currentUserId(): number | null {
    const user = this.auth.currentUserValue;
    const id = user?.id ?? user?._id;
    if (id == null || id === '') {
      return null;
    }
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }
}
