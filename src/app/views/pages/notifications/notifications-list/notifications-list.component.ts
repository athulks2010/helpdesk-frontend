import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../../core/notification/_services/notification.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
})
export class NotificationsListComponent implements OnInit {
  rows: any[] = [];
  loading = true;
  error = '';
  markingId: string | number | null = null;
  markingAll = false;

  constructor(private service: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll({}).subscribe({
      next: (data: any) => {
        this.rows = Array.isArray(data) ? data : (data?.items || data?.list || data?.data || []);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load notifications';
        this.loading = false;
      },
    });
  }

  isUnread(row: any): boolean {
    return !row?.read_at && row?.is_read !== true && row?.read !== true;
  }

  message(row: any): string {
    return (
      row?.data?.message ||
      row?.message ||
      row?.title ||
      row?.body ||
      'Notification'
    );
  }

  subject(row: any): string | null {
    return row?.data?.ticket_subject || row?.ticket_subject || null;
  }

  rowId(row: any): string | number | null {
    return row?.id || row?._id || null;
  }

  markRead(row: any, event?: Event): void {
    event?.stopPropagation();
    const id = this.rowId(row);
    if (!id || !this.isUnread(row)) return;
    this.markingId = id;
    this.service.markAsRead(id).subscribe({
      next: () => {
        this.markingId = null;
        row.read_at = new Date().toISOString();
        row.is_read = true;
      },
      error: () => {
        this.markingId = null;
        this.error = 'Failed to mark notification as read';
      },
    });
  }

  markAllRead(): void {
    if (!this.rows.some((r) => this.isUnread(r))) return;
    this.markingAll = true;
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.markingAll = false;
        const now = new Date().toISOString();
        this.rows.forEach((r) => {
          r.read_at = r.read_at || now;
          r.is_read = true;
        });
      },
      error: () => {
        this.markingAll = false;
        this.error = 'Failed to mark all notifications as read';
      },
    });
  }

  unreadCount(): number {
    return this.rows.filter((r) => this.isUnread(r)).length;
  }

  formatDate(value: any): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }
}
