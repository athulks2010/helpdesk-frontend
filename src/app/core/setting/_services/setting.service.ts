import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingService extends ApiBaseService {
  private settingsSubject = new BehaviorSubject<Record<string, any>>({});
  public settings$ = this.settingsSubject.asObservable();

  private brandLoaded = false;
  private brandLoading = false;

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
          this.settingsSubject.next({ ...this.settingsSubject.value, ...map });
          this.applyDocumentBrand();
        }
      })
    );
  }

  /** GET /setting/by-slug?slug=app_name */
  getBySlug(slug: string): Observable<any> {
    return this.getSingle(apiUrl.settingBySlug, { slug }).pipe(
      map((raw) => {
        const item = raw?.item ?? raw?.data?.item ?? raw?.data ?? raw;
        if (item == null) return null;
        if (typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, 'value')) {
          return item.value;
        }
        return item;
      }),
      tap((value) => {
        if (value === null || value === undefined) return;
        this.settingsSubject.next({
          ...this.settingsSubject.value,
          [slug]: value,
        });
      })
    );
  }

  /** Load branding fields used across the UI (app name, logos, footer). */
  loadBrandSettings(force = false): void {
    if (!force && (this.brandLoaded || this.brandLoading)) {
      return;
    }
    this.brandLoading = true;
    const slugs = ['app_name', 'main_logo', 'main_logo_white', 'main_favicon', 'footer_text'];
    forkJoin(
      slugs.map((slug) =>
        this.getBySlug(slug).pipe(catchError(() => of(null)))
      )
    ).subscribe({
      next: () => {
        this.brandLoaded = true;
        this.brandLoading = false;
        this.applyDocumentBrand();
      },
      error: () => {
        this.brandLoading = false;
      },
    });
  }

  getSettingValue(slug: string, fallback: any = null): any {
    const current = this.settingsSubject.value;
    return current[slug] !== undefined && current[slug] !== null ? current[slug] : fallback;
  }

  get appName(): string {
    return String(this.getSettingValue('app_name', 'Help Desk') || 'Help Desk');
  }

  get logoUrl(): string {
    return this.resolveAssetUrl(this.getSettingValue('main_logo', '/images/logo.png'));
  }

  get logoWhiteUrl(): string {
    return this.resolveAssetUrl(
      this.getSettingValue('main_logo_white', '/images/logo_white.png')
    );
  }

  get faviconUrl(): string {
    return this.resolveAssetUrl(this.getSettingValue('main_favicon', '/favicon.png'));
  }

  get footerText(): string {
    return String(this.getSettingValue('footer_text', '') || '');
  }

  resolveAssetUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (String(path).startsWith('http') || String(path).startsWith('data:')) {
      return String(path);
    }
    // Absolute public asset path served by Angular
    if (String(path).startsWith('/images/') || String(path).startsWith('/favicon')) {
      return String(path);
    }
    const base = (environment.apiUrl || '').replace(/\/$/, '');
    return `${base}${String(path).startsWith('/') ? '' : '/'}${path}`;
  }

  private applyDocumentBrand(): void {
    if (typeof document === 'undefined') return;
    document.title = this.appName;
    const favicon = this.faviconUrl;
    if (!favicon) return;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
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
    return this.post(apiUrl.settingUpdate, body).pipe(
      tap(() => {
        // Refresh brand cache when settings change
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          const next = { ...this.settingsSubject.value };
          Object.keys(body).forEach((key) => {
            next[key] = body[key];
          });
          this.settingsSubject.next(next);
          this.brandLoaded = true;
          this.applyDocumentBrand();
        }
      })
    );
  }

  /** Bulk / keyed update matching Laravel global.update */
  updateGlobal(body: any): Observable<any> {
    return this.updateSetting(body);
  }

  getSmtp(): Observable<any> {
    return this.getSingle(apiUrl.smtpSettings);
  }

  updateSmtp(body: any): Observable<any> {
    return this.post(apiUrl.smtpUpdate, body);
  }

  testSmtp(body?: any): Observable<any> {
    return this.post(apiUrl.smtpTest, body || {});
  }

  getPusher(): Observable<any> {
    return this.getSingle(apiUrl.pusherSettings);
  }

  updatePusher(body: any): Observable<any> {
    return this.post(apiUrl.pusherUpdate, body);
  }

  testPusher(body?: any): Observable<any> {
    return this.post(apiUrl.pusherTest, body || {});
  }

  getPiping(): Observable<any> {
    return this.getSingle(apiUrl.pipingSettings);
  }

  updatePiping(body: any): Observable<any> {
    return this.post(apiUrl.pipingUpdate, body);
  }

  testPiping(body?: any): Observable<any> {
    return this.post(apiUrl.pipingTest, body || {});
  }

  getFrontPage(page: string): Observable<any> {
    return this.getCollection(apiUrl.frontPagesAll, {
      slug: page,
      pageNumber: 1,
      pageSize: 1,
    }).pipe(
      map((data: any) => {
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.list || data?.data || [];
        return items[0] || null;
      })
    );
  }

  updateFrontPage(body: any): Observable<any> {
    return this.put(apiUrl.frontPageUpdate, body);
  }

  createFrontPage(body: any): Observable<any> {
    return this.post(apiUrl.frontPageCreate, body);
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
    return this.getCollection(apiUrl.menusAll, {
      pageNumber: 1,
      pageSize: 10000000,
      ...(params || {}),
    });
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
