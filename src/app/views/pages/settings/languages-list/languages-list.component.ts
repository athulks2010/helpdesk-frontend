import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from '../../../../core/setting/_services/setting.service';

@Component({
  selector: 'app-languages-list',
  templateUrl: './languages-list.component.html',
  styleUrls: ['./languages-list.component.scss'],
})
export class LanguagesListComponent implements OnInit {
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
    this.settingService.getLanguages().subscribe({
      next: (data) => {
        this.rows = Array.isArray(data) ? data : data?.items || data?.list || data?.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load languages';
        this.loading = false;
      },
    });
  }

  createNew(): void {
    this.router.navigate(['/settings/languages/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    this.router.navigate(['/settings/languages', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id || !confirm('Delete this language?')) return;
    this.settingService.deleteLanguage(id).subscribe({
      next: () => this.load(),
      error: () => (this.error = 'Failed to delete language'),
    });
  }
}
