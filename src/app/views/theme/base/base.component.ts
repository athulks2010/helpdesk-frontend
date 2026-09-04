import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/_services/auth.service';
import { UserModel } from '../../../core/auth/_models/user.model';
import { NotificationService } from '../../../core/notification/_services/notification.service';

export interface SubMenuItem {
  name: string;
  path: string;
  icon?: string;
  permission?: string;
  adminOnly?: boolean;
}

export interface MenuItem {
  name: string;
  path?: string;
  icon: string;
  permission?: string;
  adminOnly?: boolean;
  submenu?: SubMenuItem[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface Breadcrumb {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  currentUser$!: Observable<UserModel | null>;
  currentUser: UserModel | null = null;
  private authSub?: Subscription;
  private routerSub?: Subscription;

  currentUrl = '';
  currentTitle = 'Dashboard';
  breadcrumbs: Breadcrumb[] = [];

  // Submenu toggle state
  expandedMenus = new Set<string>();

  // Topbar dropdown states
  userDropdownOpen = false;
  notificationDropdownOpen = false;
  langDropdownOpen = false;
  currentMode: 'light' | 'dark' = 'light';

  // Topbar notifications (loaded from API)
  notifications: Array<{
    id: string;
    read_at: string | null;
    message: string;
    ticket_subject?: string;
    time?: string;
  }> = [];
  notificationsLoading = false;

  selectedLanguage = { code: 'en', name: 'English' };
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'bd', name: 'বাংলা' },
    { code: 'cn', name: '中文' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.auth.currentUser$;
    this.authSub = this.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    if (this.auth.getToken() && !this.auth.currentUserValue) {
      this.auth.me().subscribe();
    }

    this.loadNotifications();

    this.currentUrl = this.router.url;
    this.updateCurrentTitle(this.currentUrl);
    this.autoExpandActiveSubmenus(this.currentUrl);

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
        this.updateCurrentTitle(this.currentUrl);
        this.autoExpandActiveSubmenus(this.currentUrl);
        this.mobileMenuOpen = false;
        this.closeAllDropdowns();
      });

    // Initialize dark/light mode
    const storedMode = localStorage.getItem('mode') as 'light' | 'dark' | null;
    if (storedMode === 'dark' || (!storedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.setMode('dark');
    } else {
      this.setMode('light');
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.userDropdownOpen = false;
    }
    if (!target.closest('.notification-dropdown-container')) {
      this.notificationDropdownOpen = false;
    }
    if (!target.closest('.lang-dropdown-container')) {
      this.langDropdownOpen = false;
    }
  }

  closeAllDropdowns(): void {
    this.userDropdownOpen = false;
    this.notificationDropdownOpen = false;
    this.langDropdownOpen = false;
  }

  /**
   * Permission access checking matching Laravel MainMenu.vue:
   * Checks user.access[module][action] or parsed role.access
   */
  hasAccess(module: string, action: 'read' | 'create' | 'update' | 'delete' = 'read'): boolean {
    if (!this.currentUser) return true; // fallback if loaded before profile

    const role = this.currentUser.role;
    const roleSlug = typeof role === 'string' ? role : role?.slug;
    if (roleSlug === 'admin') return true;

    // Check direct access dictionary on user
    const directAccess = this.currentUser.access;
    if (directAccess && directAccess[module]) {
      return !!directAccess[module][action];
    }

    // Check parsed role.access JSON string if present
    if (role && typeof role === 'object' && role.access) {
      try {
        const parsed = typeof role.access === 'string' ? JSON.parse(role.access) : role.access;
        if (parsed && parsed[module]) {
          return !!parsed[module][action];
        }
      } catch {
        // ignore parse error
      }
    }

    return false;
  }

  get isAdmin(): boolean {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;
    const roleSlug = typeof role === 'string' ? role : role?.slug;
    return roleSlug === 'admin';
  }

  /**
   * Computes menu groups filtered by authenticated user permissions
   */
  get menuGroups(): MenuGroup[] {
    const groups: MenuGroup[] = [
      {
        title: 'MAIN',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Tickets', path: '/tickets', icon: 'ticket', permission: 'ticket' },
          { name: 'Chat', path: '/chat', icon: 'chat', permission: 'chat' },
        ].filter((item) => !item.permission || this.hasAccess(item.permission, 'read')),
      },
      {
        title: 'CONTENT',
        items: [
          { name: 'Knowledge Base', path: '/knowledge-base', icon: 'knowledge', permission: 'knowledge_base' },
          { name: 'FAQs', path: '/faqs', icon: 'faq', permission: 'faq' },
          { name: 'Blog', path: '/blogs', icon: 'blog', permission: 'blog' },
          { name: 'Services', path: '/admin-services', icon: 'service', permission: 'front_page' },
          {
            name: 'Front Pages',
            icon: 'settings',
            permission: 'front_page',
            submenu: [
              { name: 'Home', path: '/front-pages/home' },
              { name: 'Services', path: '/front-pages/services' },
              { name: 'Contact', path: '/front-pages/contact' },
              { name: 'Privacy Policy', path: '/front-pages/privacy' },
              { name: 'Terms of services', path: '/front-pages/terms' },
              { name: 'Footer', path: '/front-pages/footer' },
            ],
          },
        ].filter((item) => !item.permission || this.hasAccess(item.permission, 'read')),
      },
      {
        title: 'MANAGEMENT',
        items: [
          { name: 'Customers', path: '/customers', icon: 'users', permission: 'customer' },
          { name: 'Contacts', path: '/contacts', icon: 'contact', permission: 'contact' },
          { name: 'Organizations', path: '/organizations', icon: 'office', permission: 'organization' },
          { name: 'Notes', path: '/notes', icon: 'notes' },
          { name: 'Manage Users', path: '/users', icon: 'users', permission: 'user' },
          { name: 'Pending Users', path: '/pending-users', icon: 'users', permission: 'user', adminOnly: true },
          { name: 'Reports', path: '/reports', icon: 'dashboard', permission: 'global' },
        ].filter((item) => {
          if (item.adminOnly) return this.isAdmin;
          return !item.permission || this.hasAccess(item.permission, 'read');
        }),
      },
      {
        title: 'CONFIGURATION',
        items: this.buildConfigurationItems(),
      },
    ];

    // Only return groups that have items
    return groups.filter((g) => g.items.length > 0);
  }

  private buildConfigurationItems(): MenuItem[] {
    const settingSubmenus: SubMenuItem[] = [
      { name: 'Global', path: '/settings', icon: 'global_setting', permission: 'global' },
      { name: 'Languages', path: '/settings/languages', icon: 'edit', permission: 'language' },
      { name: 'Navigation Menus', path: '/settings/menus', icon: 'page', permission: 'front_page' },
      { name: 'Custom fields', path: '/settings/ticket-fields', icon: 'form-builder', permission: 'global' },
      { name: 'Departments', path: '/departments', icon: 'departments', permission: 'department' },
      { name: 'Categories', path: '/categories', icon: 'category', permission: 'category' },
      { name: 'Status', path: '/statuses', icon: 'status', permission: 'status' },
      { name: 'Priorities', path: '/priorities', icon: 'priorities', permission: 'priority' },
      { name: 'Types', path: '/types', icon: 'types', permission: 'type' },
      { name: 'Email Templates', path: '/settings/email-templates', icon: 'email', permission: 'email_template' },
      { name: 'SMTP Mail', path: '/settings/smtp', icon: 'email_template', permission: 'smtp' },
      { name: 'Pusher Chat', path: '/settings/pusher', icon: 'chat', permission: 'pusher' },
      { name: 'Email to ticket', path: '/settings/piping', icon: 'ticket', adminOnly: true },
      { name: 'User Roles', path: '/roles', icon: 'user_role', adminOnly: true },
      { name: 'Ai Settings', path: '/ai', icon: 'settings', adminOnly: true },
      { name: 'License', path: '/settings/license', icon: 'user_role', adminOnly: true },
      { name: 'Latest Updates', path: '/settings', icon: 'archive', adminOnly: true },
    ].filter((sub) => {
      if (sub.adminOnly) return this.isAdmin;
      if (sub.permission) return this.hasAccess(sub.permission, 'read');
      return true;
    });

    if (settingSubmenus.length > 0) {
      return [
        {
          name: 'Settings',
          icon: 'settings',
          submenu: settingSubmenus,
        },
      ];
    }
    return [];
  }

  toggleSubmenu(name: string): void {
    if (this.expandedMenus.has(name)) {
      this.expandedMenus.delete(name);
    } else {
      this.expandedMenus.add(name);
    }
  }

  isSubmenuExpanded(name: string): boolean {
    return this.expandedMenus.has(name);
  }

  private autoExpandActiveSubmenus(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (
      cleanUrl.startsWith('/front-pages') ||
      cleanUrl.startsWith('/services') ||
      cleanUrl.startsWith('/landing')
    ) {
      this.expandedMenus.add('Front Pages');
    }
    if (
      cleanUrl.startsWith('/settings') ||
      cleanUrl.startsWith('/departments') ||
      cleanUrl.startsWith('/categories') ||
      cleanUrl.startsWith('/statuses') ||
      cleanUrl.startsWith('/priorities') ||
      cleanUrl.startsWith('/types') ||
      cleanUrl.startsWith('/roles') ||
      cleanUrl.startsWith('/ai')
    ) {
      this.expandedMenus.add('Settings');
    }
  }

  isItemActive(item: MenuItem): boolean {
    if (!item.path) return false;
    const cleanCurrent = this.currentUrl.split('?')[0].split('#')[0];
    if (item.path === '/dashboard') {
      return cleanCurrent === '/dashboard' || cleanCurrent === '/dashboard/';
    }
    return cleanCurrent === item.path || cleanCurrent.startsWith(item.path + '/');
  }

  isSubItemActive(sub: SubMenuItem): boolean {
    const cleanCurrent = this.currentUrl.split('?')[0].split('#')[0];
    return cleanCurrent === sub.path || (sub.path !== '/' && cleanCurrent.startsWith(sub.path + '/'));
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.submenu) return false;
    return item.submenu.some((sub) => this.isSubItemActive(sub));
  }

  private setPage(title: string, breadcrumbs: Breadcrumb[]): void {
    this.currentTitle = title;
    this.breadcrumbs = breadcrumbs;
  }

  private updateCurrentTitle(url: string): void {
    const clean = url.split('?')[0].split('#')[0];
    const parts = clean.replace(/^\//, '').split('/').filter(Boolean);
    const segment = parts[0] || 'dashboard';

    const modules: Record<string, { title: string; singular: string; path: string }> = {
      dashboard: { title: 'Dashboard', singular: 'dashboard', path: '/dashboard' },
      tickets: { title: 'Tickets', singular: 'ticket', path: '/tickets' },
      chat: { title: 'Chat', singular: 'chat', path: '/chat' },
      customers: { title: 'Customers', singular: 'customer', path: '/customers' },
      contacts: { title: 'Contacts', singular: 'contact', path: '/contacts' },
      organizations: { title: 'Organizations', singular: 'organization', path: '/organizations' },
      notes: { title: 'Notes', singular: 'note', path: '/notes' },
      users: { title: 'Users', singular: 'user', path: '/users' },
      'pending-users': { title: 'Pending Users', singular: 'pending user', path: '/pending-users' },
      'knowledge-base': { title: 'Knowledge Base', singular: 'article', path: '/knowledge-base' },
      faqs: { title: 'FAQs', singular: 'FAQ', path: '/faqs' },
      blogs: { title: 'Blog Posts', singular: 'blog post', path: '/blogs' },
      'admin-services': { title: 'Services', singular: 'service', path: '/admin-services' },
      services: { title: 'Services', singular: 'service', path: '/services' },
      departments: { title: 'Departments', singular: 'department', path: '/departments' },
      categories: { title: 'Categories', singular: 'category', path: '/categories' },
      statuses: { title: 'Statuses', singular: 'status', path: '/statuses' },
      priorities: { title: 'Priorities', singular: 'priority', path: '/priorities' },
      types: { title: 'Types', singular: 'type', path: '/types' },
      roles: { title: 'Roles', singular: 'role', path: '/roles' },
      ai: { title: 'AI Settings', singular: 'AI setting', path: '/ai' },
      reports: { title: 'Reports', singular: 'report', path: '/reports' },
      notifications: { title: 'Notifications', singular: 'notification', path: '/notifications' },
      settings: { title: 'Settings', singular: 'setting', path: '/settings' },
      'front-pages': { title: 'Front Pages', singular: 'front page', path: '/front-pages' },
    };

    if (segment === 'settings') {
      const settingsPages: Record<string, string> = {
        smtp: 'SMTP Settings',
        pusher: 'Pusher Settings',
        piping: 'Email Piping Settings',
        languages: 'Languages',
        menus: 'Navigation Menus',
        'email-templates': 'Email Templates',
        'ticket-fields': 'Custom Ticket Fields',
        license: 'License',
      };

      if (!parts[1]) {
        this.setPage('Global Settings', [{ label: 'Global Settings' }]);
        return;
      }

      if (parts[1] === 'email-templates' && parts[3] === 'edit') {
        this.setPage('Edit email template', [
          { label: 'Settings', path: '/settings' },
          { label: 'Email Templates', path: '/settings/email-templates' },
          { label: 'Edit email template' },
        ]);
        return;
      }

      const nestedTitle = settingsPages[parts[1]] || 'Settings';
      this.setPage(nestedTitle, [
        { label: 'Settings', path: '/settings' },
        { label: nestedTitle },
      ]);
      return;
    }

    if (segment === 'front-pages') {
      const frontPages: Record<string, string> = {
        home: 'Home',
        services: 'Services',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms of Services',
        footer: 'Footer',
      };
      const pageKey = parts[1] || 'home';
      const label = frontPages[pageKey] || 'Front Pages';
      this.setPage(label, [
        { label: 'Front Pages', path: '/front-pages/home' },
        { label },
      ]);
      return;
    }

    const mod = modules[segment];
    if (!mod) {
      this.setPage('Dashboard', [{ label: 'Dashboard' }]);
      return;
    }

    if (parts[1] === 'create') {
      const title = `Create a new ${mod.singular}`;
      this.setPage(title, [
        { label: mod.title, path: mod.path },
        { label: title },
      ]);
      return;
    }

    if (parts[2] === 'edit') {
      const title = `Edit ${mod.singular}`;
      this.setPage(title, [
        { label: mod.title, path: mod.path },
        { label: title },
      ]);
      return;
    }

    if (segment === 'tickets' && parts[1]) {
      this.setPage('Ticket details', [
        { label: 'Tickets', path: '/tickets' },
        { label: 'Ticket details' },
      ]);
      return;
    }

    this.setPage(mod.title, [{ label: mod.title }]);
  }

  switchMode(): void {
    const next = this.currentMode === 'light' ? 'dark' : 'light';
    this.setMode(next);
  }

  private setMode(mode: 'light' | 'dark'): void {
    this.currentMode = mode;
    localStorage.setItem('mode', mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-mode', 'dark');
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-mode');
    }
  }

  get unreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.read_at).length;
  }

  loadNotifications(): void {
    if (!this.auth.getToken()) return;
    this.notificationsLoading = true;
    this.notificationService.getAll({ limit: 8 }).subscribe({
      next: (data: any) => {
        const rows = Array.isArray(data) ? data : (data?.items || data?.list || data?.data || []);
        this.notifications = rows.slice(0, 8).map((row: any) => ({
          id: String(row.id || row._id),
          read_at: row.read_at || (row.is_read || row.read ? new Date().toISOString() : null),
          message: row?.data?.message || row.message || row.title || row.body || 'Notification',
          ticket_subject: row?.data?.ticket_subject || row.ticket_subject,
          time: this.relativeTime(row.created_at),
        }));
        this.notificationsLoading = false;
      },
      error: () => {
        this.notificationsLoading = false;
      },
    });
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notifications.forEach((n) => (n.read_at = n.read_at || now));
      },
    });
  }

  private relativeTime(value: any): string {
    if (!value) return '';
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  selectLanguage(lang: { code: string; name: string }): void {
    this.selectedLanguage = lang;
    this.langDropdownOpen = false;
  }

  langFlag(code: string): string {
    const flags: Record<string, string> = {
      en: '🇬🇧',
      es: '🇪🇸',
      fr: '🇫🇷',
      de: '🇩🇪',
      bd: '🇧🇩',
      cn: '🇨🇳',
      ar: '🇸🇦',
      pt: '🇵🇹',
      it: '🇮🇹',
      ja: '🇯🇵',
    };
    return flags[code] || '🌐';
  }

  displayName(user: UserModel | null): string {
    if (!user) return 'User';
    if (user.name) return user.name;
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : user.email || 'User';
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
