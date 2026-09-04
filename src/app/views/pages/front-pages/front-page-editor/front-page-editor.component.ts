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
  pageKey = 'home';
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
      page: ['home', Validators.required],
      title: [''],
      content: [''],
    });

    this.sub = this.route.paramMap.subscribe((params) => {
      const page = params.get('page') || 'home';
      this.pageKey = this.pages.includes(page) ? page : 'home';
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
      next: (raw) => {
        const item = raw?.data ?? raw?.item ?? raw ?? {};
        let content = item.content ?? item.body ?? item.html ?? '';
        if (content && typeof content === 'object') {
          content = JSON.stringify(content, null, 2);
        }
        this.form.patchValue({
          page: this.pageKey,
          title: item.title || item.name || this.pageTitle,
          content: content || '',
        });
        this.loading = false;
      },
      error: () => {
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
    const body = this.form.getRawValue();
    this.settingService.updateFrontPage(body).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Front page saved';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }
}
