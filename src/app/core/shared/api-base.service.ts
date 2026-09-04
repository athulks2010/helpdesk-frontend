import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected unwrap<T = any>() {
    return map((res: any) => {
      if (res == null) {
        return res as T;
      }
      if (Object.prototype.hasOwnProperty.call(res, 'data')) {
        return (res.data ?? res) as T;
      }
      return res as T;
    });
  }

  protected toParams(params?: Record<string, any>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  protected getCollection(path: string, params?: Record<string, any>): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${path}`, { params: this.toParams(params) })
      .pipe(this.unwrap());
  }

  protected getSingle(path: string, params?: Record<string, any>): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${path}`, { params: this.toParams(params) })
      .pipe(this.unwrap());
  }

  protected post(path: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${path}`, body).pipe(this.unwrap());
  }

  protected put(path: string, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${path}`, body).pipe(this.unwrap());
  }

  protected delete(path: string, params?: Record<string, any>): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}${path}`, { params: this.toParams(params) })
      .pipe(this.unwrap());
  }
}
