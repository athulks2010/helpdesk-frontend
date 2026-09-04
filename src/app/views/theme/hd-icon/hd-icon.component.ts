import { Component, Input } from '@angular/core';

@Component({
  selector: 'hd-icon',
  template: `
    <svg
      [attr.class]="class || 'w-4 h-4'"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [ngSwitch]="normalizedName"
    >
      <!-- Dashboard (LayoutDashboard) -->
      <ng-container *ngSwitchCase="'dashboard'">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </ng-container>

      <!-- Tickets -->
      <ng-container *ngSwitchCase="'ticket'">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </ng-container>

      <!-- Chat (MessageSquare) -->
      <ng-container *ngSwitchCase="'chat'">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </ng-container>

      <!-- Knowledge Base (BookOpen) -->
      <ng-container *ngSwitchCase="'knowledge'">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </ng-container>

      <!-- FAQs (HelpCircle) -->
      <ng-container *ngSwitchCase="'faq'">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </ng-container>

      <!-- Blog / Post / FileText -->
      <ng-container *ngSwitchCase="'blog'">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </ng-container>

      <!-- Page / File -->
      <ng-container *ngSwitchCase="'page'">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </ng-container>

      <!-- Services (LifeBuoy) -->
      <ng-container *ngSwitchCase="'service'">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" x2="9.17" y1="4.93" y2="9.17" />
        <line x1="14.83" x2="19.07" y1="14.83" y2="19.07" />
        <line x1="14.83" x2="19.07" y1="9.17" y2="4.93" />
        <line x1="4.93" x2="9.17" y1="19.07" y2="14.83" />
      </ng-container>

      <!-- Settings / Gear -->
      <ng-container *ngSwitchCase="'settings'">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </ng-container>

      <!-- Users / All Users / Customers -->
      <ng-container *ngSwitchCase="'users'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </ng-container>

      <!-- Single User -->
      <ng-container *ngSwitchCase="'user'">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </ng-container>

      <!-- Contacts (UserCheck) -->
      <ng-container *ngSwitchCase="'contact'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </ng-container>

      <!-- Organizations (Building) -->
      <ng-container *ngSwitchCase="'office'">
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
      </ng-container>

      <!-- Notes (Notebook) -->
      <ng-container *ngSwitchCase="'notes'">
        <path d="M2 6h4" />
        <path d="M2 10h4" />
        <path d="M2 14h4" />
        <path d="M2 18h4" />
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M16 2v20" />
      </ng-container>

      <!-- Global Setting (Globe) -->
      <ng-container *ngSwitchCase="'global_setting'">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </ng-container>

      <!-- Edit / Languages -->
      <ng-container *ngSwitchCase="'edit'">
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </ng-container>

      <!-- Form Builder (FormInput / Sliders) -->
      <ng-container *ngSwitchCase="'form-builder'">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </ng-container>

      <!-- Departments (Layers) -->
      <ng-container *ngSwitchCase="'departments'">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </ng-container>

      <!-- Category (Tag) -->
      <ng-container *ngSwitchCase="'category'">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      </ng-container>

      <!-- Status (CheckCircle) -->
      <ng-container *ngSwitchCase="'status'">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </ng-container>

      <!-- Priorities (AlertCircle) -->
      <ng-container *ngSwitchCase="'priorities'">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </ng-container>

      <!-- Types (List) -->
      <ng-container *ngSwitchCase="'types'">
        <line x1="8" x2="21" y1="6" y2="6" />
        <line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" />
        <line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" />
        <line x1="3" x2="3.01" y1="18" y2="18" />
      </ng-container>

      <!-- Email / Templates (Mail) -->
      <ng-container *ngSwitchCase="'email'">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </ng-container>

      <!-- SMTP Mail / Email Template (MailOpen) -->
      <ng-container *ngSwitchCase="'email_template'">
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
      </ng-container>

      <!-- User Roles (UserCog) -->
      <ng-container *ngSwitchCase="'user_role'">
        <circle cx="10" cy="7" r="4" />
        <path d="M10.3 15H6a4 4 0 0 0-4 4v2" />
        <circle cx="19" cy="11" r="2" />
        <path d="m19 8v1" />
        <path d="m19 13v1" />
        <path d="m21.6 9.5-.9.5" />
        <path d="m17.3 12-.9.5" />
        <path d="m21.6 12.5-.9-.5" />
        <path d="m17.3 10-.9-.5" />
      </ng-container>

      <!-- Archive / Latest Updates -->
      <ng-container *ngSwitchCase="'archive'">
        <rect width="20" height="5" x="2" y="3" rx="1" />
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
        <path d="M10 12h4" />
      </ng-container>

      <!-- Chevron Down -->
      <ng-container *ngSwitchCase="'chevron-down'">
        <polyline points="6 9 12 15 18 9" />
      </ng-container>

      <!-- Chevron Right -->
      <ng-container *ngSwitchCase="'chevron-right'">
        <polyline points="9 18 15 12 9 6" />
      </ng-container>

      <!-- Home -->
      <ng-container *ngSwitchCase="'home'">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </ng-container>

      <!-- Bell / Notification -->
      <ng-container *ngSwitchCase="'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </ng-container>

      <!-- Sun -->
      <ng-container *ngSwitchCase="'sun'">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </ng-container>

      <!-- Moon -->
      <ng-container *ngSwitchCase="'moon'">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </ng-container>

      <!-- Menu -->
      <ng-container *ngSwitchCase="'menu'">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </ng-container>

      <!-- Close (X) -->
      <ng-container *ngSwitchCase="'x'">
        <line x1="18" x2="6" y1="6" y2="18" />
        <line x1="6" x2="18" y1="6" y2="18" />
      </ng-container>

      <!-- LogOut -->
      <ng-container *ngSwitchCase="'logout'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </ng-container>

      <!-- Dash / Minus -->
      <ng-container *ngSwitchCase="'dash'">
        <line x1="5" x2="19" y1="12" y2="12" />
      </ng-container>

      <!-- Default Fallback Circle / File -->
      <ng-container *ngSwitchDefault>
        <circle cx="12" cy="12" r="3" />
      </ng-container>
    </svg>
  `
})
export class HdIconComponent {
  @Input() name = '';
  @Input() class = 'w-4 h-4';

  get normalizedName(): string {
    const n = (this.name || '').toLowerCase().replace(/[-_]/g, '');
    if (n === 'dashboard' || n === 'layoutdashboard') return 'dashboard';
    if (n === 'ticket' || n === 'tickets') return 'ticket';
    if (n === 'chat') return 'chat';
    if (n === 'knowledge' || n === 'knowledgebase') return 'knowledge';
    if (n === 'faq' || n === 'faqs') return 'faq';
    if (n === 'blog' || n === 'blogs' || n === 'post') return 'blog';
    if (n === 'service' || n === 'services') return 'service';
    if (n === 'settings' || n === 'gear') return 'settings';
    if (n === 'page' || n === 'file') return 'page';
    if (n === 'allusers' || n === 'users') return 'users';
    if (n === 'user') return 'user';
    if (n === 'contact' || n === 'contacts') return 'contact';
    if (n === 'office' || n === 'organization' || n === 'organizations') return 'office';
    if (n === 'notes' || n === 'note') return 'notes';
    if (n === 'global' || n === 'globalsetting') return 'global_setting';
    if (n === 'edit' || n === 'language' || n === 'languages') return 'edit';
    if (n === 'formbuilder' || n === 'customfields') return 'form-builder';
    if (n === 'departments' || n === 'department') return 'departments';
    if (n === 'category' || n === 'categories') return 'category';
    if (n === 'status' || n === 'statuses') return 'status';
    if (n === 'priorities' || n === 'priority') return 'priorities';
    if (n === 'types' || n === 'type') return 'types';
    if (n === 'email' || n === 'emailtemplates' || n === 'templates') return 'email';
    if (n === 'emailtemplate' || n === 'smtp') return 'email_template';
    if (n === 'userrole' || n === 'roles' || n === 'role') return 'user_role';
    if (n === 'archive' || n === 'updates') return 'archive';
    if (n === 'chevrondown') return 'chevron-down';
    if (n === 'chevronright') return 'chevron-right';
    if (n === 'home') return 'home';
    if (n === 'bell' || n === 'notification') return 'bell';
    if (n === 'sun') return 'sun';
    if (n === 'moon') return 'moon';
    if (n === 'menu') return 'menu';
    if (n === 'x' || n === 'close') return 'x';
    if (n === 'logout' || n === 'signout') return 'logout';
    if (n === 'dash') return 'dash';
    return (this.name || '').toLowerCase();
  }
}
