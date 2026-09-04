import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConversationService } from '../../../../core/conversation/_services/conversation.service';
import { PusherService } from '../../../../core/realtime/pusher.service';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { UserService } from '../../../../core/user/_services/user.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild('messagesPane') messagesPane?: ElementRef<HTMLDivElement>;

  rows: any[] = [];
  filteredRows: any[] = [];
  messages: any[] = [];
  selected: any = null;
  draft = '';
  search = '';
  filter: 'all' | 'unread' = 'all';
  loading = true;
  messagesLoading = false;
  sending = false;
  error = '';
  sendError = '';
  realtimeConnected = false;
  showCreateModal = false;
  createTitle = '';
  creating = false;
  createError = '';

  conversationType: 'internal' | 'customer' = 'internal';
  initialMessage = '';
  participantSearchQuery = '';
  participantTab: 'all' | 'admins' | 'managers' | 'agents' = 'all';
  availableUsers: any[] = [];
  selectedParticipants: any[] = [];

  quickTemplates = [
    {
      title: 'General Discussion',
      description: 'Start a team or user discussion',
      message: 'Hello! I am starting this conversation regarding our project updates.',
    },
    {
      title: 'Information Request',
      description: 'Request additional information',
      message: 'Information Request: Could you please share the details or files for review?',
    },
    {
      title: 'Follow-up Notice',
      description: 'Follow up on an ongoing task',
      message: 'Follow-up Notice: Following up on our previous discussion.',
    },
  ];

  private channelName = '';
  private pendingTempId: string | null = null;
  private routeSub?: Subscription;

  constructor(
    private service: ConversationService,
    private pusher: PusherService,
    private auth: AuthService,
    private userService: UserService,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      const cid = params.get('conversation_id');
      if (cid && this.rows.length) {
        this.openById(cid);
      }
    });
  }

  ngOnDestroy(): void {
    this.teardownRealtime();
    this.routeSub?.unsubscribe();
  }

  get currentUserId(): number | string | null {
    return this.auth.currentUserValue?.id ?? null;
  }

  get currentUserName(): string {
    const u = this.auth.currentUserValue;
    if (!u) return 'You';
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.email || 'You';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll({}).subscribe({
      next: (data: any) => {
        this.rows = this.extractList(data);
        this.applyFilters();
        this.loading = false;
        const cid = this.route.snapshot.queryParamMap.get('conversation_id');
        if (cid) this.openById(cid);
      },
      error: () => {
        this.error = 'Failed to load chat';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    const q = (this.search || '').toLowerCase().trim();
    let list = [...this.rows];
    if (this.filter === 'unread') {
      list = list.filter((r) => this.unreadCount(r) > 0);
    }
    if (q) {
      list = list.filter((r) => {
        const title = (r.subject || r.title || '').toLowerCase();
        const creator = (r.creator || '').toLowerCase();
        return title.includes(q) || creator.includes(q) || String(r.id).includes(q);
      });
    }
    this.filteredRows = list;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setFilter(f: 'all' | 'unread'): void {
    this.filter = f;
    this.applyFilters();
  }

  unreadCount(row: any): number {
    return Number(row?.total_entry || row?.unread_count || row?.unread || 0) || 0;
  }

  openById(id: string | number): void {
    const row = this.rows.find((r) => String(r.id ?? r._id) === String(id));
    if (row) this.open(row);
  }

  open(row: any): void {
    this.teardownRealtime();
    this.selected = row;
    this.messages = [];
    this.sendError = '';
    this.messagesLoading = true;

    const conversationId = row.id ?? row._id;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { conversation_id: conversationId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    // Mark conversation read (Laravel opens chat → marks unread)
    this.service.markRead({ conversation_id: conversationId, id: conversationId }).subscribe({
      next: () => {
        row.total_entry = 0;
        row.unread_count = 0;
        this.applyFilters();
      },
      error: () => {},
    });

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
    if (text.length > 1000) {
      this.sendError = 'Message must be 1000 characters or less';
      return;
    }

    const conversationId = this.selected.id ?? this.selected._id;
    const tempId = `temp-${Date.now()}`;
    this.pendingTempId = tempId;
    this.sending = true;
    this.sendError = '';
    this.draft = '';

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
        user_id: this.currentUserId,
      })
      .subscribe({
        next: (res: any) => {
          this.sending = false;
          const msg = this.normalizeMessage(res);
          if (msg) this.replaceTempOrAppend(tempId, msg);
          this.pendingTempId = null;
          this.bumpConversation(conversationId, text);
          this.scrollToBottom();
        },
        error: () => {
          this.sending = false;
          this.pendingTempId = null;
          this.messages = this.messages.filter((m) => m.id !== tempId);
          this.draft = text;
          this.sendError = 'Failed to send message. Please try again.';
        },
      });
  }

  openCreate(): void {
    this.createTitle = '';
    this.initialMessage = '';
    this.createError = '';
    this.conversationType = 'internal';
    this.participantSearchQuery = '';
    this.selectedParticipants = [];
    this.showCreateModal = true;
    this.loadAvailableUsers();
  }

  loadAvailableUsers(): void {
    if (this.availableUsers.length > 0) return;
    this.userService.getAll().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data?.items || res?.data || [];
        this.availableUsers = list;
      },
      error: () => {
        this.availableUsers = [];
      },
    });
  }

  filteredUsers(): any[] {
    return this.availableUsers.filter((u) => {
      if (String(u.id) === String(this.currentUserId)) {
        return false;
      }
      if (this.participantSearchQuery) {
        const q = this.participantSearchQuery.toLowerCase();
        const name = this.userDisplayName(u).toLowerCase();
        const email = (u.email || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }

      const roleName = (u.role?.name || u.role || '').toLowerCase();
      const roleId = Number(u.role_id || u.role?.id);
      if (this.participantTab === 'admins') return roleName.includes('admin') || roleId === 1;
      if (this.participantTab === 'managers') return roleName.includes('manager') || roleId === 5;
      if (this.participantTab === 'agents') return roleName.includes('agent') || roleId === 6;

      return true;
    });
  }

  toggleUserParticipant(user: any): void {
    const idx = this.selectedParticipants.findIndex((u) => String(u.id) === String(user.id));
    if (idx >= 0) {
      this.selectedParticipants.splice(idx, 1);
    } else {
      this.selectedParticipants.push(user);
    }
  }

  isUserSelected(user: any): boolean {
    return this.selectedParticipants.some((u) => String(u.id) === String(user.id));
  }

  getInitials(user: any): string {
    if (!user) return 'U';
    if (typeof user === 'string') {
      const parts = user.trim().split(' ');
      return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
    }
    const fname = user.first_name || user.name || '';
    const lname = user.last_name || '';
    if (fname && lname) return (fname[0] + lname[0]).toUpperCase();
    if (fname) return fname.substring(0, 2).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return 'U';
  }

  userDisplayName(user: any): string {
    if (!user) return 'User';
    if (typeof user === 'string') return user;
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return name || user.name || user.email || 'User';
  }

  getRoleBadge(user: any): string {
    if (!user) return 'User';
    return user.role?.name || user.role || 'Staff';
  }

  selectTemplate(tpl: any): void {
    this.initialMessage = tpl.message;
  }

  createConversation(): void {
    const defaultTitle = this.selectedParticipants.length
      ? `Chat with ${this.userDisplayName(this.selectedParticipants[0])}`
      : 'New Conversation';
    const title = this.createTitle.trim() || defaultTitle;
    const initMsg = this.initialMessage.trim();

    this.creating = true;
    this.createError = '';

    const participants: Array<{ user_id: any; role: string }> = [];
    if (this.currentUserId) {
      participants.push({ user_id: this.currentUserId, role: 'participant' });
    }

    for (const user of this.selectedParticipants) {
      if (!participants.some((p) => String(p.user_id) === String(user.id))) {
        participants.push({
          user_id: user.id,
          role: user.role?.name || user.role || 'participant',
        });
      }
    }

    const payload = {
      title,
      subject: title,
      conversation_type: this.conversationType,
      type: this.conversationType,
      participants,
      initial_message: initMsg || undefined,
      message: initMsg || undefined,
      body: initMsg || undefined,
    };

    this.service.createConversation(payload).subscribe({
      next: (created) => {
        const createdId = created?.id || created?._id || created?.conversation?.id || created?.data?.id || created?.data?.conversation?.id;

        if (initMsg && createdId) {
          this.service.sendMessage({
            conversation_id: createdId,
            message: initMsg,
          }).subscribe({
            next: () => {
              this.creating = false;
              this.showCreateModal = false;
              if (createdId) {
                this.rows = [created, ...this.rows];
                this.applyFilters();
                this.open(created);
              } else {
                this.load();
              }
            },
            error: () => {
              this.creating = false;
              this.showCreateModal = false;
              if (createdId) {
                this.rows = [created, ...this.rows];
                this.applyFilters();
                this.open(created);
              } else {
                this.load();
              }
            },
          });
        } else {
          this.creating = false;
          this.showCreateModal = false;
          if (createdId) {
            this.rows = [created, ...this.rows];
            this.applyFilters();
            this.open(created);
          } else {
            this.load();
          }
        }
      },
      error: (err) => {
        this.creating = false;
        this.createError = err?.error?.message || 'Failed to create conversation';
      },
    });
  }

  deleteSelected(): void {
    if (!this.selected) return;
    const id = this.selected.id ?? this.selected._id;
    if (!confirm('Delete this conversation?')) return;
    this.service.deleteConversation(id).subscribe({
      next: () => {
        this.teardownRealtime();
        this.rows = this.rows.filter((r) => String(r.id ?? r._id) !== String(id));
        this.applyFilters();
        this.selected = null;
        this.messages = [];
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { conversation_id: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
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

  conversationLabel(row: any): string {
    return row.subject || row.title || `Conversation #${row.id}`;
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
    if (!ch) return;

    const onEvent = (payload: any) => {
      this.zone.run(() => {
        const msg = this.normalizeMessage(payload);
        if (!msg) return;
        if (
          msg.conversation_id != null &&
          String(msg.conversation_id) !== String(conversationId)
        ) {
          return;
        }
        this.appendMessage(msg);
        // If message from someone else, mark read
        if (!this.isMine(msg) && msg.id) {
          this.service
            .markRead({
              conversation_id: conversationId,
              message_id: msg.id,
            })
            .subscribe({ error: () => {} });
        }
        this.bumpConversation(conversationId, this.messageText(msg));
        this.scrollToBottom();
      });
    };

    ch.bind('NewChatMessage', onEvent);
    ch.bind('NewPublicChatMessage', onEvent);
    ch.bind('message.created', onEvent);
  }

  private teardownRealtime(): void {
    if (this.channelName) {
      this.pusher.unsubscribe(this.channelName);
      this.channelName = '';
    }
    this.realtimeConnected = false;
  }

  private normalizeMessage(raw: any): any | null {
    if (!raw) return null;
    if (raw.chatMessage) return this.normalizeMessage(raw.chatMessage);
    if (raw.data?.item) return this.normalizeMessage(raw.data.item);
    if (raw.data?.message && typeof raw.data.message === 'object') {
      return this.normalizeMessage(raw.data.message);
    }
    if (raw.item) return this.normalizeMessage(raw.item);
    if (
      raw.message &&
      typeof raw.message === 'object' &&
      (raw.message.id || raw.message.body || raw.message.message)
    ) {
      return this.normalizeMessage(raw.message);
    }
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      if (raw.data.id || raw.data.message || raw.data.body) {
        return this.normalizeMessage(raw.data);
      }
    }
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
    this.messages = [...this.messages, msg];
  }

  private replaceTempOrAppend(tempId: string, msg: any): void {
    const idx = this.messages.findIndex((m) => m.id === tempId);
    if (idx >= 0) {
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

  private bumpConversation(conversationId: string | number, lastText?: string): void {
    const idx = this.rows.findIndex(
      (r) => String(r.id ?? r._id) === String(conversationId)
    );
    if (idx < 0) return;
    const updated = {
      ...this.rows[idx],
      updated_at: new Date().toISOString(),
      last_message: lastText || this.rows[idx].last_message,
    };
    this.rows = [updated, ...this.rows.filter((_, i) => i !== idx)];
    this.applyFilters();
    if (this.selected && String(this.selected.id) === String(conversationId)) {
      this.selected = updated;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const pane = this.messagesPane?.nativeElement;
      if (pane) pane.scrollTop = pane.scrollHeight;
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }
}
