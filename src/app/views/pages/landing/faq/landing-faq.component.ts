import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LandingService, FaqItem } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-faq',
  templateUrl: './landing-faq.component.html',
  styleUrls: ['./landing-faq.component.scss'],
})
export class LandingFaqComponent implements OnInit {
  pageData: any = null;
  faqs: FaqItem[] = [];
  filteredFaqs: FaqItem[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchQuery = '';
  loading = true;

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loading = true;

    forkJoin({
      page: this.landingService.getFaqPageData(),
      list: this.landingService.getFaqs(),
    }).subscribe({
      next: ({ page, list }) => {
        this.pageData = page?.html || page;
        const faqsList = this.landingService.normalizeFaqList(list);
        this.faqs = faqsList.map((f: FaqItem, i: number) => ({ ...f, active: i === 0 }));
        this.filteredFaqs = [...this.faqs];

        const cats = Array.from(
          new Set(faqsList.map((f: FaqItem) => f.category).filter(Boolean) as string[])
        );
        this.categories = ['All', ...cats];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get hero(): any {
    return (
      this.pageData?.hero || {
        badge: 'Help Center FAQ',
        title: 'Frequently Asked Questions',
        subtitle:
          'Find clear answers to common support, billing, security, and workflow questions.',
        search_placeholder: 'Search by topic, issue, or keyword...',
        trust_one: 'Operations-focused answers',
        trust_two: 'Policy-aligned guidance',
        trust_three: 'Support-team reviewed',
      }
    );
  }

  get faqSection(): any {
    return (
      this.pageData?.faq_section || {
        badge: 'FAQ Section',
        title: 'Most Asked Questions',
        subtitle:
          'Review concise answers used by support teams to resolve recurring customer issues faster.',
      }
    );
  }

  get cta(): any {
    return (
      this.pageData?.cta || {
        title: 'Still have questions?',
        subtitle: "Can't find the answer you are looking for? Reach out directly.",
        primary_button_text: 'Contact Team',
        primary_button_link: '/contact',
        secondary_button_text: 'Submit Ticket',
        secondary_button_link: '/ticket/open',
      }
    );
  }

  toggleFaq(faq: FaqItem): void {
    faq.active = !faq.active;
  }

  onSelectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.filterFaqs();
  }

  onSearch(): void {
    this.filterFaqs();
  }

  private filterFaqs(): void {
    this.filteredFaqs = this.faqs.filter((faq: FaqItem) => {
      const matchCat =
        this.selectedCategory === 'All' || faq.category === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const detailsText = (faq.details || '').replace(/<[^>]*>/g, '').toLowerCase();
      const matchSearch =
        !q ||
        (faq.name || '').toLowerCase().includes(q) ||
        detailsText.includes(q);
      return matchCat && matchSearch;
    });
  }
}
