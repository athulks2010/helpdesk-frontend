import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number; // in ms; 0 means persistent
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  // Deduplication cache: key -> timestamp
  private recentToasts = new Map<string, number>();
  private readonly DEDUP_WINDOW_MS = 1000;

  constructor() {}

  /**
   * Display a generic toast message.
   */
  show(type: ToastType, message: string, title?: string, duration?: number): string | null {
    if (!message || !message.trim()) {
      return null;
    }

    const trimmedMsg = message.trim();
    const resolvedTitle = title || this.getDefaultTitle(type);
    const dedupKey = `${type}:${resolvedTitle}:${trimmedMsg}`;
    const now = Date.now();

    const lastTime = this.recentToasts.get(dedupKey);
    if (lastTime && now - lastTime < this.DEDUP_WINDOW_MS) {
      return null; // Suppress duplicate
    }
    this.recentToasts.set(dedupKey, now);

    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const resolvedDuration = duration !== undefined ? duration : (type === 'error' ? 5000 : 4000);

    const toast: Toast = {
      id,
      type,
      title: resolvedTitle,
      message: trimmedMsg,
      duration: resolvedDuration,
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (resolvedDuration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, resolvedDuration);
    }

    return id;
  }

  success(message: string, title: string = 'Success', duration?: number): string | null {
    return this.show('success', message, title, duration);
  }

  error(message: string = 'Server Error - Something went wrong.', title: string = 'Server Error', duration?: number): string | null {
    return this.show('error', message, title, duration);
  }

  warning(message: string, title: string = 'Warning', duration?: number): string | null {
    return this.show('warning', message, title, duration);
  }

  info(message: string, title: string = 'Information', duration?: number): string | null {
    return this.show('info', message, title, duration);
  }

  /**
   * Automatically inspects an HttpErrorResponse and displays the appropriate characteristic-based toast.
   */
  handleHttpError(error: HttpErrorResponse): void {
    // If request explicitly asked to skip toast (e.g. background polling), do nothing
    if (error.headers?.has('X-Skip-Toast')) {
      return;
    }

    const status = error.status;
    const backendResponse = error.error?.response;
    const backendMsg = backendResponse?.message || error.error?.message;

    // 1. Status 0: Network error / server offline / timeout
    if (status === 0) {
      this.error(
        'Unable to connect to the server. Please check your internet connection.',
        'Connection Error'
      );
      return;
    }

    // 2. Status 400: Client / Business Logic Errors (DTO validation, unsupported actions, test failures)
    if (status === 400) {
      const msg = backendMsg || 'The request could not be processed. Please check your input.';
      this.warning(msg, 'Invalid Request');
      return;
    }

    // 3. Status 401: Authentication Failures (Expired token, invalid credentials)
    if (status === 401) {
      const msg = backendMsg || 'Session expired or unauthenticated. Please log in again.';
      this.warning(msg, 'Authentication Required');
      return;
    }

    // 4. Status 403: Forbidden / Access Denied
    if (status === 403) {
      const msg = backendMsg || 'You do not have permission to perform this action.';
      this.error(msg, 'Access Denied');
      return;
    }

    // 5. Status 404: Not Found (Route not found, record ID does not exist)
    if (status === 404) {
      const msg = backendMsg || 'The requested record or resource could not be found.';
      this.warning(msg, 'Not Found');
      return;
    }

    // 6. Status 409: Conflict (Duplicate entry)
    if (status === 409) {
      const msg = backendMsg || 'A record with these details already exists.';
      this.warning(msg, 'Conflict Detected');
      return;
    }

    // 7. Status 422: Validation / Semantic Errors (Missing required fields, duplicate records, password mismatch)
    if (status === 422) {
      const msg = backendMsg || 'Validation failed. Please verify the entered information.';
      this.warning(msg, 'Validation Error');
      return;
    }

    // 8. Status 429: Rate limit
    if (status === 429) {
      this.warning('Too many requests. Please wait a moment and try again.', 'Too Many Requests');
      return;
    }

    // 9. Status 500..504: Server Error
    if (status >= 500 && status <= 504) {
      this.error('Server Error - Something went wrong.', 'Server Error');
      return;
    }

    // 10. Fallback for any other unexpected error status
    this.error(backendMsg || 'Server Error - Something went wrong.', 'Server Error');
  }

  /**
   * Remove a toast by ID.
   */
  remove(id: string): void {
    const current = this.toastsSubject.value;
    const updated = current.filter((t) => t.id !== id);
    if (updated.length !== current.length) {
      this.toastsSubject.next(updated);
    }
  }

  /**
   * Clear all active toasts.
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  private getDefaultTitle(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Server Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Notice';
    }
  }
}
