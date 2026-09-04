import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class NotificationService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.notificationsAll, params);
  }

  markAsRead(id: string | number): Observable<any> {
    return this.post(apiUrl.notificationMarkRead, { id, _id: id });
  }

  markAllAsRead(): Observable<any> {
    return this.post(apiUrl.notificationMarkAllRead, {});
  }
}
