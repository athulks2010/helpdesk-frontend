import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { apiUrl } from '../../../../core/_config/api.config';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
})
export class ReportsListComponent implements OnInit {
  form!: FormGroup;
  rows: any[] = [];
  columns: string[] = [];
  loading = false;
  generating = false;
  error = '';
  success = '';
  lastReportId: string | null = null;

  readonly reportTypes = [
    { value: 'tickets', label: 'Ticket Summary' },
    { value: 'users', label: 'User Activity' },
    { value: 'performance', label: 'Performance Metrics' },
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 30);
    this.form = this.fb.group({
      report_type: ['tickets'],
      date_from: [this.toDateInput(from)],
      date_to: [this.toDateInput(today)],
    });
    this.loadResults();
  }

  generate(): void {
    this.generating = true;
    this.error = '';
    this.success = '';
    const body = this.form.getRawValue();
    this.http.post(`${environment.apiUrl}${apiUrl.reportGenerate}`, body).subscribe({
      next: (res: any) => {
        this.generating = false;
        const data = res?.data ?? res;
        this.lastReportId = data?.report_id || data?.id || null;
        this.success = data?.message || 'Report generation started';
        this.loadResults(this.lastReportId || undefined);
      },
      error: (err) => {
        this.generating = false;
        this.error = err?.error?.message || err?.message || 'Failed to generate report';
      },
    });
  }

  loadResults(reportId?: string): void {
    this.loading = true;
    this.error = '';
    const url = reportId
      ? `${environment.apiUrl}${apiUrl.reportShow}/${reportId}`
      : `${environment.apiUrl}${apiUrl.reportShow}`;

    this.http.get(url).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        const table = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.rows)
                ? data.rows
                : data
                  ? [data]
                  : [];
        this.rows = table;
        this.columns = this.rows.length ? Object.keys(this.rows[0]) : [];
        this.loading = false;
      },
      error: () => {
        this.rows = [];
        this.columns = [];
        this.loading = false;
      },
    });
  }

  private toDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
