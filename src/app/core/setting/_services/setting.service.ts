import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class SettingService extends ApiBaseService {
  private settingsSubject = new BehaviorSubject<Record<string, any>>({});
  public settings$ = this.settingsSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Extract items array from API response shape:
   * { response: { ... }, data: { items: [ { id, slug, value }, ... ] } }
   */
  getSettingsMap(raw: any): Record<string, any> {
    if (!raw) return {};
    const items =
      Array.isArray(raw) ? raw :
      Array.isArray(raw?.data?.items) ? raw.data.items :
      Array.isArray(raw?.items) ? raw.items :
      Array.isArray(raw?.data) ? raw.data :
      raw?.settings || raw;

    if (Array.isArray(items)) {
      const map: Record<string, any> = {};
      items.forEach((row: any) => {
        const key = row?.slug || row?.key || row?.name;
        if (key) {
          map[key] = row?.value !== undefined ? row.value : row;
        }
      });
      return map;
    }

    if (typeof items === 'object') {
      return items;
    }

    return {};
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.settingsAll, params).pipe(
      tap((raw) => {
        const map = this.getSettingsMap(raw);
        if (Object.keys(map).length > 0) {
          this.settingsSubject.next(map);
        }
      })
    );
  }

  getSettingValue(slug: string, fallback: any = null): any {
    const current = this.settingsSubject.value;
    return current[slug] !== undefined ? current[slug] : fallback;
  }

  isOptionEnabled(slug: string, fallback: boolean = true): boolean {
    const optionsRaw = this.getSettingValue('enable_options');
    if (!optionsRaw) return fallback;
    let list: any[] = [];
    if (typeof optionsRaw === 'string') {
      try {
        list = JSON.parse(optionsRaw);
      } catch {
        return fallback;
      }
    } else if (Array.isArray(optionsRaw)) {
      list = optionsRaw;
    }
    const found = list.find((opt: any) => opt?.slug === slug);
    return found ? !!found.value : fallback;
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
    return this.getCollection(apiUrl.languagesAll, params);
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
