import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class StatusService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.statusesAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.statusSingle, { id, _id: id });
  }

  create(body: any): Observable<any> {
    return this.post(apiUrl.statusCreate, body);
  }

  update(body: any): Observable<any> {
    return this.put(apiUrl.statusUpdate, body);
  }

  deleteById(id: string | number): Observable<any> {
    return this.delete(apiUrl.statusDelete, { id, _id: id });
  }
}
