import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../../core/blog/_services/blog.service';
import { TypeService } from '../../../../core/type/_services/type.service';

@Component({
  selector: 'app-blogs-form',
  templateUrl: './blogs-form.component.html',
  styleUrls: ['./blogs-form.component.scss'],
})
export class BlogsFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  types: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: BlogService,
    private typeService: TypeService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      title: ['', Validators.required],
      type_id: [''],
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
          type_id: item.type_id ?? null,
          details: item.details ?? null,
          });

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load blog post';
          this.loadingData = false;
        },
      });
    } else {

    }
  }

  loadExtras(): void {
    this.typeService.getAll().subscribe({ next: (d) => { this.types = Array.isArray(d) ? d : (d?.items || d?.list || []); } });
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

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
