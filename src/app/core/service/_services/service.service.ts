import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class CmsServiceService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.servicesAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.serviceSingle, { id, _id: id });
  }

  create(body: any): Observable<any> {
    return this.post(apiUrl.serviceCreate, body);
  }

  update(body: any): Observable<any> {
    return this.put(apiUrl.serviceUpdate, body);
  }

  deleteById(id: string | number): Observable<any> {
    return this.delete(apiUrl.serviceDelete, { id, _id: id });
  }
}
