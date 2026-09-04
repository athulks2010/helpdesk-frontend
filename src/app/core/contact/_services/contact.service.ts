import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class ContactService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.contactsAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.contactSingle, { id, _id: id });
  }

  createContact(body: any): Observable<any> {
    return this.post(apiUrl.contactCreate, body);
  }

  updateContact(body: any): Observable<any> {
    return this.put(apiUrl.contactUpdate, body);
  }

  deleteContact(id: string | number): Observable<any> {
    return this.delete(apiUrl.contactDelete, { id, _id: id });
  }
}
