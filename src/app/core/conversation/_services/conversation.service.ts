import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.getSingle(apiUrl.conversationMessages, {
      conversation_id: conversationId,
      id: conversationId,
    });
  }

  sendMessage(body: any): Observable<any> {
    return this.post(apiUrl.conversationMessages, body);
  }

  markRead(body: any): Observable<any> {
    return this.post(apiUrl.conversationMarkRead, body);
  }

  createConversation(body: any): Observable<any> {
    return this.post(apiUrl.conversationCreate, body);
  }
}
