import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class BlogService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.blogsAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.blogSingle, { id, _id: id });
  }

  create(body: any): Observable<any> {
    return this.post(apiUrl.blogCreate, body);
  }

  update(body: any): Observable<any> {
    return this.put(apiUrl.blogUpdate, body);
  }

  deleteById(id: string | number): Observable<any> {
    return this.delete(apiUrl.blogDelete, { id, _id: id });
  }
}
