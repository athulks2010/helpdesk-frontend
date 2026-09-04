import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-email-templates-list',
  templateUrl: './email-templates-list.component.html',
  styleUrls: ['./email-templates-list.component.scss'],
})
export class EmailTemplatesListComponent implements OnInit {
  rows: any[] = [];
  loading = true;
  error = '';

  constructor(private settingService: SettingService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.settingService.getEmailTemplates({}).subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load email templates';
        this.loading = false;
      },
    });
  }

  edit(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    this.router.navigate(['/settings/email-templates', id, 'edit']);
  }
}
