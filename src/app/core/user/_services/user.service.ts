import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.usersAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.userSingle, { id, _id: id });
  }

  createUser(body: any): Observable<any> {
    return this.post(apiUrl.userCreate, body);
  }

  updateUser(body: any): Observable<any> {
    return this.put(apiUrl.userUpdate, body);
  }

  deleteUser(id: string | number): Observable<any> {
    return this.delete(apiUrl.userDelete, { id, _id: id });
  }

  getPending(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.pendingUsersAll, params);
  }

  approvePending(id: string | number): Observable<any> {
    return this.post(apiUrl.pendingUserApprove, { id, _id: id });
  }

  declinePending(id: string | number): Observable<any> {
    return this.post(apiUrl.pendingUserDecline, { id, _id: id });
  }
}
