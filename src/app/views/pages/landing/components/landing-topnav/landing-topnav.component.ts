import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../../core/auth/_services/auth.service';
import { SettingService } from '../../../../../core/setting/_services/setting.service';

interface NavItem {
  label: string;
  route: string;
  exact?: boolean;
  target?: string;
  external?: boolean;
}

@Component({
  selector: 'app-landing-topnav',
  templateUrl: './landing-topnav.component.html',
  styleUrls: ['./landing-topnav.component.scss'],
})
export class LandingTopNavComponent implements OnInit {
  isScrolled = false;
  mobileMenuOpen = false;
  userDropdownOpen = false;
  langDropdownOpen = false;
  selectedLanguage = { code: 'en', name: 'English' };

  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  navItems: NavItem[] = [];

  currentUser$!: Observable<any>;
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private settingService: SettingService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    this.loadNavMenus();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileMenuOpen = false;
        this.userDropdownOpen = false;
        this.langDropdownOpen = false;
      });
  }

  private loadNavMenus(): void {
    this.settingService.getMenus({ location: 'header', is_active: 1 }).subscribe({
      next: (data) => {
        const rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        this.navItems = rows
          .filter((row: any) => (row.location || 'header') === 'header')
          .filter((row: any) => this.isActiveMenu(row))
          .sort((a: any, b: any) => (Number(a.order ?? a.sort_order ?? 0) - Number(b.order ?? b.sort_order ?? 0)))
          .map((row: any) => this.toNavItem(row));
      },
      error: () => {
        this.navItems = [];
      },
    });
  }

  private isActiveMenu(row: any): boolean {
    const value = row?.is_active ?? row?.status ?? row?.active;
    return value !== false && value !== 0 && value !== '0' && value !== 'false';
  }

  private toNavItem(row: any): NavItem {
    const route = String(row.url || row.route_name || '/').trim() || '/';
    const external = /^https?:\/\//i.test(route);
    return {
      label: row.label || row.name || 'Link',
      route,
      exact: route === '/' || row.active_key === 'home',
      target: row.target || '_self',
      external,
    };
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.userDropdownOpen = false;
    }
    if (!target.closest('.lang-dropdown-container')) {
      this.langDropdownOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
    this.langDropdownOpen = false;
  }

  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.langDropdownOpen = !this.langDropdownOpen;
    this.userDropdownOpen = false;
  }

  selectLanguage(lang: { code: string; name: string }): void {
    this.selectedLanguage = lang;
    this.langDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.userDropdownOpen = false;
      this.router.navigate(['/']);
    });
  }

  isRouteActive(route: string, exact: boolean = false): boolean {
    if (exact) {
      return this.router.url === route;
    }
    return this.router.url.startsWith(route);
  }
}

