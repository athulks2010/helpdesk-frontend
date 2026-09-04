import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  private extractArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.list)) return res.list;
    return [];
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.ticketsAll, params);
  }

  /**
   * GET /dashboard/settings/filter/clients?search=
   * Returns ticket owners: [{ id, name }]
   * Empty search → first ~10 distinct ticket owners
   */
  filterClients(search?: string): Observable<Array<{ id: number | string; name: string }>> {
    return this.http
      .get(`${this.baseUrl}${apiUrl.filterClients}`, {
        params: this.toParams({ search: search || undefined }),
      })
      .pipe(
        map((res: any) => {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.data?.items)
                ? res.data.items
                : [];
          return list.map((c: any) => ({
            id: c.id ?? c.user_id,
            name:
              c.name ||
              [c.first_name, c.last_name].filter(Boolean).join(' ') ||
              c.email ||
              String(c.id),
          }));
        }),
        catchError(() => of([]))
      );
  }

  /**
   * GET /ticket/single?id={id}
   * Response shape:
   * { response: {...}, data: { item: { id, subject, status, priority, ... } } }
   */
  getById(id: string | number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${apiUrl.ticketSingle}`, {
        params: this.toParams({ id }),
      })
      .pipe(
        map((res: any) => {
          if (!res) return null;
          // Primary shape from API
          if (res.data?.item) return res.data.item;
          if (res.item) return res.item;
          if (res.ticket) return res.ticket;
          if (res.data?.ticket) return res.data.ticket;
          if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && res.data.id) {
            return res.data;
          }
          if (res.id) return res;
          return null;
        })
      );
  }

  createTicket(body: any): Observable<any> {
    return this.post(apiUrl.ticketCreate, this.toCreatePayload(body));
  }

  updateTicket(body: any): Observable<any> {
    return this.put(apiUrl.ticketUpdate, this.toUpdatePayload(body));
  }

  /** Maps UI form values → POST /ticket/create body */
  toCreatePayload(raw: Record<string, any>): Record<string, any> {
    return {
      subject: String(raw['subject'] ?? '').trim(),
      body: String(raw['body'] ?? raw['details'] ?? '').trim(),
      user_id: this.toId(raw['user_id']),
      contact_id: this.toId(raw['contact_id']),
      status_id: this.toId(raw['status_id']),
      priority_id: this.toId(raw['priority_id']),
      department_id: this.toId(raw['department_id']),
      type_id: this.toId(raw['type_id']),
      category_id: this.toId(raw['category_id']),
      assigned_to: this.toId(raw['assigned_to']),
    };
  }

  /** Maps UI form values → PUT /ticket/update body */
  toUpdatePayload(raw: Record<string, any>): Record<string, any> {
    return {
      id: this.toId(raw['id']),
      subject: String(raw['subject'] ?? '').trim(),
      body: String(raw['body'] ?? raw['details'] ?? '').trim(),
      status_id: this.toId(raw['status_id']),
      priority_id: this.toId(raw['priority_id']),
      assigned_to: this.toId(raw['assigned_to']),
    };
  }

  private toId(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  deleteTicket(id: string | number): Observable<any> {
    return this.delete(apiUrl.ticketDelete, { id, _id: id });
  }

  getComments(ticketId: string | number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${apiUrl.ticketComments}`, {
        params: this.toParams({ ticket_id: ticketId, id: ticketId }),
      })
      .pipe(
        map((res: any) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (res.data?.items) return res.data.items;
          if (res.data?.comments) return res.data.comments;
          if (Array.isArray(res.data)) return res.data;
          if (res.items) return res.items;
          if (res.comments) return res.comments;
          return [];
        })
      );
  }

  /**
   * POST /ticket/comments
   * Laravel uses { ticket_id, user_id, comment }; Angular API may use body.
   * Send both comment and body for compatibility.
   */
  addComment(payload: {
    ticket_id: string | number;
    comment?: string;
    body?: string;
    user_id?: string | number;
  }): Observable<any> {
    const text = payload.comment ?? payload.body ?? '';
    return this.http
      .post(`${this.baseUrl}${apiUrl.ticketComments}`, {
        ticket_id: payload.ticket_id,
        user_id: payload.user_id,
        comment: text,
        body: text,
      })
      .pipe(
        map((res: any) => {
          if (res?.data?.item) return res.data.item;
          if (res?.data?.comment) return res.data.comment;
          if (res?.item) return res.item;
          if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
          return res;
        })
      );
  }

  getTicketConversations(ticketId: string | number): Observable<any[]> {
    return this.http
      .get(`${this.baseUrl}${apiUrl.ticketConversations}`, {
        params: this.toParams({ ticket_id: ticketId, id: ticketId }),
      })
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.items)) return res.data.items;
          if (Array.isArray(res?.items)) return res.items;
          if (Array.isArray(res?.conversations)) return res.conversations;
          return [];
        }),
        catchError(() => of([]))
      );
  }

  toggleFavorite(id: string | number): Observable<any> {
    return this.post(apiUrl.ticketFavorite, { id, _id: id, ticket_id: id });
  }

  restoreTicket(id: string | number): Observable<any> {
    return this.post(apiUrl.ticketRestore, { id, _id: id });
  }

  exportCsv(params?: Record<string, any>): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${apiUrl.ticketExport}`, {
      params: this.toParams(params),
      responseType: 'blob',
    });
  }

  importCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}${apiUrl.ticketImport}`, formData).pipe(this.unwrap());
  }

  /** Loads all dropdown data needed for the ticket form in parallel */
  getFormDropdowns(): Observable<{
    priorities: any[];
    statuses: any[];
    types: any[];
    departments: any[];
    categories: any[];
    customers: any[];
    assignees: any[];
    contacts: any[];
  }> {
    const safe = (obs: Observable<any>) =>
      obs.pipe(
        map((res) => this.extractArray(res)),
        catchError(() => of([]))
      );

    return forkJoin({
      priorities: safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.prioritiesAll}`)),
      statuses:   safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.statusesAll}`)),
      types:      safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.typesAll}`)),
      departments:safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.departmentsAll}`)),
      categories: safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.categoriesAll}`)),
      customers:  safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.usersAll}?role_id=2`)),
      assignees:  safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.usersAll}?role_id=6`)),
      contacts:   safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.contactsAll}`)),
    });
  }

  /** Search customers by name/email */
  searchCustomers(query: string): Observable<any[]> {
    return this.http
      .get<any>(`${environment.apiUrl}${apiUrl.usersAll}?role_id=2&search=${encodeURIComponent(query)}`)
      .pipe(
        map((res) => this.extractArray(res)),
        catchError(() => of([]))
      );
  }

  /** Search staff/agents for assignment */
  searchAssignees(query: string): Observable<any[]> {
    return this.http
      .get<any>(`${environment.apiUrl}${apiUrl.usersAll}?role_id=6&search=${encodeURIComponent(query)}`)
      .pipe(
        map((res) => this.extractArray(res)),
        catchError(() => of([]))
      );
  }

  /** Ticket stats summary */
  getStats(tickets: any[]): { total: number; open: number; highPriority: number; unassigned: number } {
    return {
      total: tickets.length,
      open: tickets.filter((t) => {
        const s = (t.status?.name || t.status || '').toLowerCase();
        return s.includes('open') || s.includes('new') || s.includes('pending');
      }).length,
      highPriority: tickets.filter((t) => {
        const p = (t.priority?.name || t.priority || '').toLowerCase();
        return p.includes('high') || p.includes('urgent') || p.includes('critical');
      }).length,
      unassigned: tickets.filter((t) => !t.assigned_to && !t.assignedTo).length,
    };
  }
}
