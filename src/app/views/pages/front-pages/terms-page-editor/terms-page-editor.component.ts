import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { LandingService } from '../../../../core/landing/_services/landing.service';
import { ToastService } from '../../../../core/toast/toast.service';

import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver/theme';
import 'tinymce/icons/default/icons';
import 'tinymce/models/dom/model';

import 'tinymce/plugins/preview';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/save';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/code';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/media';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/table';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/help';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/emoticons';

const TINYMCE_CDN = 'https://cdn.jsdelivr.net/npm/tinymce@6.8.3';

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

  private isDestroyed = false;

  constructor(
    private settingService: SettingService,
    private landingService: LandingService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    if (!this.loading) {
      this.initEditor();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroyEditor();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.destroyEditor();

    this.settingService.getFrontPage('terms').subscribe({
      next: (item) => {
        if (this.isDestroyed) return;
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
        this.cdr.detectChanges();
        setTimeout(() => this.initEditor(), 50);
      },
      error: () => {
        if (this.isDestroyed) return;
        this.applyDefaults();
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initEditor(), 50);
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
        this.toast.success(res?.response?.message || res?.message || 'Terms of Services page saved successfully');
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

  private initEditor(retryCount = 0): void {
    if (this.isDestroyed) return;

    const el = document.getElementById('terms-page-editor') as HTMLTextAreaElement | null;
    if (!el) {
      if (retryCount < 10) {
        setTimeout(() => this.initEditor(retryCount + 1), 100);
      }
      return;
    }

    this.destroyEditor();

    const initialContent = this.pendingContent || this.htmlContent || '';
    if (initialContent) {
      el.value = initialContent;
    }

    this.ngZone.runOutsideAngular(() => {
      tinymce
        .init({
          target: el,
          base_url: TINYMCE_CDN,
          suffix: '.min',
          skin_url: `${TINYMCE_CDN}/skins/ui/oxide`,
          skin: 'oxide',
          content_css: `${TINYMCE_CDN}/skins/content/default/content.min.css`,
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
          branding: false,
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
              if (initialContent) {
                editor.setContent(initialContent);
              }
            });
            editor.on('input change undo redo SetContent keyup', () => {
              this.ngZone.run(() => {
                this.htmlContent = editor.getContent();
                this.pendingContent = this.htmlContent;
              });
            });
          },
        })
        .catch(() => {});
    });
  }

  private destroyEditor(): void {
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch {}
      this.editorInstance = null;
    }
    try {
      tinymce.remove('#terms-page-editor');
    } catch {}
  }
}
