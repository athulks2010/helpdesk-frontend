import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LandingService, ServiceItem } from '../../../../core/landing/_services/landing.service';
import { FileUploadService } from '../../../../core/shared/file-upload.service';

@Component({
  selector: 'app-landing-services',
  templateUrl: './landing-services.component.html',
  styleUrls: ['./landing-services.component.scss'],
})
export class LandingServicesComponent implements OnInit {
  pageData: any = null;
  services: ServiceItem[] = [];
  loading = true;

  constructor(
    private landingService: LandingService,
    private fileUpload: FileUploadService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loading = true;

    forkJoin({
      page: this.landingService.getServicesPageData(),
      list: this.landingService.getServicesList(),
    }).subscribe({
      next: ({ page, list }) => {
        this.pageData = page?.html || page;
        const fromApi = this.landingService.normalizeServicesList(list);
        const fromCms = this.landingService.normalizeServicesList(this.pageData?.services);
        this.services = fromApi.length ? fromApi : fromCms;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get hero(): any {
    return this.pageData?.hero || {
      badge: 'HelpDesk Professional Services',
      title: 'Services Built For High-Performing Support Teams',
      subtitle:
        'From implementation to optimization, we help you launch, scale, and continuously improve your support operations with measurable outcomes.',
      primary_button_text: 'Explore Service Plans',
      secondary_button_text: 'Book Consultation',
      trust_one: 'Certified specialists',
      trust_two: 'SLA-first delivery',
      trust_three: 'Outcome-driven execution',
    };
  }

  get servicesSection(): any {
    return this.pageData?.services_section || {
      badge: 'Service Portfolio',
      title: 'What We Deliver',
      subtitle:
        'Practical services designed to reduce response time, improve customer satisfaction, and increase team productivity.',
      learn_more_text: 'View Service Scope',
    };
  }

  get cta(): any {
    return this.pageData?.cta || {
      title: 'Ready To Improve Support Quality And Speed?',
      subtitle:
        'Let us assess your current workflow and propose a service plan tailored to your support goals.',
      primary_button_text: 'Talk To A Specialist',
      secondary_button_text: 'Open A Ticket',
    };
  }

  imageUrl(path: string | null | undefined): string {
    return this.fileUpload.resolveUrl(path);
  }

  scrollToServices(): void {
    const link = this.hero?.primary_button_link || '#services';
    if (link.startsWith('#')) {
      const el = document.getElementById(link.slice(1) || 'services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  isHashLink(link: string | null | undefined): boolean {
    return !!link && String(link).startsWith('#');
  }
}
