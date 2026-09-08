import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsServiceService } from '../../../../core/service/_services/service.service';
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
  selector: 'app-services-form',
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],
})
export class ServicesFormComponent implements OnInit, AfterViewInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  editorInstance: any = null;
  deleting = false;
  imagePreviewUrl = '';
  /** Preserved on edit so we don't overwrite a unique slug. */
  existingSlug = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: CmsServiceService,
    private fileUpload: FileUploadService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      title: ['', Validators.required],
      icon: [''],
      status: [1],
      image: [''],
      details: ['', Validators.required],
    });

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          const image = item.image ?? item.feature_image ?? item.featured_image ?? '';
          this.existingSlug = item.slug ?? '';
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            title: item.title ?? '',
            icon: item.icon ?? '',
            status: this.toStatusValue(item.status ?? item.is_active),
            image,
            details: item.details ?? item.content ?? '',
          });
          this.imagePreviewUrl = this.fileUpload.resolveUrl(image);
          this.loadingData = false;
          setTimeout(() => this.initEditor(), 0);
        },
        error: () => {
          this.error = 'Failed to load service';
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

  get imageFileName(): string {
    return this.fileUpload.getFileName(this.form?.get('image')?.value);
  }

  initEditor(): void {
    if (!document.getElementById('service-editor')) {
      return;
    }
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch { }
      this.editorInstance = null;
    }

    tinymce.init({
      selector: '#service-editor',
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileUpload.upload(file, 'services').subscribe({
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
    const payload = this.buildPayload();

    const req$ = this.isEditMode
      ? this.service.update(payload)
      : this.service.create(payload);

    req$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Service updated successfully' : 'Service created successfully');
        this.toast.success(msg);
        this.router.navigate(['/admin-services']);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.apiErrorMessage(err);
      },
    });
  }

  /** Aligns with backend Service model: title, slug, icon, is_active, image, details. */
  private buildPayload(): any {
    const raw = this.form.getRawValue();
    const title = String(raw.title || '').trim();
    const baseSlug = this.slugify(title);
    const payload: any = {
      title,
      slug:
        this.isEditMode && this.existingSlug
          ? this.existingSlug
          : `${baseSlug}-${Date.now().toString(36)}`,
      icon: raw.icon || null,
      is_active: this.toStatusValue(raw.status),
      details: raw.details || '',
    };

    if (raw.image) {
      payload.image = raw.image;
    }

    if (this.isEditMode && raw.id != null && raw.id !== '') {
      payload.id = raw.id;
    }

    return payload;
  }

  private slugify(text: string): string {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return base || 'service';
  }

  private apiErrorMessage(err: any): string {
    const body = err?.error;
    const fromResponse = body?.response?.message;
    const fromErrors = Array.isArray(body?.response?.errors)
      ? body.response.errors.map((d: any) => d?.message || d).filter(Boolean).join('; ')
      : '';
    const fromDetailed = Array.isArray(body?.detailedException)
      ? body.detailedException.map((d: any) => d?.message || d).filter(Boolean).join('; ')
      : '';
    return (
      fromErrors ||
      fromDetailed ||
      fromResponse ||
      body?.message ||
      err?.message ||
      'Save failed'
    );
  }

  cancel(): void {
    this.router.navigate(['/admin-services']);
  }

  remove(): void {
    if (!this.entityId) return;
    if (!confirm('Delete this service? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
    this.deleting = true;
    this.error = '';
    this.service.deleteById(this.entityId).subscribe({
      next: (res: any) => {
        this.deleting = false;
        const msg = res?.response?.message || res?.message || 'Service deleted successfully';
        this.toast.success(msg);
        this.router.navigate(['/admin-services']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = this.apiErrorMessage(err) || 'Failed to delete service';
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
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch { }
      this.editorInstance = null;
    }
  }
}
