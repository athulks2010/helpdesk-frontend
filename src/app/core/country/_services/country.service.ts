import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

export interface CountryItem {
  id: number;
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CountryService extends ApiBaseService {
  private cachedCountries: CountryItem[] | null = null;
  private countryObservable$: Observable<CountryItem[]> | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<CountryItem[]> {
    if (this.cachedCountries && !params) {
      return of(this.cachedCountries);
    }
    if (this.countryObservable$ && !params) {
      return this.countryObservable$;
    }

    const obs = this.getCollection(apiUrl.countriesAll, {
      pageNumber: 1,
      pageSize: 1000,
      ...(params || {}),
    }).pipe(
      map((res: any) => {
        const items = Array.isArray(res)
          ? res
          : res?.items || res?.list || res?.data || [];
        return items.map((c: any) => ({
          id: +c.id,
          code: c.code,
          name: c.name,
        }));
      }),
      tap((items) => {
        if (!params && items.length > 0) {
          this.cachedCountries = items;
        }
      }),
      shareReplay(1)
    );

    if (!params) {
      this.countryObservable$ = obs;
    }
    return obs;
  }
}
