const fs = require('fs');
const path = require('path');
const root = path.join('D:', 'Projects', 'HelpDesk', 'helpdesk-admin', 'src', 'app');

function write(file, content) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log('wrote', file);
}

function toPascal(slug) {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

const features = [
  {
    slug: 'contacts',
    title: 'Contacts',
    service: 'ContactService',
    servicePath: 'core/contact/_services/contact.service',
    columns: ['name', 'email', 'phone', 'created_at'],
  },
  {
    slug: 'customers',
    title: 'Customers',
    service: 'UserService',
    servicePath: 'core/user/_services/user.service',
    columns: ['first_name', 'last_name', 'email', 'role'],
    extraParams: "{ role: 'customer' }",
    note: 'Filtered users with customer role',
  },
  {
    slug: 'users',
    title: 'Users',
    service: 'UserService',
    servicePath: 'core/user/_services/user.service',
    columns: ['first_name', 'last_name', 'email', 'role', 'created_at'],
  },
  {
    slug: 'organizations',
    title: 'Organizations',
    path: '/organization/all',
    columns: ['name', 'email', 'phone', 'created_at'],
  },
  {
    slug: 'notes',
    title: 'Notes',
    path: '/note/all',
    columns: ['title', 'body', 'created_at'],
  },
  {
    slug: 'categories',
    title: 'Categories',
    path: '/category/all',
    columns: ['name', 'slug', 'created_at'],
  },
  {
    slug: 'priorities',
    title: 'Priorities',
    path: '/priority/all',
    columns: ['name', 'color', 'created_at'],
  },
  {
    slug: 'statuses',
    title: 'Statuses',
    path: '/status/all',
    columns: ['name', 'color', 'created_at'],
  },
  {
    slug: 'departments',
    title: 'Departments',
    path: '/department/all',
    columns: ['name', 'email', 'created_at'],
  },
  {
    slug: 'types',
    title: 'Types',
    path: '/type/all',
    columns: ['name', 'slug', 'created_at'],
  },
  {
    slug: 'roles',
    title: 'Roles',
    path: '/role/all',
    columns: ['name', 'slug', 'created_at'],
  },
  {
    slug: 'faqs',
    title: 'FAQs',
    path: '/faq/all',
    columns: ['question', 'answer', 'created_at'],
  },
  {
    slug: 'blogs',
    title: 'Blogs',
    path: '/post/all',
    columns: ['title', 'slug', 'created_at'],
  },
  {
    slug: 'knowledge-base',
    title: 'Knowledge Base',
    path: '/knowledge-base/all',
    columns: ['title', 'slug', 'created_at'],
  },
  {
    slug: 'services',
    title: 'Services',
    path: '/service/all',
    columns: ['name', 'description', 'created_at'],
  },
  {
    slug: 'settings',
    title: 'Settings',
    service: 'SettingService',
    servicePath: 'core/setting/_services/setting.service',
    columns: ['key', 'value', 'group'],
  },
  {
    slug: 'reports',
    title: 'Reports',
    path: '/report/show',
    columns: ['name', 'type', 'created_at'],
    customLoad: 'reports',
  },
  {
    slug: 'notifications',
    title: 'Notifications',
    path: '/notification/all',
    columns: ['title', 'message', 'created_at'],
  },
  {
    slug: 'ai',
    title: 'AI Tools',
    path: '/ai/status',
    columns: ['feature', 'status'],
    customLoad: 'ai',
  },
  {
    slug: 'chat',
    title: 'Chat',
    service: 'ConversationService',
    servicePath: 'core/conversation/_services/conversation.service',
    columns: ['subject', 'status', 'updated_at'],
  },
];

function normalizeRowsExpr() {
  return `Array.isArray(data) ? data : (data?.items || data?.list || [])`;
}

for (const f of features) {
  const pascal = toPascal(f.slug);
  const listComp = pascal + 'ListComponent';
  const folder = path.join('views', 'pages', f.slug);
  const cols = f.columns;
  const ths = cols
    .map((c) => `          <th>${c.replace(/_/g, ' ')}</th>`)
    .join('\n');
  const tds = cols
    .map((c) => `          <td>{{ row.${c} || '—' }}</td>`)
    .join('\n');

  let imports = `import { Component, OnInit } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { environment } from '../../../../../../environments/environment';\n`;
  if (f.service) {
    imports += `import { ${f.service} } from '../../../../${f.servicePath}';\n`;
  }

  const ctorDeps = f.service
    ? `private service: ${f.service}, private http: HttpClient`
    : 'private http: HttpClient';

  let loadBody;
  if (f.customLoad === 'reports') {
    loadBody = `this.http.get(\`\${environment.apiUrl}/report/show\`).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.rows = ${normalizeRowsExpr()};
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load reports';
        this.loading = false;
      }
    });`;
  } else if (f.customLoad === 'ai') {
    loadBody = `this.http.get(\`\${environment.apiUrl}/ai/status\`).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.rows = Array.isArray(data) ? data : (data ? [data] : []);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load AI status';
        this.loading = false;
      }
    });`;
  } else if (f.service) {
    const params = f.extraParams || '{}';
    loadBody = `this.service.getAll(${params}).subscribe({
      next: (data: any) => {
        this.rows = ${normalizeRowsExpr()};
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load ${f.title.toLowerCase()}';
        this.loading = false;
      }
    });`;
  } else {
    loadBody = `this.http.get(\`\${environment.apiUrl}${f.path}\`).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.rows = ${normalizeRowsExpr()};
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load ${f.title.toLowerCase()}';
        this.loading = false;
      }
    });`;
  }

  write(
    path.join(folder, `${f.slug}-list`, `${f.slug}-list.component.ts`),
    `${imports}
@Component({
  selector: 'app-${f.slug}-list',
  templateUrl: './${f.slug}-list.component.html',
  styleUrls: ['./${f.slug}-list.component.scss']
})
export class ${listComp} implements OnInit {
  rows: any[] = [];
  loading = true;
  error = '';

  constructor(${ctorDeps}) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    ${loadBody}
  }
}
`
  );

  write(
    path.join(folder, `${f.slug}-list`, `${f.slug}-list.component.html`),
    `<div class="p-6">
  <div class="mb-6 flex items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">${f.title}</h2>
      <p class="text-sm text-slate-500 mt-1">${f.note || `Browse and manage ${f.title.toLowerCase()}`}</p>
    </div>
    <button type="button" class="hd-btn-secondary" (click)="load()">Refresh</button>
  </div>

  <div *ngIf="loading" class="hd-card p-8 text-center text-slate-500">Loading…</div>
  <div *ngIf="!loading && error" class="hd-card p-8 text-center text-red-600">{{ error }}</div>

  <div *ngIf="!loading && !error" class="hd-table-wrap">
    <div class="overflow-x-auto">
      <table class="hd-table">
        <thead>
          <tr>
${ths}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr *ngFor="let row of rows">
${tds}
          </tr>
          <tr *ngIf="!rows.length">
            <td colspan="${cols.length}" class="px-4 py-8 text-center text-slate-500">No records found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`
  );

  write(path.join(folder, `${f.slug}-list`, `${f.slug}-list.component.scss`), '');

  write(
    path.join(folder, `${f.slug}-routing.module.ts`),
    `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ${listComp} } from './${f.slug}-list/${f.slug}-list.component';

const routes: Routes = [
  { path: '', component: ${listComp} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ${pascal}RoutingModule {}
`
  );

  write(
    path.join(folder, `${f.slug}.module.ts`),
    `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ${pascal}RoutingModule } from './${f.slug}-routing.module';
import { ${listComp} } from './${f.slug}-list/${f.slug}-list.component';

@NgModule({
  declarations: [${listComp}],
  imports: [CommonModule, FormsModule, ${pascal}RoutingModule]
})
export class ${pascal}Module {}
`
  );
}

console.log('Done features:', features.length);
