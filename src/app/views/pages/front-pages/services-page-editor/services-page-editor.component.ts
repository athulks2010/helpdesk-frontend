import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-services-page-editor',
  templateUrl: './services-page-editor.component.html',
  styleUrls: ['./services-page-editor.component.scss'],
})
export class ServicesPageEditorComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  success = '';

  pageId: string | number | null = null;
  title = 'Services';
  isActive = true;
  html: any = this.emptyHtml();

  constructor(
    private settingService: SettingService,
    private landingService: LandingService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.settingService.getFrontPage('services').subscribe({
      next: (item) => {
        if (item) {
          this.pageId = item.id ?? item._id ?? null;
          this.title = item.title || 'Services';
          this.isActive = item.is_active === 1 || item.is_active === true;
          this.html = this.landingService.parseServicesPageHtml(item);
        } else {
          this.applyDefaults();
        }
        this.loading = false;
      },
      error: () => {
        this.applyDefaults();
        this.loading = false;
      },
    });
  }

  resetForm(): void {
    this.load();
  }

  previewPage(): void {
    window.open('/services', '_blank');
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const body: any = {
      title: this.title || 'Services',
      slug: 'services',
      is_active: this.isActive ? 1 : 0,
      content: this.html,
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
        this.success = 'Services page saved';
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

  private applyDefaults(): void {
    this.pageId = null;
    this.title = 'Services';
    this.isActive = true;
    this.html = this.landingService.getDefaultServicesPageHtml();
  }

  private emptyHtml(): any {
    return {
      hero: {},
      services_section: {},
      cta: {},
    };
  }
}
