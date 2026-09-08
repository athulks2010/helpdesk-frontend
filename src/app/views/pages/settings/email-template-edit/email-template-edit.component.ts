import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-email-template-edit',
  templateUrl: './email-template-edit.component.html',
  styleUrls: ['./email-template-edit.component.scss'],
})
export class EmailTemplateEditComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  templateId: string | null = null;
  templateName = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingService: SettingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      id: [this.templateId],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      html: [''],
    });

    if (!this.templateId) {
      this.error = 'Template id is required';
      this.loading = false;
      return;
    }

    this.settingService.getEmailTemplate(this.templateId).subscribe({
      next: (raw) => {
        const item = raw?.data ?? raw?.item ?? raw;
        this.templateName = item?.name || 'Email Template';
        this.form.patchValue({
          id: item?.id || item?._id || this.templateId,
          subject: item?.subject || item?.name || '',
          body: item?.body || item?.html || item?.details || '',
          html: item?.html || item?.body || '',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load email template';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const body = { ...this.form.getRawValue() };
    body.html = body.body;
    this.settingService.updateEmailTemplate(body).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.toast.success(res?.response?.message || res?.message || 'Email template updated successfully');
        this.router.navigate(['/settings/email-templates']);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/settings/email-templates']);
  }
}
