import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AiService } from '../../../../core/ai/_services/ai.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-ai-list',
  templateUrl: './ai-list.component.html',
  styleUrls: ['./ai-list.component.scss'],
})
export class AiListComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  success = '';
  status: any = null;
  analytics: any = null;
  analyticsCards: Array<{ label: string; value: any }> = [];
  showApiKey = false;

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      enabled: [false],
      api_key: [''],
      model: ['gpt-3.5-turbo'],
      temperature: [0.7],
    });
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.loading = false;
    };

    this.aiService.getStatus().subscribe({
      next: (res) => {
        this.status = res?.data ?? res;
        done();
      },
      error: () => {
        this.status = { available: false };
        done();
      },
    });

    this.aiService.getAnalytics().subscribe({
      next: (res) => {
        this.analytics = res?.data ?? res;
        this.analyticsCards = this.buildCards(this.analytics);
        done();
      },
      error: () => {
        this.analytics = null;
        this.analyticsCards = [];
        done();
      },
    });

    this.aiService.getSettings().subscribe({
      next: (res) => {
        const data = res?.data ?? res ?? {};
        this.form.patchValue({
          enabled: !!(data.enabled ?? data.ai_enabled),
          api_key: data.api_key ?? data.openai_api_key ?? '',
          model: data.model ?? data.openai_model ?? 'gpt-3.5-turbo',
          temperature: Number(data.temperature ?? 0.7),
        });
        done();
      },
      error: () => {
        done();
      },
    });
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    this.aiService.updateSettings(this.form.getRawValue()).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.success = 'AI settings saved';
        this.toast.success(res?.response?.message || res?.message || 'AI settings saved successfully');
        this.loadAll();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  private buildCards(data: any): Array<{ label: string; value: any }> {
    if (!data || typeof data !== 'object') return [];
    if (Array.isArray(data)) {
      return data.slice(0, 6).map((item, i) => ({
        label: item.label || item.name || `Metric ${i + 1}`,
        value: item.value ?? item.count ?? '—',
      }));
    }
    const preferred = [
      'total_requests',
      'requests',
      'classifications',
      'suggestions',
      'tokens_used',
      'avg_confidence',
      'success_rate',
    ];
    const cards: Array<{ label: string; value: any }> = [];
    preferred.forEach((key) => {
      if (data[key] != null) {
        cards.push({ label: key.replace(/_/g, ' '), value: data[key] });
      }
    });
    if (!cards.length) {
      Object.keys(data)
        .slice(0, 6)
        .forEach((key) => {
          const val = data[key];
          if (typeof val !== 'object') {
            cards.push({ label: key.replace(/_/g, ' '), value: val });
          }
        });
    }
    return cards;
  }
}
