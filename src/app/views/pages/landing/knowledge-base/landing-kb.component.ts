import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LandingService, KbArticle } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-kb',
  templateUrl: './landing-kb.component.html',
  styleUrls: ['./landing-kb.component.scss'],
})
export class LandingKbComponent implements OnInit {
  pageData: any = null;
  articles: KbArticle[] = [];
  filteredArticles: KbArticle[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchQuery = '';
  selectedArticle: KbArticle | null = null;
  loading = true;

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loading = true;

    forkJoin({
      page: this.landingService.getKbPageData(),
      list: this.landingService.getKnowledgeBaseList(),
    }).subscribe({
      next: ({ page, list }) => {
        this.pageData = page?.html || page;
        const articlesList = this.landingService.normalizeKbList(list);
        this.articles = articlesList;
        this.filteredArticles = articlesList;

        const cats = Array.from(
          new Set(articlesList.map((a: KbArticle) => a.category).filter(Boolean))
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
        badge: 'Help Center',
        title: 'Support Knowledge Base',
        subtitle:
          'Search practical guides, troubleshooting playbooks, and setup documentation to resolve issues faster.',
        search_placeholder: 'Search by issue, workflow, or keyword...',
        trust_one: 'Agent-tested guides',
        trust_two: 'Step-by-step fixes',
        trust_three: 'Instant answers',
      }
    );
  }

  filterArticles(): void {
    this.filteredArticles = this.articles.filter((art: KbArticle) => {
      const matchCat =
        this.selectedCategory === 'All' || art.category === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const detailsText = (art.excerpt || art.details || '').toLowerCase();
      const matchSearch =
        !q ||
        (art.title || '').toLowerCase().includes(q) ||
        detailsText.includes(q) ||
        (art.category || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  onSelectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.filterArticles();
  }

  onSearchChange(): void {
    this.filterArticles();
  }

  viewArticle(art: KbArticle): void {
    this.selectedArticle = art;
  }

  closeModal(): void {
    this.selectedArticle = null;
  }
}
