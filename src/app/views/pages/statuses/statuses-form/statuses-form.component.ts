import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from '../../../../core/status/_services/status.service';

@Component({
  selector: 'app-statuses-form',
  templateUrl: './statuses-form.component.html',
  styleUrls: ['./statuses-form.component.scss'],
})
export class StatusesFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: StatusService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      name: ['', Validators.required],
      slug: [''],
    });

    if (!this.isEditMode) {
      this.form.get('name')?.valueChanges.subscribe((name: string) => {
        this.form.patchValue({ slug: this.toSlug(name) }, { emitEvent: false });
      });
    } else {
      this.form.get('slug')?.setValidators([Validators.required]);
      this.form.get('slug')?.updateValueAndValidity();
    }

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            name: item.name ?? null,
            slug: item.slug ?? this.toSlug(item.name ?? ''),
          });
          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load status';
          this.loadingData = false;
        },
      });
    }
  }

  private toSlug(value: string): string {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };
    if (!this.isEditMode) {
      raw.slug = this.toSlug(raw.name);
    }

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/statuses']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/statuses']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
