import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../../core/role/_services/role.service';

const ACCESS_MODULES = [
  'faq',
  'blog',
  'chat',
  'smtp',
  'type',
  'user',
  'global',
  'pusher',
  'status',
  'ticket',
  'contact',
  'category',
  'customer',
  'language',
  'priority',
  'department',
  'organization',
  'email_template',
  'knowledge_base',
  'front_page',
] as const;

type AccessModule = (typeof ACCESS_MODULES)[number];

@Component({
  selector: 'app-roles-form',
  templateUrl: './roles-form.component.html',
  styleUrls: ['./roles-form.component.scss'],
})
export class RolesFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  accessModules: AccessModule[] = [...ACCESS_MODULES];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: RoleService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      name: ['', Validators.required],
      slug: ['', Validators.required],
      access: this.buildAccessGroup(),
    });

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          const access = this.parseAccess(item?.access);
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            name: item.name ?? '',
            slug: item.slug ?? '',
            access,
          });
          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load role';
          this.loadingData = false;
        },
      });
    }
  }

  private buildAccessGroup(source?: Record<string, any>): FormGroup {
    const groups: Record<string, FormGroup> = {};
    for (const mod of ACCESS_MODULES) {
      const src = source?.[mod] || {};
      groups[mod] = this.fb.group({
        read: [!!src.read],
        create: [!!src.create],
        update: [!!src.update],
        delete: [!!src.delete],
      });
    }
    return this.fb.group(groups);
  }

  private parseAccess(raw: any): Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> {
    let parsed = raw;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }
    }
    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }

    const result: Record<string, any> = {};
    for (const mod of ACCESS_MODULES) {
      const src = parsed[mod] || {};
      result[mod] = {
        read: !!src.read,
        create: !!src.create,
        update: !!src.update,
        delete: !!src.delete,
      };
    }
    return result;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };
    // Send access as object (not JSON string)
    raw.access = { ...raw.access };

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  moduleLabel(mod: string): string {
    return mod.replace(/_/g, ' ');
  }
}
