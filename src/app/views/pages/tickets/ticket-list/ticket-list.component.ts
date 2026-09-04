import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TicketService } from '../../../../core/ticket/_services/ticket.service';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
})
export class TicketListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private clientSearchSubject = new Subject<string>();

  // Data
  allTickets: any[] = [];
  rows: any[] = [];
  loading = true;
  error = '';

  // Stats
  totalCount = 0;
  openCount = 0;
  highPriorityCount = 0;
  unassignedCount = 0;

  // Dropdown options
  priorities: any[] = [];
  statuses: any[] = [];
  types: any[] = [];
  departments: any[] = [];
  assignees: any[] = [];

  // Client autocomplete (filter.clients → filter by user_id)
  clients: Array<{ id: number | string; name: string }> = [];
  clientQuery = '';
  selectedClient: { id: number | string; name: string } | null = null;
  showClientDropdown = false;
  clientLoading = false;

  // View
  viewMode: 'list' | 'grid' = 'list';

  // Filters
  searchText = '';
  pageSize = 10;
  currentPage = 1;
  sortField = '';
  sortOrder = '';

  filters = {
    user_id: '' as string | number,
    type_id: '',
    department_id: '',
    priority_id: '',
    status_id: '',
    assigned_to: '',
    date_from: '',
    date_to: '',
    quickFilter: '',
    favorites: false,
  };

  activeFilterCount = 0;

  // Pagination
  Math = Math;
  totalPages = 1;
  pages: number[] = [];

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private settingService: SettingService,
    private router: Router,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.load();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.clientSearchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => this.fetchClients(search));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Laravel: shown when user_id not hidden and user has ticket.update */
  get showClientFilter(): boolean {
    if (!this.hasAccess('ticket', 'update')) return false;
    return !this.getHiddenTicketFields().includes('user_id');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const root = this.host.nativeElement.querySelector('[data-client-filter]');
    if (root && !root.contains(event.target as Node)) {
      this.showClientDropdown = false;
    }
  }

  loadDropdowns(): void {
    this.ticketService.getFormDropdowns().subscribe((data) => {
      this.priorities = data.priorities;
      this.statuses = data.statuses;
      this.types = data.types;
      this.departments = data.departments;
      this.assignees = data.assignees;
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.ticketService
      .getAll({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
        user_id: this.filters.user_id || undefined,
      })
      .subscribe({
        next: (data: any) => {
          const list = Array.isArray(data) ? data : data?.items || data?.list || data?.tickets || [];
          this.allTickets = list;
          this.computeStats(list);
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load tickets';
          this.loading = false;
        },
      });
  }

  /** Focus / type in Client box → GET filter.clients?search= (does not filter tickets) */
  onClientFocus(): void {
    this.showClientDropdown = true;
    this.fetchClients(this.clientQuery);
  }

  onClientInput(value: string): void {
    this.clientQuery = value;
    // Typing clears a prior selection until a new client is picked
    if (this.selectedClient && value !== this.selectedClient.name) {
      this.selectedClient = null;
      if (this.filters.user_id) {
        this.filters.user_id = '';
        this.currentPage = 1;
        this.load();
      }
    }
    this.showClientDropdown = true;
    this.clientSearchSubject.next(value || '');
  }

  private fetchClients(search: string): void {
    this.clientLoading = true;
    this.ticketService.filterClients(search).subscribe({
      next: (list) => {
        this.clients = list;
        this.clientLoading = false;
        this.showClientDropdown = true;
      },
      error: () => {
        this.clients = [];
        this.clientLoading = false;
      },
    });
  }

  selectClient(client: { id: number | string; name: string }): void {
    this.selectedClient = client;
    this.clientQuery = client.name;
    this.filters.user_id = client.id;
    this.showClientDropdown = false;
    this.currentPage = 1;
    this.load();
  }

  clearClient(event?: Event): void {
    event?.stopPropagation();
    this.selectedClient = null;
    this.clientQuery = '';
    this.clients = [];
    this.showClientDropdown = false;
    if (this.filters.user_id) {
      this.filters.user_id = '';
      this.currentPage = 1;
      this.load();
    }
  }

  computeStats(tickets: any[]): void {
    this.totalCount = tickets.length;
    this.openCount = tickets.filter((t) => {
      const s = (t.status?.name || t.status || '').toLowerCase();
      return s.includes('open') || s.includes('new') || s.includes('pending');
    }).length;
    this.highPriorityCount = tickets.filter((t) => {
      const p = (t.priority?.name || t.priority || '').toLowerCase();
      return p.includes('high') || p.includes('urgent') || p.includes('critical');
    }).length;
    this.unassignedCount = tickets.filter((t) => !t.assigned_to && !t.assignee).length;
  }

  applyFilters(): void {
    let filtered = [...this.allTickets];

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.key || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.priority?.name || '').toLowerCase().includes(q) ||
          (t.status?.name || '').toLowerCase().includes(q)
      );
    }

    // Client filter = exact ticket owner id (not free-text search)
    if (this.filters.user_id) {
      filtered = filtered.filter(
        (t) => String(t.user_id ?? t.user?.id ?? '') === String(this.filters.user_id)
      );
    }

    if (this.filters.type_id) {
      filtered = filtered.filter((t) => String(t.type_id || t.type?.id) === String(this.filters.type_id));
    }

    if (this.filters.department_id) {
      filtered = filtered.filter((t) => String(t.department_id || t.department?.id) === String(this.filters.department_id));
    }

    if (this.filters.priority_id) {
      filtered = filtered.filter((t) => String(t.priority_id || t.priority?.id) === String(this.filters.priority_id));
    }

    if (this.filters.status_id) {
      filtered = filtered.filter((t) => String(t.status_id || t.status?.id) === String(this.filters.status_id));
    }

    if (this.filters.assigned_to) {
      if (this.filters.assigned_to === 'unassigned') {
        filtered = filtered.filter((t) => !t.assigned_to && !t.assignee);
      } else {
        filtered = filtered.filter((t) => String(t.assigned_to) === String(this.filters.assigned_to));
      }
    }

    if (this.filters.date_from) {
      const from = new Date(this.filters.date_from).getTime();
      filtered = filtered.filter((t) => new Date(t.created_at).getTime() >= from);
    }

    if (this.filters.date_to) {
      const to = new Date(this.filters.date_to).getTime();
      filtered = filtered.filter((t) => new Date(t.created_at).getTime() <= to);
    }

    // Quick filters
    if (this.filters.quickFilter === 'open') {
      filtered = filtered.filter((t) => {
        const s = (t.status?.name || '').toLowerCase();
        return s.includes('open') || s.includes('new') || s.includes('pending');
      });
    } else if (this.filters.quickFilter === 'high') {
      filtered = filtered.filter((t) => {
        const p = (t.priority?.name || '').toLowerCase();
        return p.includes('high') || p.includes('urgent');
      });
    } else if (this.filters.quickFilter === 'unassigned') {
      filtered = filtered.filter((t) => !t.assigned_to && !t.assignee);
    } else if (this.filters.quickFilter === 'recent') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((t) => new Date(t.created_at).getTime() >= cutoff);
    } else if (this.filters.quickFilter === 'favorites') {
      filtered = filtered.filter((t) => t.is_favorite || t.favorited);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[this.sortField] || a.created_at || '';
      let bVal = b[this.sortField] || b.created_at || '';
      if (this.sortField === 'priority') { aVal = a.priority?.name || ''; bVal = b.priority?.name || ''; }
      if (this.sortField === 'status')   { aVal = a.status?.name || '';   bVal = b.status?.name || ''; }
      return this.sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    this.countActiveFilters();

    // Paginate
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    this.rows = filtered.slice(start, start + this.pageSize);
  }

  countActiveFilters(): void {
    let count = 0;
    if (this.filters.user_id) count++;
    if (this.filters.type_id) count++;
    if (this.filters.department_id) count++;
    if (this.filters.priority_id) count++;
    if (this.filters.status_id) count++;
    if (this.filters.assigned_to) count++;
    if (this.filters.date_from) count++;
    if (this.filters.date_to) count++;
    this.activeFilterCount = count;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchText);
  }

  setSort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  setQuickFilter(filter: string): void {
    this.filters.quickFilter = this.filters.quickFilter === filter ? '' : filter;
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    const hadUserId = !!this.filters.user_id;
    this.filters = {
      user_id: '',
      type_id: '',
      department_id: '',
      priority_id: '',
      status_id: '',
      assigned_to: '',
      date_from: '',
      date_to: '',
      quickFilter: '',
      favorites: false,
    };
    this.searchText = '';
    this.selectedClient = null;
    this.clientQuery = '';
    this.clients = [];
    this.showClientDropdown = false;
    this.currentPage = 1;
    if (hadUserId) {
      this.load();
    } else {
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  createNew(): void {
    this.router.navigate(['/tickets/create']);
  }

  open(row: any): void {
    const id = row?.id ?? row?._id;
    if (!id) return;
    this.router.navigate(['/tickets', id]);
  }

  edit(row: any, e: Event): void {
    e.stopPropagation();
    this.router.navigate(['/tickets', row.id, 'edit']);
  }

  deleteTicket(row: any, e: Event): void {
    e.stopPropagation();
    if (!confirm('Delete this ticket?')) return;
    this.ticketService.deleteTicket(row.id).subscribe({
      next: () => {
        this.allTickets = this.allTickets.filter((t) => t.id !== row.id);
        this.computeStats(this.allTickets);
        this.applyFilters();
      },
    });
  }

  exportCSV(): void {
    this.ticketService.exportCsv(this.buildFilterParams()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tickets.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.exportCSVLocal(),
    });
  }

  private exportCSVLocal(): void {
    const headers = ['Key', 'Subject', 'Priority', 'Status', 'Customer', 'Created'];
    const rows = this.allTickets.map((t) => [
      t.key || t.id,
      t.subject,
      t.priority?.name || '',
      t.status?.name || '',
      `${t.user?.first_name || ''} ${t.user?.last_name || ''}`.trim(),
      t.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: any) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.ticketService.importCsv(file).subscribe({
      next: () => {
        input.value = '';
        this.load();
      },
      error: () => {
        input.value = '';
        alert('Import failed. Check the CSV format and API endpoint.');
      },
    });
  }

  private buildFilterParams(): Record<string, any> {
    return {
      search: this.searchText || undefined,
      user_id: this.filters.user_id || undefined,
      type_id: this.filters.type_id || undefined,
      department_id: this.filters.department_id || undefined,
      priority_id: this.filters.priority_id || undefined,
      status_id: this.filters.status_id || undefined,
      assigned_to: this.filters.assigned_to || undefined,
      date_from: this.filters.date_from || undefined,
      date_to: this.filters.date_to || undefined,
    };
  }

  private hasAccess(module: string, action: 'read' | 'create' | 'update' | 'delete' = 'read'): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;

    const role = user.role;
    const roleSlug = typeof role === 'string' ? role : role?.slug;
    if (roleSlug === 'admin') return true;

    const directAccess = (user as any).access;
    if (directAccess && directAccess[module]) {
      return !!directAccess[module][action];
    }

    if (role && typeof role === 'object' && (role as any).access) {
      try {
        const parsed =
          typeof (role as any).access === 'string'
            ? JSON.parse((role as any).access)
            : (role as any).access;
        if (parsed && parsed[module]) {
          return !!parsed[module][action];
        }
      } catch {
        // ignore
      }
    }

    return false;
  }

  private getHiddenTicketFields(): string[] {
    const raw = this.settingService.getSettingValue('hide_ticket_fields', []);
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  getPriorityClass(priority: string): string {
    const p = (priority || '').toLowerCase();
    if (p.includes('high') || p.includes('urgent') || p.includes('critical')) return 'badge-red';
    if (p.includes('medium') || p.includes('normal') || p.includes('generally')) return 'badge-yellow';
    if (p.includes('low')) return 'badge-green';
    return 'badge-gray';
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('open') || s.includes('new')) return 'badge-blue';
    if (s.includes('pending') || s.includes('waiting')) return 'badge-yellow';
    if (s.includes('resolved') || s.includes('closed')) return 'badge-green';
    if (s.includes('cancel')) return 'badge-red';
    return 'badge-gray';
  }

  fromNow(date: string): string {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  displayName(user: any): string {
    if (!user) return '—';
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
  }

  ticketKey(t: any): string {
    return t.key || `#${t.id}`;
  }
}
