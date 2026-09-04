import { Component, OnInit } from '@angular/core';
import { LandingService, KbArticle } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-kb',
  templateUrl: './landing-kb.component.html',
  styleUrls: ['./landing-kb.component.scss'],
})
export class LandingKbComponent implements OnInit {
  articles: KbArticle[] = [];
  filteredArticles: KbArticle[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchQuery = '';
  selectedArticle: KbArticle | null = null;

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getKnowledgeBaseList().subscribe((list: any) => {
      const articlesList: KbArticle[] = Array.isArray(list) ? list : (list?.data || []);
      this.articles = articlesList;
      this.filteredArticles = articlesList;

      const cats = Array.from(new Set(articlesList.map((a: KbArticle) => a.category)));
      this.categories = ['All', ...cats];
    });
  }

  filterArticles(): void {
    this.filteredArticles = this.articles.filter((art: KbArticle) => {
      const matchCat =
        this.selectedCategory === 'All' || art.category === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.details.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q);
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
