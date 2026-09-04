import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { FileUploadService } from '../../../../core/shared/file-upload.service';
import { SettingService } from '../../../../core/setting/_services/setting.service';
import { UserService } from '../../../../core/user/_services/user.service';

type SettingsTab =
  | 'general'
  | 'branding'
  | 'features'
  | 'email_notification'
  | 'customization'
  | 'ticket-fields';

@Component({
  selector: 'app-global-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss'],
})
export class GlobalSettingsComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  uploading: Record<string, boolean> = {};
  error = '';
  success = '';
  activeTab: SettingsTab = 'general';
  languages: any[] = [];
  recipients: any[] = [];
  queueCron = '';
  sharedCron = '';

  readonly tabs: Array<{ id: SettingsTab; name: string; icon: string }> = [
    { id: 'general', name: 'General', icon: 'globe' },
    { id: 'branding', name: 'Branding', icon: 'palette' },
    { id: 'features', name: 'Features', icon: 'eye' },
    { id: 'email_notification', name: 'Email Notifications', icon: 'bell' },
    { id: 'customization', name: 'Customization', icon: 'monitor' },
    { id: 'ticket-fields', name: 'Ticket Fields', icon: 'doc' },
  ];

  readonly sectionSlugs: Record<SettingsTab, string[]> = {
    general: ['app_name', 'site_key', 'default_language'],
    branding: ['main_logo', 'main_logo_white', 'main_favicon', 'footer_text'],
    features: ['enable_options'],
    email_notification: ['email_notifications', 'default_recipient'],
    customization: ['custom_css'],
    'ticket-fields': ['hide_ticket_fields', 'required_ticket_fields'],
  };

  readonly ticketFieldOptions = [
    'department',
    'category',
    'sub_category',
    'ticket_type',
    'assigned_to',
  ];

  readonly brandingAssets: Array<{
    key: 'main_logo' | 'main_logo_white' | 'main_favicon';
    label: string;
    tip: string;
    dark: boolean;
  }> = [
    {
      key: 'main_logo',
      label: 'Main Logo',
      tip: 'Recommended: 200-300px width, 60-100px height (2:1 to 3:1 ratio)',
      dark: false,
    },
    {
      key: 'main_logo_white',
      label: 'White Logo',
      tip: 'Recommended: 200-300px width, 60-100px height (2:1 to 3:1 ratio)',
      dark: true,
    },
    {
      key: 'main_favicon',
      label: 'Favicon',
      tip: 'Recommended: 32x32px or 16x16px (square format)',
      dark: false,
    },
  ];

  readonly featureDescriptions: Record<string, string> = {
    chat: 'Enable real-time chat functionality for customer support.',
    faq: 'Show FAQ section on the public site.',
    kb: 'Enable knowledge base articles for self-service.',
    blog: 'Publish blog posts on the front page.',
    contact: 'Enable contacts module in admin.',
    organization: 'Enable organizations module in admin.',
    note: 'Enable notes module in admin.',
    show_login: 'Show login link on the front page.',
    enable_piping: 'Create tickets automatically from incoming email.',
    service: 'Show services page on the front site.',
    color_picker: 'Allow color picker in ticket/forms UI.',
    require_login_submit_ticket: 'Require login before submitting a ticket.',
    contact_page: 'Show contact page on the front site.',
    terms_of_services: 'Show Terms of Services page.',
    privacy_policy: 'Show Privacy Policy page.',
    newsletter: 'Enable newsletter signup.',
    enable_registration: 'Allow new users to register.',
  };

  readonly defaultEnableOptions = [
    { name: 'Chat', slug: 'chat', value: false },
    { name: 'FAQ', slug: 'faq', value: true },
    { name: 'Knowledge Base', slug: 'kb', value: true },
    { name: 'Blog', slug: 'blog', value: true },
    { name: 'Contacts', slug: 'contact', value: true },
    { name: 'Organizations', slug: 'organization', value: true },
    { name: 'Notes', slug: 'note', value: true },
    { name: 'Show Login on front page', slug: 'show_login', value: true },
    { name: 'Email to tickets (piping)', slug: 'enable_piping', value: true },
    { name: 'Service Page', slug: 'service', value: true },
    { name: 'Show Color Picker', slug: 'color_picker', value: true },
    { name: 'Require Login to Submit Ticket', slug: 'require_login_submit_ticket', value: false },
    { name: 'Contact Page', slug: 'contact_page', value: true },
    { name: 'Terms of Services', slug: 'terms_of_services', value: true },
    { name: 'Privacy Policy', slug: 'privacy_policy', value: true },
    { name: 'Newsletter', slug: 'newsletter', value: true },
    { name: 'Enable Registration', slug: 'enable_registration', value: true },
  ];

  readonly defaultEmailNotifications = [
    { name: 'Create ticket by new customer', slug: 'create_ticket_new_customer', value: false },
    { name: 'Create ticket from dashboard', slug: 'create_ticket_dashboard', value: false },
    { name: 'Notification for the first comment', slug: 'first_comment', value: false },
    { name: 'User got assigned for a task', slug: 'assigned_ticket', value: false },
    { name: 'Status or priority changes', slug: 'status_priority', value: false },
    { name: 'Create a new user', slug: 'user_created', value: false },
  ];

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private fileUpload: FileUploadService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const base = (environment.apiUrl || '').replace(/\/$/, '') || 'https://yourdomain.com';
    this.queueCron = `*/2 * * * * /usr/bin/php artisan queue:work --queue=high,default --stop-when-empty`;
    this.sharedCron = `*/2 * * * * wget -q -O - ${base}/cron/queue_work >/dev/null 2>&1`;

    this.form = this.fb.group({
      app_name: [''],
      site_key: [''],
      default_recipient: ['1'],
      default_language: ['en'],
      main_logo: [''],
      main_logo_white: [''],
      main_favicon: [''],
      footer_text: [''],
      custom_css: [''],
      enable_options: this.fb.array([]),
      email_notifications: this.fb.array([]),
      hide_ticket_fields: [[] as string[]],
      required_ticket_fields: [[] as string[]],
    });

    this.setToggleArray('enable_options', this.defaultEnableOptions);
    this.setToggleArray('email_notifications', this.defaultEmailNotifications);
    this.load();
    this.loadRecipients();
  }

  get enableOptions(): FormArray {
    return this.form.get('enable_options') as FormArray;
  }

  get emailNotifications(): FormArray {
    return this.form.get('email_notifications') as FormArray;
  }

  get cssPreviewStyle(): SafeHtml {
    const css = this.form?.get('custom_css')?.value || '';
    return this.sanitizer.bypassSecurityTrustHtml(`<style>.css-preview-box{${css}}</style>`);
  }

  setTab(id: SettingsTab): void {
    this.activeTab = id;
    this.error = '';
    this.success = '';
  }

  featureDescription(slug: string): string {
    return this.featureDescriptions[slug] || 'Configure this system feature.';
  }

  assetUrl(control: string): string {
    return this.fileUpload.resolveUrl(this.form.get(control)?.value);
  }

  onFileSelected(control: 'main_logo' | 'main_logo_white' | 'main_favicon', event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading[control] = true;
    this.fileUpload.upload(file, 'branding').subscribe({
      next: (path) => {
        if (path) this.form.patchValue({ [control]: path });
        this.uploading[control] = false;
        input.value = '';
      },
      error: () => {
        this.uploading[control] = false;
        this.error = 'Failed to upload file';
        input.value = '';
      },
    });
  }

  loadRecipients(): void {
    this.userService.getAll({}).subscribe({
      next: (data) => {
        this.recipients = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
      },
      error: () => {
        this.recipients = [];
      },
    });
  }

  recipientLabel(user: any): string {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return name || user.name || user.email || String(user.id || user._id);
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getAll({}).subscribe({
      next: (raw) => {
        const settings = this.normalizeSettings(raw);
        this.form.patchValue({
          app_name: this.settingValue(settings, 'app_name', 'Help Desk'),
          site_key: this.settingValue(settings, 'site_key', ''),
          default_recipient: String(this.settingValue(settings, 'default_recipient', '1')),
          default_language: this.settingValue(settings, 'default_language', 'en'),
          main_logo: this.settingValue(settings, 'main_logo', '/images/logo.png'),
          main_logo_white: this.settingValue(settings, 'main_logo_white', '/images/logo_white.png'),
          main_favicon: this.settingValue(settings, 'main_favicon', '/favicon.png'),
          footer_text: this.settingValue(settings, 'footer_text', ''),
          custom_css: this.settingValue(settings, 'custom_css', ''),
          hide_ticket_fields: this.asStringArray(this.settingValue(settings, 'hide_ticket_fields', [])),
          required_ticket_fields: this.asStringArray(this.settingValue(settings, 'required_ticket_fields', [])),
        });

        this.setToggleArray(
          'enable_options',
          this.asToggleList(this.settingValue(settings, 'enable_options', null), this.defaultEnableOptions)
        );
        this.setToggleArray(
          'email_notifications',
          this.asToggleList(this.settingValue(settings, 'email_notifications', null), this.defaultEmailNotifications)
        );
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load settings';
        this.loading = false;
      },
    });

    this.settingService.getLanguages({}).subscribe({
      next: (data) => {
        this.languages = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
      },
      error: () => {
        this.languages = [];
      },
    });
  }

  private sectionUpdates(tab: SettingsTab): Array<{ slug: string; value: any }> {
    const raw = this.form.getRawValue();
    return (this.sectionSlugs[tab] || []).map((slug) => ({
      slug,
      value: raw[slug],
    }));
  }

  /** Bulk body as key-value object, e.g. { app_name: "Help Desk", default_language: "en" } */
  private sectionKeyValueBody(tab: SettingsTab): Record<string, any> {
    const body: Record<string, any> = {};
    this.sectionUpdates(tab).forEach((row) => {
      body[row.slug] = row.value;
    });
    return body;
  }

  save(): void {
    const body = this.sectionKeyValueBody(this.activeTab);
    if (!Object.keys(body).length) return;

    this.saving = true;
    this.error = '';
    this.success = '';

    // POST /setting/update — one bulk call for the active section only
    this.settingService.updateSetting(body).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Settings saved successfully';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Failed to save settings';
      },
    });
  }

  isChecked(controlName: 'hide_ticket_fields' | 'required_ticket_fields', field: string): boolean {
    return this.asStringArray(this.form.get(controlName)?.value).includes(field);
  }

  toggleField(controlName: 'hide_ticket_fields' | 'required_ticket_fields', field: string, checked: boolean): void {
    let list = this.asStringArray(this.form.get(controlName)?.value);
    if (checked && !list.includes(field)) list = [...list, field];
    if (!checked) list = list.filter((f) => f !== field);

    if (controlName === 'required_ticket_fields') {
      if (checked && (field === 'category' || field === 'sub_category')) {
        if (!list.includes('department')) list = [...list, 'department'];
        if (!list.includes('category')) list = [...list, 'category'];
      }
      if (!checked && field === 'department') {
        list = list.filter((f) => f !== 'category' && f !== 'sub_category');
      }
      if (!checked && field === 'category') {
        list = list.filter((f) => f !== 'sub_category');
      }
    }

    this.form.get(controlName)?.setValue(list);
  }

  labelize(field: string): string {
    return field.replace(/_/g, ' ');
  }

  private setToggleArray(
    controlName: 'enable_options' | 'email_notifications',
    items: Array<{ name: string; slug: string; value: boolean }>
  ): void {
    const arr = this.form.get(controlName) as FormArray;
    arr.clear();
    items.forEach((item) => {
      arr.push(
        this.fb.group({
          name: [item.name],
          slug: [item.slug],
          value: [!!item.value],
        })
      );
    });
  }

  private normalizeSettings(raw: any): Record<string, any> {
    return this.settingService.getSettingsMap(raw);
  }

  private settingValue(settings: Record<string, any>, key: string, fallback: any): any {
    const entry = settings[key];
    if (entry == null) return fallback;
    if (typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, 'value')) {
      return entry.value ?? fallback;
    }
    return entry;
  }

  private asStringArray(value: any): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return value ? [value] : [];
      }
    }
    return [];
  }

  private asToggleList(
    value: any,
    defaults: Array<{ name: string; slug: string; value: boolean }>
  ): Array<{ name: string; slug: string; value: boolean }> {
    let list = value;
    if (typeof list === 'string') {
      try {
        list = JSON.parse(list);
      } catch {
        list = null;
      }
    }
    if (!Array.isArray(list) || !list.length) {
      return defaults.map((d) => ({ ...d }));
    }

    const bySlug = new Map(list.map((item: any) => [item.slug, item]));
    const result: Array<{ name: string; slug: string; value: boolean }> = [];
    const processed = new Set<string>();

    defaults.forEach((d) => {
      const found = bySlug.get(d.slug);
      processed.add(d.slug);
      result.push({
        name: found?.name || d.name,
        slug: d.slug,
        value: found ? !!found.value : d.value,
      });
    });

    list.forEach((item: any) => {
      if (item?.slug && !processed.has(item.slug)) {
        processed.add(item.slug);
        result.push({
          name: item.name || item.slug,
          slug: item.slug,
          value: !!item.value,
        });
      }
    });

    return result;
  }
}
