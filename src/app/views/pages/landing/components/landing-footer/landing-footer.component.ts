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
  private settingsSub?: Subscription;

  constructor(
    private landingService: LandingService,
    public settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.settingService.loadBrandSettings();
    this.settingsSub = this.settingService.settings$.subscribe(() => {
      this.logoFailed = false;
    });
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
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
