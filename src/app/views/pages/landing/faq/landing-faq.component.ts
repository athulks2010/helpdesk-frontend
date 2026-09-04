import { Component, OnInit } from '@angular/core';
import { LandingService, FaqItem } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-faq',
  templateUrl: './landing-faq.component.html',
  styleUrls: ['./landing-faq.component.scss'],
})
export class LandingFaqComponent implements OnInit {
  faqs: FaqItem[] = [];
  filteredFaqs: FaqItem[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchQuery = '';

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getFaqs().subscribe((list: any) => {
      const faqsList: FaqItem[] = Array.isArray(list) ? list : (list?.data || []);
      this.faqs = faqsList.map((f: FaqItem, i: number) => ({ ...f, active: i === 0 }));
      this.filteredFaqs = [...this.faqs];

      const cats = Array.from(
        new Set(faqsList.map((f: FaqItem) => f.category).filter(Boolean) as string[])
      );
      this.categories = ['All', ...cats];
    });
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
      const matchSearch =
        !q ||
        faq.name.toLowerCase().includes(q) ||
        faq.details.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }
}
