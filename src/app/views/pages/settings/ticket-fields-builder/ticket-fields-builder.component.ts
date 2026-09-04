import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-ticket-fields-builder',
  templateUrl: './ticket-fields-builder.component.html',
  styleUrls: ['./ticket-fields-builder.component.scss'],
})
export class TicketFieldsBuilderComponent implements OnInit {
  rows: any[] = [];
  loading = true;
  saving = false;
  error = '';
  form!: FormGroup;

  readonly fieldTypes = ['text', 'textarea', 'select', 'checkbox', 'number', 'date'];

  constructor(private fb: FormBuilder, private settingService: SettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type: ['text', Validators.required],
      label: ['', Validators.required],
      name: ['', Validators.required],
      required: [false],
      options: [''],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getTicketFields({}).subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
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
    const raw = this.form.getRawValue();
    const options =
      typeof raw.options === 'string'
        ? raw.options
            .split(',')
            .map((o: string) => o.trim())
            .filter(Boolean)
        : raw.options;

    this.settingService
      .createTicketField({
        type: raw.type,
        label: raw.label,
        name: raw.name,
        required: !!raw.required,
        options,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.form.reset({ type: 'text', label: '', name: '', required: false, options: '' });
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

  optionsLabel(row: any): string {
    const opts = row.options;
    if (Array.isArray(opts)) return opts.join(', ');
    return opts || '—';
  }
}
