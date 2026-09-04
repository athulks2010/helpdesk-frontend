import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class FileUploadService extends ApiBaseService {

  /**
   * Upload a file to the server.
   * @param file - The File object to upload
   * @param folder - The folder name to store the file in (e.g. 'customers')
   * @returns Observable with the uploaded file path
   */
  upload(file: File, folder: string = 'general'): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http
      .post<any>(`${this.baseUrl}/file-upload/upload`, formData)
      .pipe(map((res: any) => res?.data?.item?.path || ''));
  }

  /**
   * Resolve a file path to a full URL.
   * @param path - relative or absolute path from the server
   */
  resolveUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  /**
   * Extract only the filename from a full path.
   * @param path - relative or absolute path from the server
   */
  getFileName(path: string | null | undefined): string {
    if (!path) return '';
    return path.split('/').pop() || path;
  }
}
