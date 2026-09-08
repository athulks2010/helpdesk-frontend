import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-front-page-editor',
  templateUrl: './front-page-editor.component.html',
  styleUrls: ['./front-page-editor.component.scss'],
})
export class FrontPageEditorComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  success = '';
  pageKey = 'services';
  pageId: string | number | null = null;
  private sub?: Subscription;

  readonly pageLabels: Record<string, string> = {
    home: 'Home',
    services: 'Services',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Services',
    footer: 'Footer',
  };

  readonly pages = ['home', 'services', 'contact', 'privacy', 'terms', 'footer'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      page: ['services', Validators.required],
      title: [''],
      content: [''],
    });

    this.sub = this.route.paramMap.subscribe((params) => {
      const page = params.get('page') || 'services';
      this.pageKey = this.pages.includes(page) ? page : 'services';
      this.form.patchValue({ page: this.pageKey });
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get pageTitle(): string {
    return this.pageLabels[this.pageKey] || this.pageKey;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.settingService.getFrontPage(this.pageKey).subscribe({
      next: (item) => {
        const row = item || {};
        this.pageId = row.id ?? row._id ?? null;
        let content = row.content ?? row.body ?? row.html ?? '';
        if (content && typeof content === 'object') {
          content = JSON.stringify(content, null, 2);
        }
        this.form.patchValue({
          page: this.pageKey,
          title: row.title || row.name || this.pageTitle,
          content: content || '',
        });
        this.loading = false;
      },
      error: () => {
        this.pageId = null;
        this.form.patchValue({
          page: this.pageKey,
          title: this.pageTitle,
          content: '',
        });
        this.loading = false;
      },
    });
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const raw = this.form.getRawValue();
    let content: any = raw.content;
    if (typeof content === 'string') {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          content = JSON.parse(trimmed);
        } catch {
          // keep as string HTML
        }
      }
    }

    const body: any = {
      title: raw.title,
      slug: this.pageKey,
      content,
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
        this.success = 'Front page saved';
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
}
