import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { LandingService } from '../../../../core/landing/_services/landing.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-footer-page-editor',
  templateUrl: './footer-page-editor.component.html',
  styleUrls: ['./footer-page-editor.component.scss'],
})
export class FooterPageEditorComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  success = '';

  pageId: string | number | null = null;
  title = 'Footer Area';
  isActive = true;
  html: any = {
    text: '',
    copyright: '',
  };

  constructor(
    private settingService: SettingService,
    private landingService: LandingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.settingService.getFrontPage('footer').subscribe({
      next: (item) => {
        if (item) {
          this.pageId = item.id ?? item._id ?? null;
          this.title = item.title || 'Footer Area';
          this.isActive = item.is_active === 1 || item.is_active === true;
          this.html = this.landingService.parseFooterPageHtml(item);
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
    window.open('/', '_blank');
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const body: any = {
      title: this.title || 'Footer Area',
      slug: 'footer',
      is_active: this.isActive ? 1 : 0,
      content: {
        text: this.html?.text || '',
        copyright: this.html?.copyright || '',
      },
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
        this.success = 'Footer page saved';
        this.toast.success(res?.response?.message || res?.message || 'Footer page saved successfully');
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
    this.title = 'Footer Area';
    this.isActive = true;
    this.html = this.landingService.getDefaultFooterPageHtml();
  }
}
