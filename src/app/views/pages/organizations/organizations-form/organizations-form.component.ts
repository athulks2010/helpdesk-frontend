import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '../../../../core/organization/_services/organization.service';
import { CountryService, CountryItem } from '../../../../core/country/_services/country.service';

@Component({
  selector: 'app-organizations-form',
  templateUrl: './organizations-form.component.html',
  styleUrls: ['./organizations-form.component.scss'],
})
export class OrganizationsFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  countries: CountryItem[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: OrganizationService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      address: [''],
      city: [''],
      region: [''],
      country: [null],
      postal_code: [''],
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
            email: item.email ?? null,
            phone: item.phone ?? null,
            address: item.address ?? null,
            city: item.city ?? null,
            region: item.region ?? null,
            country: item.country ? +item.country : (item.country_id ? +item.country_id : null),
            postal_code: item.postal_code ?? null,
          });

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load organization';
          this.loadingData = false;
        },
      });
    } else {

    }
  }

  loadExtras(): void {
    this.countryService.getAll().subscribe({
      next: (items) => {
        this.countries = items;
      },
      error: (err) => {
        console.error('Failed to load countries', err);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };

    if (raw.country) {
      raw.country = +raw.country;
    }

    if (!raw.password) {
      delete raw.password;
    }

    const req$ = this.isEditMode
      ? this.service.update(raw)
      : this.service.create(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/organizations']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizations']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
