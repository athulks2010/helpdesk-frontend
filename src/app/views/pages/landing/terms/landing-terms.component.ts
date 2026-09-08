import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-terms',
  templateUrl: './landing-terms.component.html',
  styleUrls: ['./landing-terms.component.scss'],
})
export class LandingTermsComponent implements OnInit {
  termsData: any = null;
  safeContent: SafeHtml = '';

  constructor(
    private landingService: LandingService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getTermsData().subscribe((data: any) => {
      this.termsData = data;
      const raw = data?.html?.content || '';
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(raw);
    });
  }
}

