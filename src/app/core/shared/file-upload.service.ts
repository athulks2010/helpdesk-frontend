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
   * Upload an attachment and return structured attachment data (path, name, size, type).
   * @param file - The File object to upload
   * @param folder - The folder name to store the file in (default 'tickets')
   */
  uploadAttachment(file: File, folder: string = 'tickets'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http
      .post<any>(`${this.baseUrl}/file-upload/upload`, formData)
      .pipe(
        map((res: any) => {
          const item = res?.data?.item ?? res?.item ?? res?.data ?? res;
          const path = typeof item === 'string' ? item : item?.path || item?.url || '';
          return {
            path,
            name: (typeof item === 'object' ? item?.name || item?.file_name || item?.original_name : null) || file.name,
            file_name: (typeof item === 'object' ? item?.file_name || item?.name : null) || file.name,
            file_size: (typeof item === 'object' ? item?.file_size || item?.size : null) || file.size,
            file_type: (typeof item === 'object' ? item?.file_type || item?.mime_type || item?.type : null) || file.type,
            ...(typeof item === 'object' ? item : {}),
          };
        })
      );
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
