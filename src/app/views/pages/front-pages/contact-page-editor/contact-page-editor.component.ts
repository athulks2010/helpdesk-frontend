import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { LandingService } from '../../../../core/landing/_services/landing.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-contact-page-editor',
  templateUrl: './contact-page-editor.component.html',
  styleUrls: ['./contact-page-editor.component.scss'],
})
export class ContactPageEditorComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  success = '';
  activeTab = 0;

  pageId: string | number | null = null;
  title = 'Contact';
  isActive = true;
  html: any = {};

  readonly tabs = ['Content', 'Location', 'Phone', 'Email', 'Contact Form'];

  constructor(
    private settingService: SettingService,
    private landingService: LandingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setTab(index: number): void {
    this.activeTab = index;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.settingService.getFrontPage('contact').subscribe({
      next: (item) => {
        if (item) {
          this.pageId = item.id ?? item._id ?? null;
          this.title = item.title || 'Contact';
          this.isActive = item.is_active === 1 || item.is_active === true;
          this.html = this.landingService.parseContactPageHtml(item);
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
    window.open('/contact', '_blank');
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const body: any = {
      title: this.title || 'Contact',
      slug: 'contact',
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
        this.success = 'Contact page saved';
        this.toast.success(res?.response?.message || res?.message || 'Contact page saved successfully');
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
    this.title = 'Contact';
    this.isActive = true;
    this.html = this.landingService.getDefaultContactPageHtml();
  }
}
