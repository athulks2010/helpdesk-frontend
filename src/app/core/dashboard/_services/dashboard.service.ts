import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getMetrics(params?: Record<string, any>): Observable<any> {
    return this.getSingle(apiUrl.dashboardMetrics, params);
  }

  getAnalytics(params?: Record<string, any>): Observable<any> {
    return this.getSingle(apiUrl.dashboardAnalytics, params);
  }

  getPerformance(params?: Record<string, any>): Observable<any> {
    return this.getSingle(apiUrl.dashboardPerformance, params);
  }

  getCharts(params?: Record<string, any>): Observable<any> {
    return this.getSingle(apiUrl.dashboardCharts, params);
  }
}
