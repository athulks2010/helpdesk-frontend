import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-global-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss'],
})
export class GlobalSettingsComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  success = '';
  activeTab = 'general';
  languages: any[] = [];

  readonly tabs = [
    { id: 'general', name: 'General' },
    { id: 'branding', name: 'Branding' },
    { id: 'features', name: 'Features' },
    { id: 'email_notification', name: 'Email Notifications' },
    { id: 'customization', name: 'Customization' },
    { id: 'ticket-fields', name: 'Ticket Fields' },
  ];

  readonly ticketFieldOptions = [
    'department',
    'category',
    'sub_category',
    'ticket_type',
    'assigned_to',
  ];

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

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
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
  }

  get enableOptions(): FormArray {
    return this.form.get('enable_options') as FormArray;
  }

  get emailNotifications(): FormArray {
    return this.form.get('email_notifications') as FormArray;
  }

  setTab(id: string): void {
    this.activeTab = id;
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
          default_recipient: this.settingValue(settings, 'default_recipient', '1'),
          default_language: this.settingValue(settings, 'default_language', 'en'),
          main_logo: this.settingValue(settings, 'main_logo', '/images/logo.png'),
          main_logo_white: this.settingValue(settings, 'main_logo_white', '/images/logo_white.png'),
          main_favicon: this.settingValue(settings, 'main_favicon', '/favicon.png'),
          footer_text: this.settingValue(settings, 'footer_text', ''),
          custom_css: this.settingValue(settings, 'custom_css', ''),
          hide_ticket_fields: this.asStringArray(this.settingValue(settings, 'hide_ticket_fields', [])),
          required_ticket_fields: this.asStringArray(this.settingValue(settings, 'required_ticket_fields', [])),
        });

        const enable = this.asToggleList(
          this.settingValue(settings, 'enable_options', null),
          this.defaultEnableOptions
        );
        const emails = this.asToggleList(
          this.settingValue(settings, 'email_notifications', null),
          this.defaultEmailNotifications
        );
        this.setToggleArray('enable_options', enable);
        this.setToggleArray('email_notifications', emails);
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

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const value = this.form.getRawValue();
    this.settingService.updateGlobal(value).subscribe({
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
    const list = this.asStringArray(this.form.get(controlName)?.value);
    return list.includes(field);
  }

  toggleField(controlName: 'hide_ticket_fields' | 'required_ticket_fields', field: string, checked: boolean): void {
    let list = this.asStringArray(this.form.get(controlName)?.value);
    if (checked && !list.includes(field)) {
      list = [...list, field];
    }
    if (!checked) {
      list = list.filter((f) => f !== field);
    }

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
