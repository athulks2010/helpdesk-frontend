import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class TypeService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.typesAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.typeSingle, { id, _id: id });
  }

  create(body: any): Observable<any> {
    return this.post(apiUrl.typeCreate, body);
  }

  update(body: any): Observable<any> {
    return this.put(apiUrl.typeUpdate, body);
  }

  deleteById(id: string | number): Observable<any> {
    return this.delete(apiUrl.typeDelete, { id, _id: id });
  }
}
