import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-terms-page-editor',
  templateUrl: './terms-page-editor.component.html',
  styleUrls: ['./terms-page-editor.component.scss'],
})
export class TermsPageEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = true;
  saving = false;
  error = '';
  success = '';
  editorInstance: any = null;
  pendingContent = '';

  pageId: string | number | null = null;
  pageTitle = 'Terms of Services';
  isActive = true;
  htmlTitle = 'Terms of Services';
  htmlContent = '';

  constructor(
    private settingService: SettingService,
    private landingService: LandingService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroyEditor();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.destroyEditor();
    this.settingService.getFrontPage('terms').subscribe({
      next: (item) => {
        if (item) {
          this.pageId = item.id ?? item._id ?? null;
          this.pageTitle = item.title || 'Terms of Services';
          this.isActive = item.is_active === 1 || item.is_active === true;
          const html = this.landingService.parseTermsPageHtml(item);
          this.htmlTitle = html.title || 'Terms of Services';
          this.htmlContent = html.content || '';
          this.pendingContent = this.htmlContent;
        } else {
          this.applyDefaults();
        }
        this.loading = false;
        setTimeout(() => this.initEditor(), 0);
      },
      error: () => {
        this.applyDefaults();
        this.loading = false;
        setTimeout(() => this.initEditor(), 0);
      },
    });
  }

  resetForm(): void {
    this.load();
  }

  previewPage(): void {
    window.open('/terms-of-services', '_blank');
  }

  triggerMediaManager(): void {
    if (this.editorInstance) {
      this.editorInstance.execCommand('mceImage');
    }
  }

  save(): void {
    if (this.editorInstance) {
      this.htmlContent = this.editorInstance.getContent();
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    const body: any = {
      title: this.htmlTitle || this.pageTitle || 'Terms of Services',
      slug: 'terms',
      is_active: this.isActive ? 1 : 0,
      content: {
        title: this.htmlTitle || 'Terms of Services',
        content: this.htmlContent || '',
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
        this.pageTitle = body.title;
        this.saving = false;
        this.success = 'Terms of Services page saved';
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
    const defaults = this.landingService.getDefaultTermsPageHtml();
    this.pageId = null;
    this.pageTitle = 'Terms of Services';
    this.isActive = true;
    this.htmlTitle = defaults.title;
    this.htmlContent = defaults.content;
    this.pendingContent = this.htmlContent;
  }

  private initEditor(): void {
    if (!document.getElementById('terms-page-editor')) {
      return;
    }
    this.loadTinyMce()
      .then((tinymce) => this.createEditor(tinymce))
      .catch(() => {
        this.error = this.error || 'Failed to load editor';
      });
  }

  private loadTinyMce(): Promise<any> {
    const existing = (window as any).tinymce;
    if (existing) {
      return Promise.resolve(existing);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/js/tinymce/tinymce.min.js';
      script.onload = () => resolve((window as any).tinymce);
      script.onerror = () => reject(new Error('TinyMCE failed to load'));
      document.body.appendChild(script);
    });
  }

  private createEditor(tinymce: any): void {
    if (!tinymce || !document.getElementById('terms-page-editor')) {
      return;
    }
    this.destroyEditor();

    tinymce.init({
      selector: '#terms-page-editor',
      base_url: '/js/tinymce',
      suffix: '.min',
      skin: 'oxide',
      content_css: '/js/tinymce/skins/content/default/content.min.css',
      content_style: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          margin: 16px;
        }
      `,
      license_key: 'gpl',
      promotion: false,
      branding: true,
      plugins:
        'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help quickbars emoticons',
      menubar: 'file edit view insert format tools table help',
      toolbar_mode: 'wrap',
      toolbar:
        'undo redo bold italic underline strikethrough fontfamily fontsize blocks alignleft aligncenter alignright alignjustify | outdent indent numlist bullist | forecolor backcolor removeformat pagebreak | charmap emoticons table fullscreen preview | anchor codesample ltr rtl | code | image media link',
      height: 480,
      setup: (editor: any) => {
        this.editorInstance = editor;
        editor.on('init', () => {
          if (this.pendingContent) {
            editor.setContent(this.pendingContent);
          }
        });
        editor.on('input change undo redo SetContent keyup', () => {
          this.htmlContent = editor.getContent();
        });
      },
    });
  }

  private destroyEditor(): void {
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch {}
      this.editorInstance = null;
    }
    const tinymce = (window as any).tinymce;
    if (tinymce) {
      try {
        tinymce.remove('#terms-page-editor');
      } catch {}
    }
  }
}
