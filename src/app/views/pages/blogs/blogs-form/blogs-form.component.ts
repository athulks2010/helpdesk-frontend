import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../../core/blog/_services/blog.service';
import { TypeService } from '../../../../core/type/_services/type.service';
import { FileUploadService } from '../../../../core/shared/file-upload.service';
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

@Component({
  selector: 'app-blogs-form',
  templateUrl: './blogs-form.component.html',
  styleUrls: ['./blogs-form.component.scss'],
})
export class BlogsFormComponent implements OnInit, AfterViewInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  types: any[] = [];
  editorInstance: any = null;
  deleting = false;
  imagePreviewUrl = '';
  private pendingDetails = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: BlogService,
    private typeService: TypeService,
    private fileUpload: FileUploadService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      title: ['', Validators.required],
      type_id: [null, Validators.required],
      status: [1],
      image: [''],
      details: ['', Validators.required],
    });

    this.loadExtras();

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          const image = item.image ?? item.feature_image ?? item.featured_image ?? '';
          const details = item.details ?? item.content ?? '';
          this.pendingDetails = details;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            title: item.title ?? '',
            type_id: item.type_id ?? item.type?.id ?? item.type?._id ?? null,
            status: this.toStatusValue(item.status ?? item.is_active),
            image,
            details,
          });
          this.imagePreviewUrl = this.fileUpload.resolveUrl(image);
          this.cdr.detectChanges();
          setTimeout(() => this.initEditor(), 0);
        },
        error: () => {
          this.error = 'Failed to load blog post';
          this.loadingData = false;
          this.cdr.detectChanges();
          setTimeout(() => this.initEditor(), 0);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isEditMode) {
      this.initEditor();
    }
  }

  get imageFileName(): string {
    return this.fileUpload.getFileName(this.form?.get('image')?.value);
  }

  initEditor(): void {
    const el = document.getElementById('blog-editor') as HTMLTextAreaElement | null;
    if (!el) {
      this.loadingData = false;
      return;
    }

    try {
      tinymce.remove('#blog-editor');
    } catch {}
    this.editorInstance = null;

    const initialContent = this.pendingDetails || this.form.get('details')?.value || '';
    if (initialContent) {
      el.value = initialContent;
    }

    tinymce
      .init({
        selector: '#blog-editor',
        base_url: 'https://cdn.jsdelivr.net/npm/tinymce@6.8.3',
        suffix: '.min',
        skin_url: 'https://cdn.jsdelivr.net/npm/tinymce@6.8.3/skins/ui/oxide',
        skin: 'oxide',
        content_css: 'https://cdn.jsdelivr.net/npm/tinymce@6.8.3/skins/content/default/content.min.css',
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
        height: 420,
        placeholder: this.isEditMode ? 'Blog details' : '',
        setup: (editor: any) => {
          this.editorInstance = editor;
          editor.on('init', () => {
            const content = this.pendingDetails || this.form.get('details')?.value || '';
            if (content) {
              editor.setContent(content);
            }
            this.finishLoading();
          });
          editor.on('input change undo redo keyup', () => {
            const val = editor.getContent();
            this.form.patchValue({ details: val }, { emitEvent: false });
            this.pendingDetails = val;
          });
        },
      })
      .then(() => this.finishLoading())
      .catch(() => this.finishLoading());
  }

  private finishLoading(): void {
    if (!this.loadingData) return;
    this.loadingData = false;
    this.cdr.detectChanges();
  }

  triggerMediaManager(): void {
    if (this.editorInstance) {
      this.editorInstance.execCommand('mceImage');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileUpload.upload(file, 'posts').subscribe({
      next: (path: string) => {
        if (path) {
          this.form.patchValue({ image: path });
          this.imagePreviewUrl = this.fileUpload.resolveUrl(path);
        }
      },
      error: () => {
        this.error = 'Failed to upload feature image';
      },
    });
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
    if (!raw.image) {
      delete raw.image;
    }

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Blog post updated successfully' : 'Blog post created successfully');
        this.toast.success(msg);
        this.router.navigate(['/blogs']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/blogs']);
  }

  remove(): void {
    if (!this.entityId) return;
    if (!confirm('Delete this blog post? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
    this.deleting = true;
    this.error = '';
    this.service.deleteById(this.entityId).subscribe({
      next: (res: any) => {
        this.deleting = false;
        const msg = res?.response?.message || res?.message || 'Blog post deleted successfully';
        this.toast.success(msg);
        this.router.navigate(['/blogs']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || err?.message || 'Failed to delete post';
      },
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  private toStatusValue(status: any): number {
    if (status === 0 || status === false || status === '0' || status === 'draft' || status === 'Draft') {
      return 0;
    }
    return 1;
  }

  ngOnDestroy(): void {
    try {
      tinymce.remove('#blog-editor');
    } catch {}
    this.editorInstance = null;
  }
}
