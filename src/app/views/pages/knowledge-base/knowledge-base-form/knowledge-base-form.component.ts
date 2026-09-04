import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KnowledgeBaseService } from '../../../../core/knowledge-base/_services/knowledge-base.service';
import { TypeService } from '../../../../core/type/_services/type.service';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: KnowledgeBaseService,
    private typeService: TypeService
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
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            title: item.title ?? '',
            type_id: item.type_id ?? item.type?.id ?? item.type?._id ?? null,
            details: item.details ?? '',
          });
          this.loadingData = false;
          setTimeout(() => this.initEditor(), 0);
        },
        error: () => {
          this.error = 'Failed to load article';
          this.loadingData = false;
          setTimeout(() => this.initEditor(), 0);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.loadingData) {
      this.initEditor();
    }
  }

  initEditor(): void {
    if (!document.getElementById('knowledge-base-editor')) {
      return;
    }
    this.loadTinyMce().then((tinymce) => this.createEditor(tinymce)).catch(() => {
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
    if (!tinymce || !document.getElementById('knowledge-base-editor')) {
      return;
    }
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch {}
      this.editorInstance = null;
    }

    tinymce.init({
      selector: '#knowledge-base-editor',
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
      plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help quickbars emoticons',
      menubar: 'file edit view insert format tools table help',
      toolbar_mode: 'wrap',
      toolbar: 'undo redo bold italic underline strikethrough fontfamily fontsize blocks alignleft aligncenter alignright alignjustify | outdent indent numlist bullist | forecolor backcolor removeformat pagebreak | charmap emoticons table fullscreen preview | anchor codesample ltr rtl | code | image media link',
      height: 420,
      setup: (editor: any) => {
        this.editorInstance = editor;
        editor.on('init', () => {
          if (this.form.get('details')?.value) {
            editor.setContent(this.form.get('details')?.value || '');
          }
        });
        editor.on('input change undo redo SetContent keyup', () => {
          const val = editor.getContent();
          this.form.patchValue({ details: val }, { emitEvent: false });
        });
      },
    });
  }

  triggerMediaManager(): void {
    if (this.editorInstance) {
      this.editorInstance.execCommand('mceImage');
    }
  }

  loadExtras(): void {
    this.typeService.getAll().subscribe({
      next: (d) => {
        this.types = Array.isArray(d) ? d : (d?.items || d?.list || []);
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

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/knowledge-base']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
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
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch {}
      this.editorInstance = null;
    }
  }
}
