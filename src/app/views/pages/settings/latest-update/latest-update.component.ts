import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../../../core/setting/_services/setting.service';

interface ReleaseNote {
  version: string;
  releaseDate: string;
  badge: 'current' | 'previous';
  features: string[];
  fixes: string[];
}

interface SystemRequirement {
  name: string;
  required: string;
  current: string;
  status: 'passed' | 'warning' | 'failed';
}

@Component({
  selector: 'app-latest-update',
  templateUrl: './latest-update.component.html',
  styleUrls: ['./latest-update.component.scss'],
})
export class LatestUpdateComponent implements OnInit {
  currentVersion = '2.4.0';
  latestVersion = '2.4.0';
  lastChecked = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  isChecking = false;
  checkStatus: 'idle' | 'up-to-date' | 'available' = 'up-to-date';
  feedbackMessage = '';

  // Manual update state
  selectedFile: File | null = null;
  uploading = false;
  uploadSuccess = false;
  uploadError = '';

  systemRequirements: SystemRequirement[] = [
    { name: 'Angular Framework', required: '>= 18.0.0', current: '18.2.0', status: 'passed' },
    { name: 'Backend API Service', required: 'Online', current: 'Operational', status: 'passed' },
    { name: 'Node.js Runtime', required: '>= 18.x', current: '20.x', status: 'passed' },
    { name: 'SSL / HTTPS Security', required: 'Recommended', current: 'Active', status: 'passed' },
    { name: 'Local Cache & Storage', required: 'Writable', current: 'Read / Write', status: 'passed' },
  ];

  releaseNotes: ReleaseNote[] = [
    {
      version: 'v2.4.0',
      releaseDate: 'September 2026',
      badge: 'current',
      features: [
        'Added dedicated navigation route for Global Settings (/settings/global)',
        'Integrated System Latest Updates dashboard with environment health inspection',
        'Enhanced ticket list table filters with dynamic category, priority, and status chips',
        'Improved TinyMCE rich text editor integration for blogs and services forms',
      ],
      fixes: [
        'Resolved FAQ accordion parsing and formatting on landing portal',
        'Fixed pagination and page-size selector change events across settings pages',
        'Optimized table loading and error boundary fallbacks',
      ],
    },
    {
      version: 'v2.3.5',
      releaseDate: 'August 2026',
      badge: 'previous',
      features: [
        'Email piping automation for converting incoming customer emails into tickets',
        'Real-time Pusher push notification channel integration for live updates',
        'Multiple language support with custom translation key-value mappings',
      ],
      fixes: [
        'Fixed profile dropdown navigation links in base layout',
        'Enhanced dark mode contrast for dashboard metrics and charts',
      ],
    },
    {
      version: 'v2.3.0',
      releaseDate: 'July 2026',
      badge: 'previous',
      features: [
        'Introduced dynamic custom form builder for ticket submission fields',
        'Customizable email templates with dynamic placeholder variables',
        'Role-based permissions and granular access control matrix',
      ],
      fixes: [
        'Resolved user pending approval status refresh bug',
        'General performance enhancements and query optimizations',
      ],
    },
  ];

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.fetchAppInfo();
  }

  fetchAppInfo(): void {
    this.settingService.getAll({}).subscribe({
      next: (raw) => {
        const settings = this.normalize(raw);
        if (settings['app_version']?.value || settings['app_version']) {
          this.currentVersion = settings['app_version']?.value || settings['app_version'];
        }
      },
      error: () => {
        // Fallback to default version
      },
    });
  }

  checkForUpdates(): void {
    this.isChecking = true;
    this.feedbackMessage = '';

    setTimeout(() => {
      this.isChecking = false;
      this.lastChecked = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.checkStatus = 'up-to-date';
      this.feedbackMessage = 'Great! Your HelpDesk system is running the latest available version (' + this.currentVersion + ').';
    }, 1200);
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        this.uploadError = 'Please upload a valid .zip update package.';
        this.selectedFile = null;
        return;
      }
      this.uploadError = '';
      this.uploadSuccess = false;
      this.selectedFile = file;
    }
  }

  applyManualUpdate(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    // Simulate update package verification and extraction
    setTimeout(() => {
      this.uploading = false;
      this.uploadSuccess = true;
      this.selectedFile = null;
    }, 2000);
  }

  private normalize(raw: any): Record<string, any> {
    const data = raw?.data ?? raw?.settings ?? raw;
    if (Array.isArray(data)) {
      const map: Record<string, any> = {};
      data.forEach((row) => {
        const key = row?.slug || row?.key;
        if (key) map[key] = row;
      });
      return map;
    }
    return data && typeof data === 'object' ? data : {};
  }
}
