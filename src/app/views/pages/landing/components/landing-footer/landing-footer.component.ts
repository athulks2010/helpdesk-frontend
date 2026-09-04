import { Component } from '@angular/core';
import { LandingService } from '../../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss'],
})
export class LandingFooterComponent {
  email = '';
  isSubmitting = false;
  subscribeSuccess = false;

  constructor(private landingService: LandingService) {}

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
