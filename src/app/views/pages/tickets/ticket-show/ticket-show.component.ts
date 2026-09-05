import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { TicketService } from '../../../../core/ticket/_services/ticket.service';
import { ConversationService } from '../../../../core/conversation/_services/conversation.service';
import { AuthService } from '../../../../core/auth/_services/auth.service';
import { UserService } from '../../../../core/user/_services/user.service';

@Component({
  selector: 'app-ticket-show',
  templateUrl: './ticket-show.component.html',
  styleUrls: ['./ticket-show.component.scss'],
})
export class TicketShowComponent implements OnInit, OnDestroy {
  id!: string;
  ticket: any = null;
  loading = true;
  error = '';

  showDescription = true;
  isFavorited = false;
  favoriteLoading = false;
  copiedId = false;

  comments: any[] = [];
  commentForm!: FormGroup;
  commenting = false;
  commentError = '';

  conversations: any[] = [];
  loadingConversations = false;
  showNewConversationModal = false;
  conversationType: 'internal' | 'customer' = 'internal';
  conversationSubject = '';
  initialMessage = '';
  creatingConversation = false;
  conversationError = '';

  includeAssignee = true;
  showAddParticipants = false;
  participantSearchQuery = '';
  participantTab: 'all' | 'admins' | 'managers' | 'agents' = 'all';
  availableUsers: any[] = [];
  selectedAdditionalParticipants: any[] = [];

  quickTemplates = [
    {
      title: 'Status Update',
      description: 'Inform about ticket status changes',
      message: 'Status Update: We are currently reviewing your request and will keep you informed of any status changes.',
    },
    {
      title: 'Information Request',
      description: 'Request additional information from customer',
      message: 'Information Request: Could you please provide additional details or screenshots regarding this ticket?',
    },
    {
      title: 'Resolution Update',
      description: 'Provide resolution or next steps',
      message: 'Resolution Update: We have investigated the issue and provided resolution steps. Please test and verify.',
    },
    {
      title: 'Escalation Notice',
      description: 'Inform about ticket escalation',
      message: 'Escalation Notice: This ticket has been escalated to our engineering team for further investigation.',
    },
  ];

  private routeSub?: Subscription;
  private pollSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private conversationService: ConversationService,
    private userService: UserService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      body: ['', Validators.required],
    });

    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') || '';
      if (this.id) {
        this.loadTicketData();
      } else {
        this.error = 'Invalid ticket id';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  get currentUser(): any {
    return this.auth.currentUserValue;
  }

  get roleSlug(): string {
    const role = this.currentUser?.role;
    if (!role) return '';
    return typeof role === 'string' ? role : role.slug || role.name || '';
  }

  get isStaff(): boolean {
    return ['admin', 'manager', 'agent', 'agency', 'general'].includes(
      (this.roleSlug || '').toLowerCase()
    );
  }

  get isCustomer(): boolean {
    return (this.roleSlug || '').toLowerCase() === 'customer';
  }

  get isClosed(): boolean {
    const status = this.ticket?.status;
    const slug = (status?.slug || status?.name || status || '').toString().toLowerCase();
    return !!this.ticket?.closed || slug.includes('close') || slug.includes('cancel');
  }

  get canComment(): boolean {
    return !this.isClosed;
  }

  get canStartConversation(): boolean {
    return !!this.ticket && !this.isClosed;
  }

  /** Loads ticket detail from GET /ticket/single?id={id} */
  loadTicketData(): void {
    this.loading = true;
    this.error = '';
    this.ticket = null;
    this.pollSub?.unsubscribe();

    this.ticketService.getById(this.id).subscribe({
      next: (ticket) => {
        if (!ticket || ticket.id == null) {
          this.error = 'Ticket not found';
          this.loading = false;
          return;
        }
        this.ticket = ticket;
        this.id = String(ticket.id);
        this.isFavorited = !!(
          ticket.is_favorited ||
          ticket.is_favorite ||
          ticket.favorited
        );
        this.loading = false;
        this.loadFavoriteStatus();
        this.loadComments();
        this.loadConversations();
        // Laravel polls conversations every 30s
        this.pollSub = interval(30000).subscribe(() => this.loadConversations(true));
      },
      error: (err) => {
        this.error =
          err?.error?.message ||
          err?.error?.response?.message ||
          'Failed to load ticket details';
        this.loading = false;
      },
    });
  }

  loadFavoriteStatus(): void {
    const ticketId = this.ticket?.id || this.id;
    if (!ticketId) return;
    this.ticketService.getFavoriteStatus(ticketId).subscribe({
      next: (favorited) => {
        this.isFavorited = favorited;
      },
    });
  }

  loadComments(): void {
    const ticketId = this.ticket?.id || this.id;
    this.ticketService.getComments(ticketId).subscribe({
      next: (data) => {
        const fromTicket = Array.isArray(this.ticket?.comments) ? this.ticket.comments : [];
        const list = Array.isArray(data) ? data : [];
        this.comments = (list.length ? list : fromTicket).map((c: any) => this.normalizeComment(c));
      },
      error: () => {
        this.comments = (Array.isArray(this.ticket?.comments) ? this.ticket.comments : []).map(
          (c: any) => this.normalizeComment(c)
        );
      },
    });
  }

  private normalizeComment(c: any): any {
    if (!c) return c;
    return {
      ...c,
      body: c.body || c.comment || c.details || c.message || '',
      details: c.details || c.body || c.comment || c.message || '',
      created_at: c.created_at,
      user: c.user || null,
    };
  }

  addComment(): void {
    if (!this.canComment) return;
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.commenting = true;
    this.commentError = '';
    const text = (this.commentForm.value.body || '').trim();
    this.ticketService
      .addComment({
        ticket_id: this.ticket?.id || this.id,
        user_id: this.currentUser?.id,
        comment: text,
        body: text,
      })
      .subscribe({
        next: (newComment) => {
          this.commenting = false;
          this.commentForm.reset();
          const normalized = this.normalizeComment(
            newComment && (newComment.body || newComment.details || newComment.comment || newComment.message)
              ? newComment
              : {
                  body: text,
                  details: text,
                  created_at: new Date().toISOString(),
                  user: this.currentUser,
                }
          );
          this.comments = [...this.comments, normalized];
        },
        error: (err) => {
          this.commenting = false;
          this.commentError =
            err?.error?.message || err?.error?.response?.message || 'Failed to post comment';
        },
      });
  }

  loadConversations(silent = false): void {
    if (!silent) this.loadingConversations = true;
    const ticketId = this.ticket?.id || this.id;

    // Prefer dedicated ticket conversations endpoint; fall back to list filter
    this.ticketService.getTicketConversations(ticketId).subscribe({
      next: (list) => {
        if (list.length) {
          this.conversations = list;
          this.loadingConversations = false;
          return;
        }
        this.conversationService.getAll({ ticket_id: ticketId }).subscribe({
          next: (data) => {
            this.conversations = Array.isArray(data)
              ? data
              : data?.items || data?.list || data?.data || [];
            this.loadingConversations = false;
          },
          error: () => {
            this.conversations = Array.isArray(this.ticket?.conversations)
              ? this.ticket.conversations
              : [];
            this.loadingConversations = false;
          },
        });
      },
      error: () => {
        this.conversationService.getAll({ ticket_id: ticketId }).subscribe({
          next: (data) => {
            this.conversations = Array.isArray(data)
              ? data
              : data?.items || data?.list || [];
            this.loadingConversations = false;
          },
          error: () => {
            this.conversations = [];
            this.loadingConversations = false;
          },
        });
      },
    });
  }

  toggleFavorite(): void {
    if (this.favoriteLoading) return;
    const ticketId = this.ticket?.id || this.ticket?.uid || this.id;
    if (!ticketId) return;

    this.favoriteLoading = true;
    const previous = this.isFavorited;
    // Optimistic UI
    this.isFavorited = !previous;

    this.ticketService.toggleFavorite(ticketId, previous).subscribe({
      next: (favorited) => {
        this.isFavorited = favorited;
        this.favoriteLoading = false;
      },
      error: () => {
        this.isFavorited = previous;
        this.favoriteLoading = false;
      },
    });
  }

  copyTicketId(): void {
    navigator.clipboard.writeText(this.ticketKey());
    this.copiedId = true;
    setTimeout(() => (this.copiedId = false), 2000);
  }

  copyDescription(): void {
    navigator.clipboard.writeText(this.ticketBody());
  }

  ticketBody(): string {
    return this.ticket?.body || this.ticket?.details || this.ticket?.description || '';
  }

  assignee(): any {
    if (typeof this.ticket?.assigned_user === 'string') {
      return { name: this.ticket.assigned_user };
    }
    return this.ticket?.assignedTo || this.ticket?.assignee || this.ticket?.assigned_user || null;
  }

  customer(): any {
    if (typeof this.ticket?.user === 'string') {
      return { name: this.ticket.user };
    }
    return this.ticket?.user || null;
  }

  contactPerson(): any {
    return this.ticket?.contact || null;
  }

  ticketKey(): string {
    const key = this.ticket?.uid || this.ticket?.uuid || this.ticket?.key;
    if (key) return `#${key}`;
    return `#${this.ticket?.id || this.id}`;
  }

  slaStatus(): string {
    return (this.ticket?.sla_status || '').toString().toLowerCase();
  }

  slaLabel(): string {
    const s = this.slaStatus();
    if (s === 'breached' || this.ticket?.is_sla_breached) return 'SLA Breached';
    if (s === 'overdue' || this.ticket?.is_overdue) return 'Overdue';
    if (s === 'warning') return 'SLA Warning';
    if (s === 'normal') return 'SLA OK';
    return '';
  }

  displayName(user: any): string {
    if (!user) return '—';
    if (typeof user === 'string') return user;
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return name || user.name || user.email || '—';
  }

  displayEmail(user: any): string {
    return user?.email || '';
  }

  commentText(c: any): string {
    return c?.body || c?.details || c?.comment || c?.message || '';
  }

  toggleDescription(): void {
    this.showDescription = !this.showDescription;
  }

  shareTicket(): void {
    if (navigator.share) {
      navigator.share({
        title: `Ticket ${this.ticketKey()}`,
        text: this.ticket?.subject || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  printTicket(): void {
    if (!this.ticket) return;

    const uid = this.ticket.uid || this.ticket.uuid || this.ticket.id || this.id;
    const subject = this.ticket.subject || '';
    const printedOn = this.formatPrintDateTime(new Date().toISOString());
    const description = this.ticketBody() || 'N/A';
    const resolution = this.ticket.resolution || '';

    const fields: Array<{ label: string; value: string }> = [
      { label: 'Status', value: this.statusLabel() || 'N/A' },
      { label: 'Priority', value: this.priorityLabel() || 'N/A' },
      { label: 'Customer', value: this.displayName(this.customer()) || 'N/A' },
      {
        label: 'Assigned to',
        value: this.assignee() ? this.displayName(this.assignee()) : 'Unassigned',
      },
      { label: 'Department', value: this.departmentLabel() || 'N/A' },
      { label: 'Category', value: this.categoryLabel() || 'N/A' },
    ];

    const subCat =
      this.ticket.subCategory?.name ||
      this.ticket.sub_category?.name ||
      this.ticket.subcategory?.name;
    if (subCat) {
      fields.push({ label: 'Sub Category', value: subCat });
    }

    fields.push(
      { label: 'Type', value: this.typeLabel() || 'N/A' },
      {
        label: 'Source',
        value: this.capitalize(this.ticket.source || 'Web'),
      },
      {
        label: 'Created',
        value: this.formatPrintDateTime(this.ticket.created_at),
      }
    );

    if (this.ticket.due_date || this.ticket.due) {
      fields.push({
        label: 'Due Date',
        value: this.formatPrintDateTime(this.ticket.due_date || this.ticket.due),
      });
    }

    fields.push({
      label: 'Last Updated',
      value: this.formatPrintDateTime(this.ticket.updated_at),
    });

    if (this.ticket.impact_level) {
      fields.push({
        label: 'Impact Level',
        value: this.capitalize(this.ticket.impact_level),
      });
    }
    if (this.ticket.urgency_level) {
      fields.push({
        label: 'Urgency Level',
        value: this.capitalize(this.ticket.urgency_level),
      });
    }

    const infoRows = fields
      .map(
        (f) => `
      <div class="info-row">
        <span class="info-label">${this.escapeHtml(f.label)}:</span>
        <span class="info-value">${this.escapeHtml(f.value)}</span>
      </div>`
      )
      .join('');

    const commentsHtml =
      this.comments?.length > 0
        ? `
    <div class="ticket-section">
      <h2 class="section-title">Comments (${this.comments.length})</h2>
      <div class="timeline">
        ${this.comments
          .map((c) => {
            const author = this.displayName(c.user || c.author) || 'System';
            const date = this.formatPrintDateTime(c.created_at);
            const body = this.commentText(c) || '';
            return `
          <div class="timeline-item">
            <div class="timeline-header">
              <strong>${this.escapeHtml(author)}</strong>
              <span class="timeline-date">${this.escapeHtml(date)}</span>
            </div>
            <div class="timeline-content">${body}</div>
          </div>`;
          })
          .join('')}
      </div>
    </div>`
        : '';

    const resolutionHtml = resolution
      ? `
    <div class="ticket-section">
      <h2 class="section-title">Resolution</h2>
      <div class="ticket-content resolution-content">${resolution}</div>
    </div>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Print Ticket #${this.escapeHtml(String(uid))}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      padding: 10mm;
      max-width: 210mm;
      margin: 0 auto;
    }
    .print-header {
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
      text-align: center;
    }
    .ticket-id {
      font-size: 20pt;
      font-weight: bold;
      margin: 0 0 5px 0;
      color: #000;
    }
    .ticket-subject {
      font-size: 12pt;
      font-weight: bold;
      margin: 0 0 5px 0;
      color: #000;
    }
    .print-date {
      font-size: 9pt;
      color: #666;
    }
    .ticket-section { margin-bottom: 15px; }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin: 0 0 10px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid #ccc;
      color: #000;
    }
    .info-list { display: flex; flex-direction: column; }
    .info-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px dashed #d3d3d3;
    }
    .info-label {
      font-weight: bold;
      color: #000;
      margin-bottom: 2px;
    }
    .info-value {
      color: #000;
      text-align: left;
    }
    .ticket-content {
      padding: 15px;
      background: #fff;
      border: 1px solid #000;
      color: #000;
      line-height: 1.8;
      min-height: 40px;
    }
    .ticket-content p { margin: 0 0 10px 0; }
    .resolution-content { border-color: #000; }
    .timeline { display: flex; flex-direction: column; gap: 12px; }
    .timeline-item {
      padding: 12px;
      border: 1px solid #000;
      background: #fff;
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: bold;
    }
    .timeline-date {
      font-size: 10pt;
      color: #666;
      font-weight: normal;
    }
    .timeline-content { color: #000; line-height: 1.6; }
    .print-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #000;
      text-align: center;
    }
    .footer-line {
      border-top: 1px solid #ccc;
      margin: 10px 0;
    }
    .footer-text {
      font-size: 10pt;
      color: #666;
      margin: 5px 0;
    }
    .description-section {
      page-break-before: always;
    }
    @media print {
      body {
        background: white !important;
        margin: 0 !important;
        padding: 8mm !important;
        max-width: 100% !important;
      }
      .ticket-section { page-break-inside: avoid; }
      .info-row { page-break-inside: avoid; }
      .ticket-content, .timeline-item {
        background: white !important;
        border: 1px solid #000 !important;
      }
      * { color: #000 !important; }
      .print-date, .footer-text, .timeline-date { color: #666 !important; }
      @page { margin: 8mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1 class="ticket-id">Ticket #${this.escapeHtml(String(uid))}</h1>
    <p class="ticket-subject">${this.escapeHtml(subject)}</p>
    <div class="print-date">Printed on: ${this.escapeHtml(printedOn)}</div>
  </div>

  <div class="ticket-section">
    <h2 class="section-title">Ticket Information</h2>
    <div class="info-list">${infoRows}</div>
  </div>

  <div class="ticket-section description-section">
    <h2 class="section-title">Description</h2>
    <div class="ticket-content">${description}</div>
  </div>

  ${resolutionHtml}
  ${commentsHtml}

  <div class="print-footer">
    <div class="footer-line"></div>
    <p class="footer-text">Ticket #${this.escapeHtml(String(uid))} - ${this.escapeHtml(subject)}</p>
    <p class="footer-text">Printed on ${this.escapeHtml(printedOn)}</p>
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 250);
    };
  </script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      window.print();
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  private formatPrintDateTime(value: any): string {
    if (!value) return 'N/A';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const month = months[d.getMonth()];
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
    } catch {
      return String(value);
    }
  }

  private capitalize(value: any): string {
    const s = String(value || '');
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private escapeHtml(value: any): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  startConversation(): void {
    if (!this.canStartConversation) return;
    this.conversationType = this.isCustomer ? 'customer' : 'internal';
    this.conversationSubject = `Discussion for ${this.ticketKey()}: ${this.ticket?.subject || ''}`;
    this.initialMessage = '';
    this.conversationError = '';
    this.includeAssignee = true;
    this.showAddParticipants = false;
    this.selectedAdditionalParticipants = [];
    this.participantSearchQuery = '';
    this.showNewConversationModal = true;
    this.loadAvailableUsers();
  }

  toggleAddParticipants(): void {
    this.showAddParticipants = !this.showAddParticipants;
    if (this.showAddParticipants && !this.availableUsers.length) {
      this.loadAvailableUsers();
    }
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
    const custId = this.ticket?.user_id || this.ticket?.user?.id;
    const assgId = this.ticket?.assigned_to || this.ticket?.assignedTo?.id;

    return this.availableUsers.filter((u) => {
      if (String(u.id) === String(custId) || String(u.id) === String(assgId)) {
        return false;
      }
      if (this.participantSearchQuery) {
        const q = this.participantSearchQuery.toLowerCase();
        const name = this.displayName(u).toLowerCase();
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
    const idx = this.selectedAdditionalParticipants.findIndex((u) => String(u.id) === String(user.id));
    if (idx >= 0) {
      this.selectedAdditionalParticipants.splice(idx, 1);
    } else {
      this.selectedAdditionalParticipants.push(user);
    }
  }

  isUserSelected(user: any): boolean {
    return this.selectedAdditionalParticipants.some((u) => String(u.id) === String(user.id));
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

  getRoleBadge(user: any): string {
    if (!user) return 'User';
    return user.role?.name || user.role || 'Staff';
  }

  selectTemplate(tpl: any): void {
    this.initialMessage = tpl.message;
  }

  createConversationSubmit(): void {
    this.creatingConversation = true;
    this.conversationError = '';

    const customerId = this.ticket?.user_id || this.ticket?.user?.id;
    const assigneeId = this.ticket?.assigned_to || this.ticket?.assignedTo?.id;
    const selfId = this.currentUser?.id;

    const participants: Array<{ user_id: any; role: string }> = [];

    if (customerId) {
      participants.push({ user_id: customerId, role: 'customer' });
    }
    if (this.includeAssignee && assigneeId) {
      participants.push({ user_id: assigneeId, role: 'agent' });
    }
    if (selfId && !participants.some((p) => String(p.user_id) === String(selfId))) {
      participants.push({
        user_id: selfId,
        role: this.isCustomer ? 'customer' : 'agent',
      });
    }

    for (const user of this.selectedAdditionalParticipants) {
      if (!participants.some((p) => String(p.user_id) === String(user.id))) {
        participants.push({
          user_id: user.id,
          role: user.role?.name || user.role || 'participant',
        });
      }
    }

    const initMsg = this.initialMessage.trim();

    const payload = {
      ticket_id: this.ticket?.id || this.id,
      subject: this.conversationSubject.trim() || `Discussion for ${this.ticketKey()}: ${this.ticket?.subject || ''}`,
      title: this.conversationSubject.trim() || `Discussion for ${this.ticketKey()}: ${this.ticket?.subject || ''}`,
      conversation_type: this.conversationType,
      type: this.conversationType,
      participants,
      initial_message: initMsg || undefined,
      message: initMsg || undefined,
      body: initMsg || undefined,
      context: {
        ticket_uid: this.ticket?.uid || this.ticket?.uuid || this.ticketKey(),
        ticket_subject: this.ticket?.subject,
        ticket_status: this.ticket?.status?.name || this.ticket?.status,
        customer_name: this.displayName(this.customer()),
        initiated_by: this.isCustomer ? 'customer' : 'staff',
      },
    };

    this.conversationService.createConversation(payload).subscribe({
      next: (created) => {
        const createdId = created?.id || created?._id || created?.conversation?.id || created?.data?.id || created?.data?.conversation?.id;
        const contactId = this.ticket?.contact_id || this.ticket?.contact?.id || 0;

        if (initMsg && createdId) {
          this.conversationService.sendMessage({
            conversation_id: createdId,
            message: initMsg,
            contact_id: contactId,
          }).subscribe({
            next: () => {
              this.creatingConversation = false;
              this.showNewConversationModal = false;
              this.conversationSubject = '';
              this.initialMessage = '';
              this.conversations = [created, ...this.conversations];
              this.openConversation(created);
            },
            error: () => {
              this.creatingConversation = false;
              this.showNewConversationModal = false;
              this.conversationSubject = '';
              this.initialMessage = '';
              this.conversations = [created, ...this.conversations];
              this.openConversation(created);
            },
          });
        } else {
          this.creatingConversation = false;
          this.showNewConversationModal = false;
          this.conversationSubject = '';
          this.initialMessage = '';
          if (createdId) {
            this.conversations = [created, ...this.conversations];
            this.openConversation(created);
          } else {
            this.loadConversations();
          }
        }
      },
      error: (err) => {
        this.creatingConversation = false;
        this.conversationError =
          err?.error?.message || err?.error?.response?.message || 'Failed to start conversation';
      },
    });
  }

  openConversation(conv: any): void {
    const cid = conv?.id || conv?._id;
    if (!cid) return;
    this.router.navigate(['/chat'], { queryParams: { conversation_id: cid } });
  }

  conversationTitle(conv: any): string {
    return conv?.subject || conv?.title || `Conversation #${conv?.id || ''}`;
  }

  conversationTypeLabel(conv: any): string {
    return (conv?.type || conv?.conversation_type || 'internal').toString();
  }

  editTicket(): void {
    this.router.navigate(['/tickets', this.ticket?.id || this.id, 'edit']);
  }

  getStatusClass(status: any): string {
    const s = (status?.name || status || '').toLowerCase();
    if (s.includes('open') || s.includes('new')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (s.includes('pending') || s.includes('waiting')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (s.includes('closed') || s.includes('resolved')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (s.includes('cancel')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }

  getStatusDotClass(status: any): string {
    const s = (status?.name || status || '').toLowerCase();
    if (s.includes('open') || s.includes('new')) return 'bg-blue-500';
    if (s.includes('pending') || s.includes('waiting')) return 'bg-amber-500';
    if (s.includes('closed') || s.includes('resolved')) return 'bg-emerald-500';
    if (s.includes('cancel')) return 'bg-red-500';
    return 'bg-slate-400';
  }

  getPriorityClass(priority: any): string {
    const p = (priority?.name || priority || '').toLowerCase();
    if (p.includes('high') || p.includes('urgent') || p.includes('critical')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (p.includes('medium') || p.includes('normal') || p.includes('generally')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (p.includes('low')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }

  getSlaClass(): string {
    const s = this.slaStatus();
    if (s === 'breached' || this.ticket?.is_sla_breached) return 'bg-red-100 text-red-700';
    if (s === 'overdue' || this.ticket?.is_overdue) return 'bg-orange-100 text-orange-700';
    if (s === 'warning') return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  priorityLabel(): string {
    const p = this.ticket?.priority;
    return p?.name || (typeof p === 'string' ? p : '') || '—';
  }

  statusLabel(): string {
    const s = this.ticket?.status;
    return s?.name || (typeof s === 'string' ? s : '') || '—';
  }

  departmentLabel(): string {
    const d = this.ticket?.department;
    return d?.name || (typeof d === 'string' ? d : '') || '—';
  }

  categoryLabel(): string {
    const c = this.ticket?.category;
    if (c?.name) return c.name;
    if (typeof c === 'string') return c;
    return this.ticket?.category_id ? `#${this.ticket.category_id}` : '—';
  }

  typeLabel(): string {
    const t = this.ticket?.type;
    return t?.name || (typeof t === 'string' ? t : '') || '—';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
