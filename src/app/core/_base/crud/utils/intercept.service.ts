import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../auth/_services/auth.service';

@Injectable()
export class InterceptService implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    let request = req;

    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      if (!(req.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      request = req.clone({ setHeaders: headers });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.clearSession();
          const publicPrefixes = [
            '/ticket',
            '/services',
            '/kb',
            '/faq',
            '/contact',
            '/terms-of-services',
            '/privacy',
            '/blog',
            '/auth',
          ];
          const currentUrl = this.router.url.split('?')[0];
          const isRoot = currentUrl === '' || currentUrl === '/';
          const isPublic = isRoot || publicPrefixes.some((p) => currentUrl.startsWith(p));
          if (!isPublic) {
            this.router.navigate(['/auth/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
