import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-menus-form',
  templateUrl: './menus-form.component.html',
  styleUrls: ['./menus-form.component.scss'],
})
export class MenusFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;

  readonly locations = [
    { value: 'header', label: 'Header (Top Nav)' },
    { value: 'footer', label: 'Footer' },
  ];

  routes = [
    { value: '', label: 'None (use external URL)' },
    { value: '/', label: 'Home (/)' },
    { value: '/services', label: 'Services' },
    { value: '/kb', label: 'Knowledge Base' },
    { value: '/faq', label: 'FAQs' },
    { value: '/blog', label: 'Blog' },
    { value: '/contact', label: 'Contact' },
    { value: '/ticket/open', label: 'Open Ticket' },
    { value: '/privacy', label: 'Privacy Policy' },
    { value: '/terms-of-services', label: 'Terms of Services' },
    { value: '/login', label: 'Login' },
    { value: '/register', label: 'Register' },
    { value: '/dashboard', label: 'Dashboard' },
  ];

  readonly features = [
    { value: '', label: 'Always show' },
    { value: 'chat', label: 'Chat' },
    { value: 'faq', label: 'FAQ' },
    { value: 'kb', label: 'Knowledge Base' },
    { value: 'blog', label: 'Blog' },
    { value: 'contact', label: 'Contacts' },
    { value: 'service', label: 'Service Page' },
    { value: 'contact_page', label: 'Contact Page' },
    { value: 'terms', label: 'Terms of Services' },
    { value: 'privacy', label: 'Privacy Policy' },
    { value: 'show_login', label: 'Show Login on front page' },
    { value: 'enable_registration', label: 'Enable Registration' },
  ];

  readonly targets = [
    { value: '_self', label: 'Same tab' },
    { value: '_blank', label: 'New tab' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingService: SettingService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
      label: ['', Validators.required],
      location: ['header', Validators.required],
      url: [''],
      route_name: [''],
      external_url: [''],
      icon: ['home'],
      active_key: ['home'],
      feature: [''],
      target: ['_self'],
      order: [0],
      sort_order: [0],
      is_active: [true],
    });

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.settingService.getMenus().subscribe({
        next: (data) => {
          const rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
          const item = rows.find((row: any) => String(row.id || row._id) === String(this.entityId));
          if (!item) {
            this.error = 'Menu item not found';
            this.loadingData = false;
            return;
          }
          const path = String(item.url || item.route_name || item.external_url || '').trim();
          const isExternal = /^https?:\/\//i.test(path);
          if (!isExternal && path && !this.routes.some((opt) => opt.value === path)) {
            this.routes = [...this.routes, { value: path, label: path }];
          }
          const order = item.order ?? item.sort_order ?? 0;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
            label: item.label || '',
            location: item.location || 'header',
            url: isExternal ? '' : path || '',
            route_name: isExternal ? '' : path || '',
            external_url: isExternal ? path : (item.external_url || ''),
            icon: item.icon || '',
            active_key: item.active_key || item.active_state_key || '',
            feature: item.feature || item.feature_slug || '',
            target: item.target || (isExternal ? '_blank' : '_self'),
            order,
            sort_order: order,
            is_active: item.is_active !== false && item.is_active !== 0,
          });
          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load menu item';
          this.loadingData = false;
        },
      });
    }
  }

  onRouteChange(): void {
    const path = this.form.get('url')?.value || '';
    this.form.patchValue({ route_name: path });
    if (path) {
      this.form.patchValue({ external_url: '' });
    }
  }

  onExternalChange(): void {
    const external = (this.form.get('external_url')?.value || '').trim();
    if (external) {
      this.form.patchValue({ url: '', route_name: '', target: '_blank' });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const external = (raw.external_url || '').trim();
    const internal = (raw.url || '').trim();
    const url = external || internal;
    if (!url) {
      this.error = 'Choose an internal route or enter an external URL';
      return;
    }
    this.loading = true;
    this.error = '';
    const body = {
      ...raw,
      url,
      route_name: internal || url,
      external_url: external,
      sort_order: Number(raw.order) || 0,
      order: Number(raw.order) || 0,
      is_active: raw.is_active ? 1 : 0,
    };
    const req$ = this.isEditMode
      ? this.settingService.updateMenu(body)
      : this.settingService.createMenu(body);

    req$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.response?.message || res?.message || (this.isEditMode ? 'Menu updated successfully' : 'Menu created successfully');
        this.toast.success(msg);
        this.router.navigate(['/settings/menus']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/settings/menus']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
