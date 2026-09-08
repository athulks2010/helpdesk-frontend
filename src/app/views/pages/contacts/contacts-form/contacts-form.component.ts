import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../../../core/contact/_services/contact.service';
import { DepartmentService } from '../../../../core/department/_services/department.service';
import { OrganizationService } from '../../../../core/organization/_services/organization.service';
import { CountryService, CountryItem } from '../../../../core/country/_services/country.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-contacts-form',
  templateUrl: './contacts-form.component.html',
  styleUrls: ['./contacts-form.component.scss'],
})
export class ContactsFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
  departments: any[] = [];
  organizations: any[] = [];
  countries: CountryItem[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: ContactService,
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private countryService: CountryService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      title: [''],
      organization_id: [''],
      department_id: [''],
      email: ['', Validators.required],
      phone: [''],
      address: [''],
      city: [''],
      country: [null],
      status: [1],
    });


    this.loadExtras();

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            first_name: item.first_name ?? null,
            last_name: item.last_name ?? null,
            title: item.title ?? null,
            organization_id: item.organization_id ?? null,
            department_id: item.department_id ?? null,
            email: item.email ?? null,
            phone: item.phone ?? null,
            address: item.address ?? null,
            city: item.city ?? null,
            country: item.country ? +item.country : (item.country_id ? +item.country_id : null),
            status: item.status ?? 1,
          });

          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load contact';
          this.loadingData = false;
        },
      });
    } else {

    }
  }

  loadExtras(): void {
    this.departmentService.getAll().subscribe({ next: (d) => { this.departments = Array.isArray(d) ? d : (d?.items || d?.list || []); } });
    this.organizationService.getAll().subscribe({ next: (d) => { this.organizations = Array.isArray(d) ? d : (d?.items || d?.list || []); } });
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
      ? this.service.updateContact(raw)
      : this.service.createContact(raw);

    req$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Contact updated successfully' : 'Contact created successfully');
        this.toast.success(msg);
        this.router.navigate(['/contacts']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/contacts']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
