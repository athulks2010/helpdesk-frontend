import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-ticket-fields-builder',
  templateUrl: './ticket-fields-builder.component.html',
  styleUrls: ['./ticket-fields-builder.component.scss'],
})
export class TicketFieldsBuilderComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  loading = true;
  saving = false;
  error = '';
  success = '';
  form!: FormGroup;
  private nameTouched = false;
  private destroy$ = new Subject<void>();

  readonly fieldTypes = [
    { id: 'text', label: 'Text', icon: 'Aa' },
    { id: 'textarea', label: 'Textarea', icon: '¶' },
    { id: 'select', label: 'Select', icon: '▾' },
    { id: 'checkbox', label: 'Checkbox', icon: '☑' },
    { id: 'file', label: 'File', icon: '📎' },
    { id: 'email', label: 'Email', icon: '@' },
    { id: 'number', label: 'Number', icon: '#' },
  ];

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type: ['text', Validators.required],
      label: ['', Validators.required],
      name: ['', Validators.required],
      placeholder: [''],
      required: [false],
      options: [''],
    });

    this.form
      .get('label')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((label: string) => {
        if (this.nameTouched) return;
        this.form.patchValue({ name: this.toFieldName(label) }, { emitEvent: false });
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markNameTouched(): void {
    this.nameTouched = true;
  }

  private toFieldName(label: string): string {
    return String(label || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getTicketFields({}).subscribe({
      next: (data) => {
        this.rows = Array.isArray(data)
          ? data
          : data?.items || data?.list || data?.data || data?.fields || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load ticket fields';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    const raw = this.form.getRawValue();
    const options =
      typeof raw.options === 'string'
        ? raw.options
            .split(',')
            .map((o: string) => o.trim())
            .filter(Boolean)
        : raw.options;

    const body: any = {
      type: raw.type,
      label: raw.label,
      name: raw.name,
      placeholder: raw.placeholder || '',
      required: !!raw.required,
    };
    if (raw.type === 'select' || raw.type === 'checkbox') {
      body.options = options;
    }

    this.settingService.createTicketField(body).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Field added';
        this.nameTouched = false;
        this.form.reset({
          type: 'text',
          label: '',
          name: '',
          placeholder: '',
          required: false,
          options: '',
        });
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Create failed';
      },
    });
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id || !confirm('Delete this custom field?')) return;
    this.settingService.deleteTicketField(id).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete field'),
    });
  }

  asOptions(row: any): string[] {
    const opts = row?.options;
    if (Array.isArray(opts)) return opts.map(String);
    if (typeof opts === 'string') {
      return opts
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    }
    return [];
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
