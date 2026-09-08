import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LandingService } from '../../../../../core/landing/_services/landing.service';
import { SettingService } from '../../../../../core/setting/_services/setting.service';

interface FooterNavItem {
  label: string;
  route: string;
  target?: string;
  external?: boolean;
}

@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss'],
})
export class LandingFooterComponent implements OnInit, OnDestroy {
  email = '';
  isSubmitting = false;
  subscribeSuccess = false;
  subscribeError = '';
  subscribeMessage = '';
  logoFailed = false;
  currentYear = new Date().getFullYear();
  footerCms: { text?: string; copyright?: string } = {};
  supportNavItems: FooterNavItem[] = [];
  private settingsSub?: Subscription;
  private footerSub?: Subscription;
  private menusSub?: Subscription;

  constructor(
    private landingService: LandingService,
    public settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.settingService.loadBrandSettings();
    this.settingsSub = this.settingService.settings$.subscribe(() => {
      this.logoFailed = false;
    });
    this.footerSub = this.landingService.getFooterData().subscribe((data) => {
      this.footerCms = data || {};
    });
    this.loadSupportMenus();
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
    this.footerSub?.unsubscribe();
    this.menusSub?.unsubscribe();
  }

  private loadSupportMenus(): void {
    this.menusSub = this.settingService.getMenus({ is_active: 1 }).subscribe({
      next: (data) => {
        const rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        const active = rows.filter((row: any) => this.isActiveMenu(row));
        const footerItems = this.mapMenuRows(
          active.filter((row: any) => (row.location || '') === 'footer')
        );
        const headerItems = this.mapMenuRows(
          active.filter((row: any) => (row.location || 'header') === 'header')
        );
        this.supportNavItems = footerItems.length ? footerItems : headerItems;
      },
      error: () => {
        this.supportNavItems = [];
      },
    });
  }

  private mapMenuRows(rows: any[]): FooterNavItem[] {
    return [...rows]
      .sort(
        (a: any, b: any) =>
          Number(a.order ?? a.sort_order ?? 0) - Number(b.order ?? b.sort_order ?? 0)
      )
      .map((row: any) => this.toNavItem(row));
  }

  private isActiveMenu(row: any): boolean {
    const value = row?.is_active ?? row?.status ?? row?.active;
    return value !== false && value !== 0 && value !== '0' && value !== 'false';
  }

  private toNavItem(row: any): FooterNavItem {
    const raw = String(row.url || row.route_name || row.external_url || '').trim();
    const external = /^https?:\/\//i.test(raw);
    let route = raw || '/';
    if (!external && !route.startsWith('/')) {
      route = `/${route}`;
    }
    return {
      label: row.label || row.name || 'Link',
      route,
      target: row.target || (external ? '_blank' : '_self'),
      external,
    };
  }

  get footerText(): string {
    return (
      this.footerCms?.text ||
      this.settingService.footerText ||
      `Start working with ${this.settingService.appName} and streamline customer support operations from first response to final resolution.`
    );
  }

  get copyrightHtml(): string {
    return (
      this.footerCms?.copyright ||
      `© ${this.currentYear} ${this.settingService.appName}. All rights reserved.`
    );
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
    this.logoFailed = true;
  }

  onSubscribe(): void {
    if (this.isSubmitting || !this.email || !this.email.includes('@')) {
      return;
    }
    this.isSubmitting = true;
    this.subscribeSuccess = false;
    this.subscribeError = '';
    this.subscribeMessage = '';

    this.landingService.subscribeNewsletter(this.email).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.subscribeSuccess = true;
        this.subscribeMessage =
          res?.response?.message ||
          res?.message ||
          'Thank you for subscribing!';
        this.email = '';
        setTimeout(() => {
          this.subscribeSuccess = false;
          this.subscribeMessage = '';
        }, 5000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.subscribeError =
          err?.error?.response?.message ||
          err?.error?.message ||
          err?.message ||
          'Failed to subscribe. Please try again.';
      },
    });
  }
}
