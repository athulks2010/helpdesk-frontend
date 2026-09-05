import { Component, OnInit } from '@angular/core';
import { LandingService, ServiceItem } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-services',
  templateUrl: './landing-services.component.html',
  styleUrls: ['./landing-services.component.scss'],
})
export class LandingServicesComponent implements OnInit {
  pageData: any = null;
  services: ServiceItem[] = [];

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getServicesPageData().subscribe((data: any) => {
      this.pageData = data?.html || data;
    });

    this.landingService.getServicesList().subscribe((list: any) => {
      this.services = Array.isArray(list) ? list : (list?.data || []);
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

  scrollToServices(): void {
    const link = this.hero?.primary_button_link || '#services';
    if (link.startsWith('#')) {
      const el = document.getElementById(link.slice(1) || 'services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    // Non-hash primary links are handled via navigation if needed later
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  isHashLink(link: string | null | undefined): boolean {
    return !!link && String(link).startsWith('#');
  }
}
