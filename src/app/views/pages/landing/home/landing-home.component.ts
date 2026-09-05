import { Component, OnInit } from '@angular/core';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-home',
  templateUrl: './landing-home.component.html',
  styleUrls: ['./landing-home.component.scss'],
})
export class LandingHomeComponent implements OnInit {
  pageData: any = null;

  constructor(private landingService: LandingService) {
    this.pageData = this.landingService.getDefaultHomePageData();
  }

  ngOnInit(): void {
    this.landingService.getHomePageData().subscribe({
      next: (html) => {
        this.pageData = html;
      },
    });
  }

  get heroSection(): any {
    const s = this.pageData?.sections || this.pageData?.html?.sections;
    return s?.[0] ?? s?.['0'] ?? null;
  }

  get featuresSection(): any {
    const s = this.pageData?.sections || this.pageData?.html?.sections;
    return s?.[1] ?? s?.['1'] ?? null;
  }

  get statsSection(): any {
    const s = this.pageData?.sections || this.pageData?.html?.sections;
    return s?.[3] ?? s?.['3'] ?? null;
  }

  get testimonialsSection(): any {
    const s = this.pageData?.sections || this.pageData?.html?.sections;
    return s?.[4] ?? s?.['4'] ?? null;
  }

  get trustStrip(): any {
    const s = this.pageData?.sections || this.pageData?.html?.sections;
    return s?.[5] ?? s?.['5'] ?? null;
  }

  get supportChannels(): any {
    const s = this.pageData?.sections || this.pageData?.html?.sections;
    return s?.[6] ?? s?.['6'] ?? null;
  }

  toArray(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') return Object.values(val);
    return [val];
  }
}
