import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsServiceService } from '../../../../core/service/_services/service.service';


@Component({
  selector: 'app-services-form',
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],
})
export class ServicesFormComponent implements OnInit {
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
    private service: CmsServiceService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      title: ['', Validators.required],
      icon: [''],
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
          title: item.title ?? null,
          icon: item.icon ?? null,
          details: item.details ?? null,
          });

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load service';
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

    if (!raw.password) {
      delete raw.password;
    }

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/services']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/services']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
