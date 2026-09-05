import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LandingService } from '../../../../../core/landing/_services/landing.service';
import { SettingService } from '../../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss'],
})
export class LandingFooterComponent implements OnInit, OnDestroy {
  email = '';
  isSubmitting = false;
  subscribeSuccess = false;
  logoFailed = false;
  currentYear = new Date().getFullYear();
  footerCms: { text?: string; copyright?: string } = {};
  private settingsSub?: Subscription;
  private footerSub?: Subscription;

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
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
    this.footerSub?.unsubscribe();
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
    if (!this.email || !this.email.includes('@')) {
      return;
    }
    this.isSubmitting = true;
    this.landingService.subscribeNewsletter(this.email).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.subscribeSuccess = true;
        this.email = '';
        setTimeout(() => {
          this.subscribeSuccess = false;
        }, 5000);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }
}
