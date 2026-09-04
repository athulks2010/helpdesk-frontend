import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class AiService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getStatus(): Observable<any> {
    return this.getSingle(apiUrl.aiStatus);
  }

  getAnalytics(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.aiAnalytics, params);
  }

  getSettings(): Observable<any> {
    return this.getSingle(apiUrl.aiSettings);
  }

  updateSettings(body: any): Observable<any> {
    return this.put(apiUrl.aiSettings, body);
  }
}
