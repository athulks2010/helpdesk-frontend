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

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.ticketSingle, { id, _id: id });
  }

  createTicket(body: any): Observable<any> {
    return this.post(apiUrl.ticketCreate, body);
  }

  updateTicket(body: any): Observable<any> {
    return this.put(apiUrl.ticketUpdate, body);
  }

  deleteTicket(id: string | number): Observable<any> {
    return this.delete(apiUrl.ticketDelete, { id, _id: id });
  }

  getComments(ticketId: string | number): Observable<any> {
    return this.getSingle(apiUrl.ticketComments, { ticket_id: ticketId, id: ticketId });
  }

  addComment(body: any): Observable<any> {
    return this.post(apiUrl.ticketComments, body);
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
    customers: any[];
    assignees: any[];
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
      customers:  safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.usersAll}?role_id=2`)),
      assignees:  safe(this.http.get<any>(`${environment.apiUrl}${apiUrl.usersAll}?role_id=6`)),
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
