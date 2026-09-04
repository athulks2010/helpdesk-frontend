import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../../core/auth/_services/auth.service';

interface NavItem {
  label: string;
  route: string;
  exact?: boolean;
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

  navItems: NavItem[] = [
    { label: 'Home', route: '/', exact: true },
    { label: 'Services', route: '/services' },
    { label: 'Knowledge Base', route: '/kb' },
    { label: 'FAQs', route: '/faq' },
    { label: 'Contact', route: '/contact' },
  ];

  currentUser$!: Observable<any>;
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileMenuOpen = false;
        this.userDropdownOpen = false;
        this.langDropdownOpen = false;
      });
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
