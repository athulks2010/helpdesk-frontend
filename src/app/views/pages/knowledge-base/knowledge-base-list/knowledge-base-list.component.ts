import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KnowledgeBaseService } from '../../../../core/knowledge-base/_services/knowledge-base.service';
import { TypeService } from '../../../../core/type/_services/type.service';

@Component({
  selector: 'app-knowledge-base-list',
  templateUrl: './knowledge-base-list.component.html',
  styleUrls: ['./knowledge-base-list.component.scss'],
})
export class KnowledgeBaseListComponent implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  types: any[] = [];
  loading = true;
  error = '';
  search = '';
  typeFilter: string | number = '';
  typeMenuOpen = false;
  deletingId: string | number | null = null;

  constructor(
    private service: KnowledgeBaseService,
    private typeService: TypeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
  }

  get selectedTypeLabel(): string {
    if (this.typeFilter === '' || this.typeFilter == null) return 'All Types';
    const match = this.types.find((t) => (t.id || t._id) == this.typeFilter);
    return match?.name || 'All Types';
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.typeMenuOpen = false;
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
        this.error = 'Failed to load knowledge base';
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

    if (q) {
      list = list.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
    }

    this.filtered = list;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  toggleTypeMenu(): void {
    this.typeMenuOpen = !this.typeMenuOpen;
  }

  selectType(id: string | number): void {
    this.typeFilter = id;
    this.typeMenuOpen = false;
    this.applyFilter();
  }

  isTypeSelected(t: any): boolean {
    return String(this.typeFilter) === String(t.id || t._id);
  }

  createNew(): void {
    this.router.navigate(['/knowledge-base/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['/knowledge-base', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm('Delete this article? This can usually be restored from the API if soft-delete is enabled.')) {
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
        this.error = 'Failed to delete article';
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
