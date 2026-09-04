import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { apiUrl } from '../../_config/api.config';
import { UserModel } from '../_models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserModel | null>(this.readStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.currentUser$.pipe(map((user) => !!user && !!this.getToken()));

  constructor(private http: HttpClient) {}

  get currentUserValue(): UserModel | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}${apiUrl.login}`, { email, password })
      .pipe(
        tap((res) => {
          const payload = res?.data ?? res;
          const token = payload?.token;
          const user = payload?.user;
          if (token) {
            localStorage.setItem(environment.tokenKey, token);
          }
          if (user) {
            localStorage.setItem(environment.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  register(payload: Record<string, any>): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}${apiUrl.register}`, payload).pipe(
      tap((res) => {
        const data = res?.data ?? res;
        const token = data?.token;
        const user = data?.user;
        if (token) {
          localStorage.setItem(environment.tokenKey, token);
        }
        if (user) {
          localStorage.setItem(environment.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}${apiUrl.forgotPassword}`, { email });
  }

  me(): Observable<UserModel | null> {
    return this.http.get<any>(`${environment.apiUrl}${apiUrl.me}`).pipe(
      map((res) => {
        const user = res?.data?.user ?? res?.data ?? res;
        return user as UserModel;
      }),
      tap((user) => {
        if (user && (user.id || user.email)) {
          localStorage.setItem(environment.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const request$ = token
      ? this.http.post<any>(`${environment.apiUrl}${apiUrl.logout}`, {})
      : of(null);

    return request$.pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  clearSession(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
  }

  private readStoredUser(): UserModel | null {
    try {
      const raw = localStorage.getItem(environment.userKey);
      return raw ? (JSON.parse(raw) as UserModel) : null;
    } catch {
      return null;
    }
  }
}
