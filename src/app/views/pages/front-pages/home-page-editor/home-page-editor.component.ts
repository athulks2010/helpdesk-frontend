import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { LandingService } from '../../../../core/landing/_services/landing.service';
import { FileUploadService } from '../../../../core/shared/file-upload.service';

@Component({
  selector: 'app-home-page-editor',
  templateUrl: './home-page-editor.component.html',
  styleUrls: ['./home-page-editor.component.scss'],
})
export class HomePageEditorComponent implements OnInit {
  loading = true;
  saving = false;
  uploading = false;
  error = '';
  success = '';

  pageId: string | number | null = null;
  title = 'Home';
  isActive = true;
  sections: any[] = [];
  activeTab = 0;

  readonly pages = ['home', 'services', 'contact', 'privacy', 'terms', 'footer'];
  readonly pageLabels: Record<string, string> = {
    home: 'Home',
    services: 'Services',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Services',
    footer: 'Footer',
  };

  readonly tabs = [
    { name: 'Settings', icon: 'settings' },
    { name: 'Hero Section', icon: 'home' },
    { name: 'Features', icon: 'star' },
    { name: 'Stats', icon: 'chart' },
    { name: 'Testimonials', icon: 'message' },
    { name: 'Trust Strip', icon: 'grid' },
    { name: 'Support Channels', icon: 'headphones' },
  ];

  readonly icons = [
    'apple', 'book', 'location', 'office', 'shopping-cart', 'store-front', 'trash',
    'service', 'category', 'status', 'ticket', 'contact', 'faq', 'chat', 'knowledge',
    'home', 'clock', 'settings', 'dashboard', 'edit', 'file', 'users', 'types', 'notes',
    'plus', 'check', 'post', 'gear', 'phone', 'email', 'user', 'security', 'airplay',
    'compass', 'aperture', 'camera', 'palette', 'login', 'page', 'send', 'image',
    'shield', 'zap', 'mail', 'help-circle', 'message-square', 'bar-chart', 'star',
    'headphones', 'globe', 'lock', 'smartphone', 'search', 'bell', 'calendar',
  ];

  readonly themes = ['primary', 'emerald', 'blue', 'purple'];
  readonly channelThemes = ['primary', 'blue', 'purple'];

  constructor(
    private settingService: SettingService,
    private landingService: LandingService,
    private fileUpload: FileUploadService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get heroImageUrl(): string {
    return this.fileUpload.resolveUrl(this.sections?.[0]?.image);
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.settingService.getFrontPage('home').subscribe({
      next: (item) => {
        if (item) {
          this.pageId = item.id ?? item._id ?? null;
          this.title = item.title || 'Home';
          this.isActive = item.is_active === 1 || item.is_active === true;
          const html = this.landingService.parseHomePageData(item);
          this.sections = this.clone(html.sections || []);
        } else {
          this.applyDefaults();
        }
        this.ensureSectionShape();
        this.loading = false;
      },
      error: () => {
        this.applyDefaults();
        this.ensureSectionShape();
        this.loading = false;
      },
    });
  }

  resetForm(): void {
    this.load();
  }

  previewPage(): void {
    window.open('/', '_blank');
  }

  setTab(index: number): void {
    this.activeTab = index;
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const body: any = {
      title: this.title || 'Home',
      slug: 'home',
      is_active: this.isActive ? 1 : 0,
      content: { sections: this.sections },
    };
    if (this.pageId != null) {
      body.id = this.pageId;
    }

    const save$ = this.pageId
      ? this.settingService.updateFrontPage(body)
      : this.settingService.createFrontPage(body);

    save$.subscribe({
      next: (res) => {
        const saved = res?.data ?? res?.item ?? res;
        if (saved?.id != null) {
          this.pageId = saved.id;
        }
        this.saving = false;
        this.success = 'Home page saved';
      },
      error: (err) => {
        this.saving = false;
        this.error =
          err?.error?.response?.message ||
          err?.error?.message ||
          err?.message ||
          'Save failed';
      },
    });
  }

  // ---- Ticket / Settings (section 2) ----
  addFormBadge(): void {
    if (!Array.isArray(this.sections[2].form_badges)) {
      this.sections[2].form_badges = [];
    }
    this.sections[2].form_badges.push('');
  }

  removeFormBadge(index: number): void {
    this.sections[2].form_badges.splice(index, 1);
  }

  // ---- Hero (section 0) ----
  addTrustIndicator(): void {
    if (!Array.isArray(this.sections[0].trust_indicators)) {
      this.sections[0].trust_indicators = [];
    }
    this.sections[0].trust_indicators.push('');
  }

  removeTrustIndicator(index: number): void {
    this.sections[0].trust_indicators.splice(index, 1);
  }

  addButton(): void {
    if (!Array.isArray(this.sections[0].buttons)) {
      this.sections[0].buttons = [];
    }
    this.sections[0].buttons.push({ text: '', link: '', new_tab: false });
  }

  removeButton(index: number): void {
    this.sections[0].buttons.splice(index, 1);
  }

  addHeroOverlay(): void {
    if (!Array.isArray(this.sections[0].hero_overlays)) {
      this.sections[0].hero_overlays = [];
    }
    this.sections[0].hero_overlays.push({
      enabled: true,
      label: '',
      title: '',
      status: '',
      show_check: false,
    });
  }

  removeHeroOverlay(index: number): void {
    this.sections[0].hero_overlays.splice(index, 1);
  }

  onHeroImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.error = '';
    this.fileUpload.upload(file, 'front-pages').subscribe({
      next: (path) => {
        this.uploading = false;
        if (path) {
          this.sections[0].image = path;
        }
        input.value = '';
      },
      error: () => {
        this.uploading = false;
        this.error = 'Failed to upload hero image';
        input.value = '';
      },
    });
  }

  removeHeroImage(): void {
    this.sections[0].image = '';
  }

  // ---- Features (section 1) ----
  addFeature(): void {
    if (!Array.isArray(this.sections[1].features)) {
      this.sections[1].features = [];
    }
    this.sections[1].features.push({ icon: '', title: '', details: '' });
  }

  removeFeature(index: number): void {
    this.sections[1].features.splice(index, 1);
  }

  // ---- Stats (section 3) ----
  addStat(): void {
    if (!Array.isArray(this.sections[3].stats)) {
      this.sections[3].stats = [];
    }
    this.sections[3].stats.push({ label: '', value: '', icon: '' });
  }

  removeStat(index: number): void {
    this.sections[3].stats.splice(index, 1);
  }

  // ---- Testimonials (section 4) ----
  addTestimonial(): void {
    if (!Array.isArray(this.sections[4].testimonials)) {
      this.sections[4].testimonials = [];
    }
    this.sections[4].testimonials.push({
      name: '',
      company: '',
      content: '',
      rating: 5,
    });
  }

  removeTestimonial(index: number): void {
    this.sections[4].testimonials.splice(index, 1);
  }

  // ---- Trust Strip (section 5) ----
  addTrustItem(): void {
    if (!Array.isArray(this.sections[5].items)) {
      this.sections[5].items = [];
    }
    this.sections[5].items.push({
      icon: '',
      label: '',
      value: '',
      theme: 'primary',
    });
  }

  removeTrustItem(index: number): void {
    this.sections[5].items.splice(index, 1);
  }

  // ---- Support Channels (section 6) ----
  addChannel(): void {
    if (!Array.isArray(this.sections[6].channels)) {
      this.sections[6].channels = [];
    }
    this.sections[6].channels.push({
      icon: '',
      theme: 'primary',
      title: '',
      link_text: '',
      route: '',
      link: '',
      description: '',
    });
  }

  removeChannel(index: number): void {
    this.sections[6].channels.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private applyDefaults(): void {
    const defaults = this.landingService.getDefaultHomePageData();
    this.pageId = null;
    this.title = defaults.title || 'Home';
    this.isActive = true;
    this.sections = this.clone(defaults.html.sections);
  }

  private ensureSectionShape(): void {
    const defaults = this.landingService.getDefaultHomePageData().html.sections;
    while (this.sections.length < 7) {
      this.sections.push(this.clone(defaults[this.sections.length]));
    }
    if (!this.sections[0].kb_button) {
      this.sections[0].kb_button = { enabled: true, text: '', link: '' };
    }
    if (this.sections[2].cta_submit_label == null) {
      this.sections[2].cta_submit_label = 'Send Ticket Request';
    }
    if (this.sections[2].enable_ticket_section == null) {
      this.sections[2].enable_ticket_section = !!this.sections[2].enabled;
    }
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
