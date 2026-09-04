import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class SettingService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.settingsAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.settingSingle, { id, _id: id });
  }

  updateSetting(body: any): Observable<any> {
    return this.put(apiUrl.settingUpdate, body);
  }

  /** Bulk / keyed update matching Laravel global.update */
  updateGlobal(body: any): Observable<any> {
    return this.put(apiUrl.settingUpdate, body);
  }

  getSmtp(): Observable<any> {
    return this.getSingle(apiUrl.smtpSettings);
  }

  updateSmtp(body: any): Observable<any> {
    return this.put(apiUrl.smtpUpdate, body);
  }

  testSmtp(body?: any): Observable<any> {
    return this.post(apiUrl.smtpTest, body || {});
  }

  getPusher(): Observable<any> {
    return this.getSingle(apiUrl.pusherSettings);
  }

  updatePusher(body: any): Observable<any> {
    return this.put(apiUrl.pusherUpdate, body);
  }

  testPusher(body?: any): Observable<any> {
    return this.post(apiUrl.pusherTest, body || {});
  }

  getPiping(): Observable<any> {
    return this.getSingle(apiUrl.pipingSettings);
  }

  updatePiping(body: any): Observable<any> {
    return this.put(apiUrl.pipingUpdate, body);
  }

  getFrontPage(page: string): Observable<any> {
    return this.getSingle(apiUrl.frontPageSingle, { page });
  }

  updateFrontPage(body: any): Observable<any> {
    return this.put(apiUrl.frontPageUpdate, body);
  }

  getEmailTemplates(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.emailTemplatesAll, params);
  }

  getEmailTemplate(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.emailTemplateSingle, { id, _id: id });
  }

  updateEmailTemplate(body: any): Observable<any> {
    return this.put(apiUrl.emailTemplateUpdate, body);
  }

  getLanguages(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.languagesAll, {
      pageNumber: 1,
      pageSize: 10000000,
      ...(params || {}),
    });
  }

  createLanguage(body: any): Observable<any> {
    return this.post(apiUrl.languageCreate, body);
  }

  updateLanguage(body: any): Observable<any> {
    return this.put(apiUrl.languageUpdate, body);
  }

  deleteLanguage(id: string | number): Observable<any> {
    return this.delete(apiUrl.languageDelete, { id, _id: id });
  }

  getMenus(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.menusAll, params);
  }

  createMenu(body: any): Observable<any> {
    return this.post(apiUrl.menuCreate, body);
  }

  updateMenu(body: any): Observable<any> {
    return this.put(apiUrl.menuUpdate, body);
  }

  deleteMenu(id: string | number): Observable<any> {
    return this.delete(apiUrl.menuDelete, { id, _id: id });
  }

  reorderMenus(body: any): Observable<any> {
    return this.post(apiUrl.menuReorder, body);
  }

  getTicketFields(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.ticketFieldsAll, params);
  }

  createTicketField(body: any): Observable<any> {
    return this.post(apiUrl.ticketFieldCreate, body);
  }

  deleteTicketField(id: string | number): Observable<any> {
    return this.delete(apiUrl.ticketFieldDelete, { id, _id: id });
  }
}
