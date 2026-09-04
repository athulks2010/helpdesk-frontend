import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TicketService } from '../../../../core/ticket/_services/ticket.service';
import { ConversationService } from '../../../../core/conversation/_services/conversation.service';

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

  conversations: any[] = [];
  loadingConversations = false;
  showNewConversationModal = false;
  conversationSubject = '';

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private conversationService: ConversationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      body: ['', Validators.required],
    });

    // React to /tickets/:id — always load via GET /ticket/single?id=...
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
  }

  /** Loads ticket detail from GET /ticket/single?id={id} */
  loadTicketData(): void {
    this.loading = true;
    this.error = '';
    this.ticket = null;

    this.ticketService.getById(this.id).subscribe({
      next: (ticket) => {
        if (!ticket || ticket.id == null) {
          this.error = 'Ticket not found';
          this.loading = false;
          return;
        }
        this.ticket = ticket;
        this.id = String(ticket.id);
        this.isFavorited = !!(ticket.is_favorite || ticket.favorited);
        this.loading = false;
        this.loadComments();
        this.loadConversations();
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

  loadComments(): void {
    const ticketId = this.ticket?.id || this.id;
    this.ticketService.getComments(ticketId).subscribe({
      next: (data) => {
        if (Array.isArray(this.ticket?.comments) && this.ticket.comments.length) {
          this.comments = this.ticket.comments;
          return;
        }
        const list = Array.isArray(data) ? data : data?.items || data?.list || data?.comments || [];
        this.comments = list;
      },
      error: () => {
        this.comments = Array.isArray(this.ticket?.comments) ? this.ticket.comments : [];
      },
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.commenting = true;
    const body = this.commentForm.value.body;
    this.ticketService
      .addComment({
        ticket_id: this.ticket?.id || this.id,
        body,
      })
      .subscribe({
        next: (newComment) => {
          this.commenting = false;
          this.commentForm.reset();
          if (newComment && (newComment.body || newComment.message)) {
            this.comments.push(newComment);
          } else {
            this.comments.push({
              body,
              created_at: new Date().toISOString(),
              user: { first_name: 'Current', last_name: 'User' },
            });
          }
        },
        error: () => {
          this.commenting = false;
          this.comments.push({
            body,
            created_at: new Date().toISOString(),
            user: { first_name: 'Current', last_name: 'User' },
          });
          this.commentForm.reset();
        },
      });
  }

  loadConversations(): void {
    this.loadingConversations = true;
    if (Array.isArray(this.ticket?.conversations)) {
      this.conversations = this.ticket.conversations;
      this.loadingConversations = false;
      return;
    }
    this.conversationService.getAll({ ticket_id: this.ticket?.id || this.id }).subscribe({
      next: (data) => {
        this.conversations = Array.isArray(data) ? data : (data?.items || data?.list || []);
        this.loadingConversations = false;
      },
      error: () => {
        this.conversations = [];
        this.loadingConversations = false;
      },
    });
  }

  toggleFavorite(): void {
    if (this.favoriteLoading) return;
    this.favoriteLoading = true;
    this.ticketService.toggleFavorite(this.ticket?.id || this.id).subscribe({
      next: () => {
        this.isFavorited = !this.isFavorited;
        this.favoriteLoading = false;
      },
      error: () => {
        this.favoriteLoading = false;
      },
    });
  }

  copyTicketId(): void {
    const key = this.ticketKey();
    navigator.clipboard.writeText(key);
    this.copiedId = true;
    setTimeout(() => (this.copiedId = false), 2000);
  }

  copyDescription(): void {
    navigator.clipboard.writeText(this.ticketBody());
    alert('Description copied to clipboard');
  }

  /** Ticket body text from /ticket/single (body | details | description) */
  ticketBody(): string {
    return this.ticket?.body || this.ticket?.details || this.ticket?.description || '';
  }

  /** Assignee from API: assignedTo (nested) */
  assignee(): any {
    return this.ticket?.assignedTo || this.ticket?.assignee || this.ticket?.assigned_user || null;
  }

  /** Customer from API: user */
  customer(): any {
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

  displayName(user: any): string {
    if (!user) return '—';
    if (typeof user === 'string') return user;
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return name || user.name || user.email || '—';
  }

  displayEmail(user: any): string {
    return user?.email || '';
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
      alert('Ticket link copied to clipboard');
    }
  }

  printTicket(): void {
    window.print();
  }

  startConversation(): void {
    this.showNewConversationModal = true;
    this.conversationSubject = `Discussion for ${this.ticketKey()}: ${this.ticket?.subject || ''}`;
  }

  createConversationSubmit(): void {
    if (!this.conversationSubject) return;
    this.conversationService
      .createConversation({
        ticket_id: this.ticket?.id || this.id,
        subject: this.conversationSubject,
      })
      .subscribe({
        next: (created) => {
          if (created) {
            this.conversations.push(created);
          } else {
            this.loadConversations();
          }
          this.showNewConversationModal = false;
          this.conversationSubject = '';
        },
        error: () => {
          this.showNewConversationModal = false;
        },
      });
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
