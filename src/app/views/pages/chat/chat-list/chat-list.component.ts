import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ConversationService } from '../../../../core/conversation/_services/conversation.service';
import { PusherService } from '../../../../core/realtime/pusher.service';
import { AuthService } from '../../../../core/auth/_services/auth.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild('messagesPane') messagesPane?: ElementRef<HTMLDivElement>;

  rows: any[] = [];
  messages: any[] = [];
  selected: any = null;
  draft = '';
  loading = true;
  messagesLoading = false;
  sending = false;
  error = '';
  sendError = '';
  realtimeConnected = false;
  private channelName = '';
  private pendingTempId: string | null = null;

  constructor(
    private service: ConversationService,
    private pusher: PusherService,
    private auth: AuthService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.teardownRealtime();
  }

  get currentUserId(): number | string | null {
    return this.auth.currentUserValue?.id ?? null;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll({}).subscribe({
      next: (data: any) => {
        this.rows = this.extractList(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load chat';
        this.loading = false;
      },
    });
  }

  open(row: any): void {
    this.teardownRealtime();
    this.selected = row;
    this.messages = [];
    this.sendError = '';
    this.messagesLoading = true;

    const conversationId = row.id ?? row._id;
    this.service.getMessages(conversationId).subscribe({
      next: (data: any) => {
        this.messages = this.extractMessages(data);
        this.messagesLoading = false;
        this.setupRealtime(conversationId);
        this.scrollToBottom();
      },
      error: () => {
        this.messagesLoading = false;
        this.sendError = 'Failed to load messages';
      },
    });
  }

  send(): void {
    if (!this.selected || !this.draft.trim() || this.sending) return;

    const text = this.draft.trim();
    const conversationId = this.selected.id ?? this.selected._id;
    const tempId = `temp-${Date.now()}`;
    this.pendingTempId = tempId;
    this.sending = true;
    this.sendError = '';
    this.draft = '';

    // Optimistic append so the message appears immediately
    const optimistic = {
      id: tempId,
      _temp: true,
      message: text,
      body: text,
      conversation_id: conversationId,
      user_id: this.currentUserId,
      created_at: new Date().toISOString(),
      user: this.auth.currentUserValue || null,
    };
    this.appendMessage(optimistic);
    this.scrollToBottom();

    this.service
      .sendMessage({
        conversation_id: conversationId,
        message: text,
      })
      .subscribe({
        next: (res: any) => {
          this.sending = false;
          const msg = this.normalizeMessage(res);
          if (msg) {
            this.replaceTempOrAppend(tempId, msg);
          }
          this.pendingTempId = null;
          this.bumpConversation(conversationId);
          this.scrollToBottom();
        },
        error: () => {
          this.sending = false;
          this.pendingTempId = null;
          // Remove optimistic message and restore draft
          this.messages = this.messages.filter((m) => m.id !== tempId);
          this.draft = text;
          this.sendError = 'Failed to send message. Please try again.';
        },
      });
  }

  isMine(m: any): boolean {
    const uid = this.currentUserId;
    if (uid == null) return !!m?._temp;
    return String(m?.user_id ?? m?.user?.id ?? '') === String(uid);
  }

  messageText(m: any): string {
    return m?.message || m?.body || m?.text || '—';
  }

  displayName(m: any): string {
    const u = m?.user || m?.contact;
    if (!u) return this.isMine(m) ? 'You' : 'User';
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
    return name || u.name || u.email || (this.isMine(m) ? 'You' : 'User');
  }

  formatTime(value: any): string {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }

  private setupRealtime(conversationId: string | number): void {
    this.channelName = `chat.${conversationId}`;
    const ch = this.pusher.subscribe(this.channelName);
    this.realtimeConnected = !!ch;

    if (!ch) {
      // Pusher key missing — send still works via API optimistic update
      return;
    }

    const onEvent = (payload: any) => {
      this.zone.run(() => {
        const msg = this.normalizeMessage(payload);
        if (!msg) return;
        // Only accept messages for the open conversation
        if (
          msg.conversation_id != null &&
          String(msg.conversation_id) !== String(conversationId)
        ) {
          return;
        }
        this.appendMessage(msg);
        this.bumpConversation(conversationId);
        this.scrollToBottom();
      });
    };

    // Laravel broadcasts as NewChatMessage with { chatMessage: {...} }
    ch.bind('NewChatMessage', onEvent);
    ch.bind('NewPublicChatMessage', onEvent);
    // Also listen without namespace / .client variants if backend differs
    ch.bind('message.created', onEvent);
  }

  private teardownRealtime(): void {
    if (this.channelName) {
      this.pusher.unsubscribe(this.channelName);
      this.channelName = '';
    }
    this.realtimeConnected = false;
  }

  /** Normalize API / Pusher payloads into a flat message object */
  private normalizeMessage(raw: any): any | null {
    if (!raw) return null;

    // Pusher: { chatMessage: {...} }
    if (raw.chatMessage) return this.normalizeMessage(raw.chatMessage);

    // API wrappers matching ticket style
    if (raw.data?.item) return this.normalizeMessage(raw.data.item);
    if (raw.data?.message && typeof raw.data.message === 'object') {
      return this.normalizeMessage(raw.data.message);
    }
    if (raw.item) return this.normalizeMessage(raw.item);
    if (raw.message && typeof raw.message === 'object' && (raw.message.id || raw.message.body || raw.message.message)) {
      return this.normalizeMessage(raw.message);
    }
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      // Prefer nested message fields over wrapper
      if (raw.data.id || raw.data.message || raw.data.body) {
        return this.normalizeMessage(raw.data);
      }
    }

    // Flat message
    if (raw.id || raw.message || raw.body || raw._temp) {
      return {
        id: raw.id,
        message: raw.message ?? raw.body ?? raw.text ?? '',
        body: raw.body ?? raw.message ?? raw.text ?? '',
        conversation_id: raw.conversation_id,
        user_id: raw.user_id ?? raw.user?.id ?? null,
        contact_id: raw.contact_id ?? raw.contact?.id ?? null,
        created_at: raw.created_at || new Date().toISOString(),
        updated_at: raw.updated_at,
        user: raw.user || null,
        contact: raw.contact || null,
        _temp: !!raw._temp,
      };
    }

    return null;
  }

  private extractList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  private extractMessages(data: any): any[] {
    const list =
      (Array.isArray(data) && data) ||
      data?.messages ||
      data?.items ||
      data?.list ||
      data?.data?.items ||
      data?.data?.messages ||
      (Array.isArray(data?.data) ? data.data : null) ||
      [];
    return (Array.isArray(list) ? list : [])
      .map((m) => this.normalizeMessage(m))
      .filter(Boolean);
  }

  private appendMessage(msg: any): void {
    if (!msg) return;
    if (msg.id != null && this.messages.some((m) => String(m.id) === String(msg.id))) {
      return;
    }
    // If a temp message with same text exists, replace it
    if (!msg._temp && this.pendingTempId) {
      const idx = this.messages.findIndex((m) => m.id === this.pendingTempId);
      if (idx >= 0) {
        this.messages = [
          ...this.messages.slice(0, idx),
          msg,
          ...this.messages.slice(idx + 1),
        ];
        this.pendingTempId = null;
        return;
      }
    }
    // Dedupe by identical text + user within last few seconds (broadcast after send)
    const dup = this.messages.find(
      (m) =>
        !m._temp &&
        msg.id != null &&
        String(m.id) === String(msg.id)
    );
    if (dup) return;

    this.messages = [...this.messages, msg];
  }

  private replaceTempOrAppend(tempId: string, msg: any): void {
    const idx = this.messages.findIndex((m) => m.id === tempId);
    if (idx >= 0) {
      // If real message already arrived via Pusher, just drop temp
      if (msg.id != null && this.messages.some((m) => String(m.id) === String(msg.id))) {
        this.messages = this.messages.filter((m) => m.id !== tempId);
        return;
      }
      this.messages = [
        ...this.messages.slice(0, idx),
        msg,
        ...this.messages.slice(idx + 1),
      ];
      return;
    }
    this.appendMessage(msg);
  }

  private bumpConversation(conversationId: string | number): void {
    const idx = this.rows.findIndex(
      (r) => String(r.id ?? r._id) === String(conversationId)
    );
    if (idx < 0) return;
    const updated = {
      ...this.rows[idx],
      updated_at: new Date().toISOString(),
    };
    this.rows = [updated, ...this.rows.filter((_, i) => i !== idx)];
    if (this.selected && String(this.selected.id) === String(conversationId)) {
      this.selected = updated;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const pane = this.messagesPane?.nativeElement;
      if (pane) {
        pane.scrollTop = pane.scrollHeight;
      }
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }
}
