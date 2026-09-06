import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../../../../core/faq/_services/faq.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-faqs-form',
  templateUrl: './faqs-form.component.html',
  styleUrls: ['./faqs-form.component.scss'],
})
export class FaqsFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  deleting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: FaqService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      name: ['', Validators.required],
      status: [1],
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
            name: item.name ?? null,
            status: this.toStatusValue(item.status),
            details: item.details ?? null,
          });

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load faq';
          this.loadingData = false;
        },
      });
    } else {

    }
  }

  loadExtras(): void {
    // no extras
  }

  submit(): void {
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
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'FAQ updated successfully' : 'FAQ created successfully');
        this.toast.success(msg);
        this.router.navigate(['/faqs']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/faqs']);
  }

  remove(): void {
    if (!this.entityId) return;
    if (!confirm('Delete this FAQ? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
    this.deleting = true;
    this.error = '';
    this.service.deleteById(this.entityId).subscribe({
      next: (res: any) => {
        this.deleting = false;
        const msg = res?.response?.message || res?.message || 'FAQ deleted successfully';
        this.toast.success(msg);
        this.router.navigate(['/faqs']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || err?.message || 'Failed to delete FAQ';
      },
    });
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  private toStatusValue(status: any): number {
    if (status === 0 || status === false || status === '0' || status === 'inactive' || status === 'Inactive' || status === 'draft' || status === 'Draft') {
      return 0;
    }
    return 1;
  }
}
