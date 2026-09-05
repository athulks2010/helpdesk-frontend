import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KnowledgeBaseService } from '../../../../core/knowledge-base/_services/knowledge-base.service';
import { TypeService } from '../../../../core/type/_services/type.service';

import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver/theme';
import 'tinymce/icons/default/icons';
import 'tinymce/models/dom/model';

import 'tinymce/plugins/preview';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/code';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
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
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/emoticons';

/** Keep CDN assets in sync with package.json tinymce version */
const TINYMCE_CDN = 'https://cdn.jsdelivr.net/npm/tinymce@8.9.0';

@Component({
  selector: 'app-knowledge-base-form',
  templateUrl: './knowledge-base-form.component.html',
  styleUrls: ['./knowledge-base-form.component.scss'],
})
export class KnowledgeBaseFormComponent implements OnInit, AfterViewInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  types: any[] = [];
  editorInstance: any = null;
  deleting = false;
  private pendingDetails = '';
  private editorId = 'knowledge-base-editor';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: KnowledgeBaseService,
    private typeService: TypeService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      title: ['', Validators.required],
      type_id: [null, Validators.required],
      details: ['', Validators.required],
    });

    this.loadExtras();

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          const details = item.details ?? item.content ?? '';
          this.pendingDetails = details;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            title: item.title ?? '',
            type_id: item.type_id ?? item.type?.id ?? item.type?._id ?? null,
            details,
          });
          this.cdr.detectChanges();
          setTimeout(() => this.initEditor(), 0);
        },
        error: () => {
          this.error = 'Failed to load article';
          this.loadingData = false;
          this.cdr.detectChanges();
          setTimeout(() => this.initEditor(), 0);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isEditMode) {
      setTimeout(() => this.initEditor(), 0);
    }
  }

  initEditor(): void {
    const el = document.getElementById(this.editorId) as HTMLTextAreaElement | null;
    if (!el) {
      this.loadingData = false;
      return;
    }

    this.destroyEditor();

    const initialContent = this.pendingDetails || this.form.get('details')?.value || '';
    if (initialContent) {
      el.value = initialContent;
    }

    const uiContainer = document.getElementById('knowledge-base-editor-ui') || undefined;

    // Init outside Angular zone so TinyMCE DOM listeners don't stall change detection / routing
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
          ui_mode: 'split',
          ui_container: uiContainer,
          // No autosave/save/fullscreen/help — those leave body overlays and navigation traps
          plugins:
            'preview importcss searchreplace autolink directionality code visualblocks visualchars image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount quickbars emoticons',
          menubar: 'edit view insert format tools table',
          toolbar_mode: 'wrap',
          toolbar:
            'undo redo bold italic underline strikethrough fontfamily fontsize blocks alignleft aligncenter alignright alignjustify | outdent indent numlist bullist | forecolor backcolor removeformat pagebreak | charmap emoticons table preview | anchor codesample ltr rtl | code | image media link',
          height: 420,
          setup: (editor: any) => {
            this.editorInstance = editor;
            editor.on('init', () => {
              const content = this.pendingDetails || this.form.get('details')?.value || '';
              if (content) {
                editor.setContent(content);
              }
              this.ngZone.run(() => this.finishLoading());
            });
            editor.on('input change undo redo keyup', () => {
              const val = editor.getContent();
              this.ngZone.run(() => {
                this.form.patchValue({ details: val }, { emitEvent: false });
                this.pendingDetails = val;
              });
            });
          },
        })
        .then(() => this.ngZone.run(() => this.finishLoading()))
        .catch(() => {
          this.ngZone.run(() => {
            this.error = this.error || 'Failed to load editor';
            this.finishLoading();
          });
        });
    });
  }

  private finishLoading(): void {
    if (!this.loadingData) return;
    this.loadingData = false;
    this.cdr.detectChanges();
  }

  private destroyEditor(): void {
    try {
      const existing = tinymce.get(this.editorId);
      if (existing) {
        existing.remove();
      }
    } catch {}
    try {
      tinymce.remove(`#${this.editorId}`);
    } catch {}
    try {
      tinymce.remove();
    } catch {}
    this.editorInstance = null;

    // Clear body-level TinyMCE UI that can trap pointer/focus over the sidebar
    document
      .querySelectorAll('.tox-tinymce-aux, .tox-dialog-wrap, .tox-silver-sink, .tox-fullscreen')
      .forEach((node) => {
        try {
          node.remove();
        } catch {}
      });

    // Drop any leftover beforeunload hooks from older autosave/script loads
    try {
      window.onbeforeunload = null;
    } catch {}
  }

  triggerMediaManager(): void {
    if (this.editorInstance) {
      this.editorInstance.execCommand('mceImage');
    }
  }

  loadExtras(): void {
    this.typeService.getAll().subscribe({
      next: (d) => {
        this.types = Array.isArray(d) ? d : d?.items || d?.list || [];
      },
    });
  }

  submit(): void {
    if (this.editorInstance) {
      this.form.patchValue({ details: this.editorInstance.getContent() });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };

    const req$ = this.isEditMode ? this.service.update(raw) : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.destroyEditor();
        this.router.navigate(['/knowledge-base']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.destroyEditor();
    this.router.navigate(['/knowledge-base']);
  }

  remove(): void {
    if (!this.entityId) return;
    if (!confirm('Delete this article? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
    this.deleting = true;
    this.error = '';
    this.service.deleteById(this.entityId).subscribe({
      next: () => {
        this.deleting = false;
        this.destroyEditor();
        this.router.navigate(['/knowledge-base']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || err?.message || 'Failed to delete article';
      },
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  ngOnDestroy(): void {
    this.destroyEditor();
  }
}
