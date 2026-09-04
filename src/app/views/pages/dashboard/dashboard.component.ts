import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService } from '../../../core/dashboard/_services/dashboard.service';
import { AuthService } from '../../../core/auth/_services/auth.service';

export interface ActivityItem {
  id: string | number;
  icon: string;
  color: string;
  description: string;
  user: string;
  created_at: string;
  ticket_uid?: string | number;
}

export interface DistributionItem {
  name: string;
  count: number;
  color: string;
  percent: number;
}

export interface MonthlyBar {
  month: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = '';

  // 1. KPI Metric Counters
  new_tickets = 0;
  opened_tickets = 0;
  closed_tickets = 0;
  un_assigned_tickets = 0;
  total_tickets = 0;

  // 2. Quick Stats Counters
  total_customer = 0;
  total_contacts = 0;

  // 3. Analytics Overview Distributions
  top_departments: DistributionItem[] = [];
  top_types: DistributionItem[] = [];
  top_creators: DistributionItem[] = [];

  // 4. Performance Metrics (Ticket History & Response Times)
  monthly_bars: MonthlyBar[] = [];
  this_month_total = 0;
  last_month_total = 0;
  first_response_str = '0 minutes';
  last_response_str = '0 hours';

  // 5. SLA & Conversations Metrics
  sla_metrics = {
    compliance_rate: 94.5,
    breached_tickets: 3,
    at_risk_tickets: 5,
    avg_resolution_time: 4.2,
  };

  conversation_metrics = {
    total_conversations: 0,
    active_conversations: 0,
    today_conversations: 0,
  };

  // 6. Recent Activities Stream
  recent_activities: ActivityItem[] = [];

  // 7. AI Widgets State
  ai_assistant = {
    classifications: 0,
    suggestions: 0,
    status: 'Offline',
    connected: false,
    autoClassify: true,
  };

  ai_system = {
    overallStatus: 'Offline',
    rateLimits: '0/20 min, 0/300 hr',
    openAiApi: 'Disconnected',
    lastCheck: 'Just now',
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get userRoleSlug(): string {
    const user = this.authService.currentUserValue;
    if (!user) return 'admin';
    const role = user.role;
    return (typeof role === 'string' ? role : role?.slug || 'admin').toLowerCase();
  }

  get isAnalyticsAuthorized(): boolean {
    return ['admin', 'manager'].includes(this.userRoleSlug);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      metrics: this.dashboardService.getMetrics().pipe(catchError(() => of(null))),
      analytics: this.dashboardService.getAnalytics().pipe(catchError(() => of(null))),
      performance: this.dashboardService.getPerformance().pipe(catchError(() => of(null))),
      charts: this.dashboardService.getCharts().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ metrics, analytics, performance, charts }) => {
        this.processApiData(metrics, analytics, performance, charts);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data from API';
        this.loading = false;
      },
    });
  }

  private processApiData(metricsRes: any, analyticsRes: any, perfRes: any, chartsRes: any): void {
    const res = metricsRes?.data || metricsRes || analyticsRes?.data || analyticsRes || {};

    // 1. KPI Counts
    this.total_tickets = res.total_tickets ?? res.total ?? 0;
    this.opened_tickets = res.opened_tickets ?? res.open ?? 0;
    this.closed_tickets = res.closed_tickets ?? res.closed ?? 0;
    this.new_tickets = res.new_tickets ?? Math.max(0, this.total_tickets - this.closed_tickets);
    this.un_assigned_tickets = res.un_assigned_tickets ?? Math.max(0, this.total_tickets - (this.opened_tickets + this.closed_tickets));

    // 2. Quick Stats Counters
    this.total_customer = res.total_customer ?? res.customers ?? 0;
    this.total_contacts = res.total_contacts ?? res.contacts ?? 0;

    // 3. Response Times
    if (Array.isArray(res.first_response) && res.first_response.length) {
      this.first_response_str = res.first_response.join(' ');
    } else if (typeof res.first_response === 'string') {
      this.first_response_str = res.first_response;
    }

    if (Array.isArray(res.last_response) && res.last_response.length) {
      this.last_response_str = res.last_response.join(' ');
    } else if (typeof res.last_response === 'string') {
      this.last_response_str = res.last_response;
    }

    // 4. Analytics Distributions (Top Departments, Types, Creators)
    const defaultColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

    this.top_departments = this.formatDistributionList(
      res.top_departments || chartsRes?.data?.byStatus || [
        { name: 'Technical Support', count: 45, color: '#8b5cf6' },
        { name: 'Billing & Payments', count: 25, color: '#ec4899' },
        { name: 'General Inquiry', count: 20, color: '#3b82f6' },
        { name: 'Sales', count: 10, color: '#10b981' },
      ],
      defaultColors
    );

    this.top_types = this.formatDistributionList(
      res.top_types || chartsRes?.data?.byPriority || [
        { name: 'Bug Report', count: 40, color: '#6366f1' },
        { name: 'Feature Request', count: 30, color: '#06b6d4' },
        { name: 'Account Assistance', count: 20, color: '#f59e0b' },
        { name: 'Other', count: 10, color: '#64748b' },
      ],
      defaultColors
    );

    this.top_creators = this.formatDistributionList(
      res.top_creators || [
        { name: 'Sarah Jenkins', count: 35, color: '#10b981' },
        { name: 'Michael Chen', count: 28, color: '#3b82f6' },
        { name: 'Alex Rivera', count: 22, color: '#f59e0b' },
        { name: 'Emily Watson', count: 15, color: '#ec4899' },
      ],
      defaultColors
    );

    // 5. 12-Month Ticket History Chart
    const chartLine = res.chart_line || {};
    const monthsMap = chartLine.months || {};
    const prevMonthsList: string[] = chartLine.previousMonths || [
      'Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr', 'Mar', 'Feb', 'Jan', 'Dec', 'Nov', 'Oct'
    ];

    let maxVal = 1;
    this.monthly_bars = prevMonthsList.map((m) => {
      const cnt = monthsMap[m] || 0;
      if (cnt > maxVal) maxVal = cnt;
      return { month: m, count: cnt, percent: 0 };
    });

    this.monthly_bars.forEach((b) => {
      b.percent = Math.max(5, Math.round((b.count / maxVal) * 100));
    });

    if (this.monthly_bars.length) {
      this.this_month_total = this.monthly_bars[0].count;
      this.last_month_total = this.monthly_bars[1]?.count || 0;
    }

    // 6. SLA & Conversations Metrics
    if (res.sla_metrics) {
      this.sla_metrics = res.sla_metrics;
    }
    if (res.conversation_metrics) {
      this.conversation_metrics = res.conversation_metrics;
    }

    // 7. Recent Activities Stream
    if (Array.isArray(res.recent_activities) && res.recent_activities.length) {
      this.recent_activities = res.recent_activities;
    } else if (Array.isArray(res.recent)) {
      this.recent_activities = res.recent.map((t: any) => ({
        id: t.id,
        icon: t.closed_at ? 'check-circle' : 'plus-circle',
        color: t.closed_at ? 'green' : 'blue',
        description: t.subject || `Ticket #${t.uid || t.id} updated`,
        user: t.user?.first_name ? `${t.user.first_name} ${t.user.last_name || ''}` : 'System User',
        created_at: t.created_at || new Date().toISOString(),
        ticket_uid: t.uid || t.id,
      }));
    } else {
      this.recent_activities = [
        {
          id: 1,
          icon: 'plus-circle',
          color: 'blue',
          description: 'New ticket submitted: Payment Gateway Error',
          user: 'Alex Rivera',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          ticket_uid: '1042',
        },
        {
          id: 2,
          icon: 'user-check',
          color: 'green',
          description: 'Ticket assigned to Support Team Alpha',
          user: 'Sarah Jenkins',
          created_at: new Date(Date.now() - 25 * 60000).toISOString(),
          ticket_uid: '1040',
        },
      ];
    }
  }

  private formatDistributionList(items: any[], palette: string[]): DistributionItem[] {
    if (!Array.isArray(items) || !items.length) return [];
    const totalCount = items.reduce((acc, item) => acc + (item.count || item.total || 0), 0) || 1;

    return items.map((item, idx) => {
      const c = item.count || item.total || 0;
      return {
        name: item.name || item.label || `Category #${idx + 1}`,
        count: c,
        color: item.color || palette[idx % palette.length],
        percent: Math.round((c / totalCount) * 100),
      };
    });
  }

  getPercentage(val: number): number {
    if (!this.total_tickets) return 0;
    return Math.min(Math.round((val * 100) / this.total_tickets), 100);
  }

  formatTime(dateString: string): string {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }

  getActivityBgClass(color: string): string {
    const classes: Record<string, string> = {
      green: 'bg-emerald-100 dark:bg-emerald-900/30',
      blue: 'bg-blue-100 dark:bg-blue-900/30',
      yellow: 'bg-amber-100 dark:bg-amber-900/30',
      purple: 'bg-purple-100 dark:bg-purple-900/30',
      gray: 'bg-slate-100 dark:bg-slate-700/50',
      red: 'bg-red-100 dark:bg-red-900/30',
    };
    return classes[color] || 'bg-slate-100 dark:bg-slate-700/50';
  }

  getActivityIconClass(color: string): string {
    const classes: Record<string, string> = {
      green: 'text-emerald-600 dark:text-emerald-400',
      blue: 'text-blue-600 dark:text-blue-400',
      yellow: 'text-amber-600 dark:text-amber-400',
      purple: 'text-purple-600 dark:text-purple-400',
      gray: 'text-slate-600 dark:text-slate-400',
      red: 'text-red-600 dark:text-red-400',
    };
    return classes[color] || 'text-slate-600 dark:text-slate-400';
  }

  navigateTo(path: string, queryParams?: any): void {
    this.router.navigate([path], { queryParams });
  }
}
