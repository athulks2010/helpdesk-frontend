import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class ConversationService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.conversationsAll, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.conversationSingle, { id, _id: id });
  }

  getMessages(conversationId: string | number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${apiUrl.conversationMessages}`, {
        params: this.toParams({
          conversation_id: conversationId,
          id: conversationId,
        }),
      })
      .pipe(
        map((res: any) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (res.data?.items) return res.data.items;
          if (res.data?.messages) return res.data.messages;
          if (Array.isArray(res.data)) return res.data;
          if (res.items) return res.items;
          if (res.messages) return res.messages;
          return res;
        })
      );
  }

  sendMessage(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${apiUrl.conversationMessages}`, body).pipe(
      map((res: any) => {
        if (res?.data?.item) return res.data.item;
        if (res?.data?.message && typeof res.data.message === 'object') return res.data.message;
        if (res?.item) return res.item;
        if (res?.message && typeof res.message === 'object') return res.message;
        if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
        return res;
      })
    );
  }

  markRead(body: {
    conversation_id?: string | number;
    message_id?: string | number;
    id?: string | number;
  }): Observable<any> {
    return this.post(apiUrl.conversationMarkRead, body);
  }

  /**
   * Create conversation (ticket-linked or standalone).
   * Laravel payload: ticket_id, conversation_type, participants, initial_message, context
   */
  createConversation(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${apiUrl.conversationCreate}`, body).pipe(
      map((res: any) => {
        if (res?.data?.conversation) return res.data.conversation;
        if (res?.data?.item) return res.data.item;
        if (res?.conversation) return res.conversation;
        if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
        return res;
      })
    );
  }

  deleteConversation(id: string | number): Observable<any> {
    return this.delete(apiUrl.conversationDelete, { id, _id: id });
  }

  uploadAttachments(conversationId: string | number, files: File[]): Observable<any> {
    const fd = new FormData();
    fd.append('conversation_id', String(conversationId));
    files.forEach((f) => fd.append('files[]', f, f.name));
    return this.http.post(`${this.baseUrl}${apiUrl.conversationUpload}`, fd).pipe(this.unwrap());
  }
}
