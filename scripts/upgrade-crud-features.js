/**
 * Upgrades stub Angular feature modules to full list + create/edit CRUD
 * matching Laravel HelpDesk Vue page field structures.
 * Does NOT touch: tickets, chat, dashboard, auth, landing, settings (custom).
 */
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

function toCamel(slug) {
  const p = toPascal(slug);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

/** Shared CRUD entity services (generated) */
const services = [
  {
    folder: 'organization',
    name: 'OrganizationService',
    keys: {
      all: 'organizationsAll',
      single: 'organizationSingle',
      create: 'organizationCreate',
      update: 'organizationUpdate',
      delete: 'organizationDelete',
    },
  },
  {
    folder: 'note',
    name: 'NoteService',
    keys: {
      all: 'notesAll',
      single: 'noteSingle',
      create: 'noteCreate',
      update: 'noteUpdate',
      delete: 'noteDelete',
    },
  },
  {
    folder: 'category',
    name: 'CategoryService',
    keys: {
      all: 'categoriesAll',
      single: 'categorySingle',
      create: 'categoryCreate',
      update: 'categoryUpdate',
      delete: 'categoryDelete',
    },
  },
  {
    folder: 'priority',
    name: 'PriorityService',
    keys: {
      all: 'prioritiesAll',
      single: 'prioritySingle',
      create: 'priorityCreate',
      update: 'priorityUpdate',
      delete: 'priorityDelete',
    },
  },
  {
    folder: 'status',
    name: 'StatusService',
    keys: {
      all: 'statusesAll',
      single: 'statusSingle',
      create: 'statusCreate',
      update: 'statusUpdate',
      delete: 'statusDelete',
    },
  },
  {
    folder: 'department',
    name: 'DepartmentService',
    keys: {
      all: 'departmentsAll',
      single: 'departmentSingle',
      create: 'departmentCreate',
      update: 'departmentUpdate',
      delete: 'departmentDelete',
    },
  },
  {
    folder: 'type',
    name: 'TypeService',
    keys: {
      all: 'typesAll',
      single: 'typeSingle',
      create: 'typeCreate',
      update: 'typeUpdate',
      delete: 'typeDelete',
    },
  },
  {
    folder: 'role',
    name: 'RoleService',
    keys: {
      all: 'rolesAll',
      single: 'roleSingle',
      create: 'roleCreate',
      update: 'roleUpdate',
      delete: 'roleDelete',
    },
  },
  {
    folder: 'faq',
    name: 'FaqService',
    keys: {
      all: 'faqsAll',
      single: 'faqSingle',
      create: 'faqCreate',
      update: 'faqUpdate',
      delete: 'faqDelete',
    },
  },
  {
    folder: 'blog',
    name: 'BlogService',
    keys: {
      all: 'blogsAll',
      single: 'blogSingle',
      create: 'blogCreate',
      update: 'blogUpdate',
      delete: 'blogDelete',
    },
  },
  {
    folder: 'knowledge-base',
    name: 'KnowledgeBaseService',
    keys: {
      all: 'knowledgeBaseAll',
      single: 'knowledgeBaseSingle',
      create: 'knowledgeBaseCreate',
      update: 'knowledgeBaseUpdate',
      delete: 'knowledgeBaseDelete',
    },
  },
  {
    folder: 'service',
    name: 'CmsServiceService',
    keys: {
      all: 'servicesAll',
      single: 'serviceSingle',
      create: 'serviceCreate',
      update: 'serviceUpdate',
      delete: 'serviceDelete',
    },
  },
  {
    folder: 'notification',
    name: 'NotificationService',
    keys: {
      all: 'notificationsAll',
      single: 'notifications',
      create: null,
      update: null,
      delete: null,
    },
    custom: true,
  },
];

for (const s of services) {
  if (s.custom) continue;
  const createMethod = `create${s.name.replace('Service', '')}`;
  const updateMethod = `update${s.name.replace('Service', '')}`;
  const deleteMethod = `delete${s.name.replace('Service', '')}`;
  // Prefer clearer names
  const cName = s.name === 'CmsServiceService' ? 'createService' : `create${toPascal(s.folder.replace(/-/g, '_').replace(/_/g, '-')).replace(/-/g, '')}`;
  // Simpler: use create/update/deleteEntity pattern
  write(
    path.join('core', s.folder, '_services', `${s.folder}.service.ts`),
    `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class ${s.name} extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.${s.keys.all}, params);
  }

  getById(id: string | number): Observable<any> {
    return this.getSingle(apiUrl.${s.keys.single}, { id, _id: id });
  }

  create(body: any): Observable<any> {
    return this.post(apiUrl.${s.keys.create}, body);
  }

  update(body: any): Observable<any> {
    return this.put(apiUrl.${s.keys.update}, body);
  }

  deleteById(id: string | number): Observable<any> {
    return this.delete(apiUrl.${s.keys.delete}, { id, _id: id });
  }
}
`
  );
}

// Notification service (list + mark read)
write(
  path.join('core', 'notification', '_services', 'notification.service.ts'),
  `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

@Injectable({ providedIn: 'root' })
export class NotificationService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(params?: Record<string, any>): Observable<any> {
    return this.getCollection(apiUrl.notificationsAll, params);
  }

  markAsRead(id: string | number): Observable<any> {
    return this.post(apiUrl.notificationMarkRead, { id, _id: id });
  }

  markAllAsRead(): Observable<any> {
    return this.post(apiUrl.notificationMarkAllRead, {});
  }
}
`
);

/**
 * Feature definitions aligned with Laravel Create.vue forms
 */
const features = [
  {
    slug: 'priorities',
    title: 'Priorities',
    singular: 'Priority',
    service: 'PriorityService',
    servicePath: 'core/priority/_services/priority.service',
    permission: 'priority',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  {
    slug: 'statuses',
    title: 'Statuses',
    singular: 'Status',
    service: 'StatusService',
    servicePath: 'core/status/_services/status.service',
    permission: 'status',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  {
    slug: 'departments',
    title: 'Departments',
    singular: 'Department',
    service: 'DepartmentService',
    servicePath: 'core/department/_services/department.service',
    permission: 'department',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  {
    slug: 'types',
    title: 'Types',
    singular: 'Type',
    service: 'TypeService',
    servicePath: 'core/type/_services/type.service',
    permission: 'type',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'Slug' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
    ],
  },
  {
    slug: 'categories',
    title: 'Categories',
    singular: 'Category',
    service: 'CategoryService',
    servicePath: 'core/category/_services/category.service',
    permission: 'category',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'department.name', label: 'Department' },
      { key: 'parent.name', label: 'Parent' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'department_id', label: 'Department', type: 'select', optionsFrom: 'departments', optionLabel: 'name' },
      { key: 'parent_id', label: 'Parent Category', type: 'select', optionsFrom: 'parents', optionLabel: 'name' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'color', label: 'Color', type: 'color' },
    ],
    loadExtras: true,
  },
  {
    slug: 'organizations',
    title: 'Organizations',
    singular: 'Organization',
    service: 'OrganizationService',
    servicePath: 'core/organization/_services/organization.service',
    permission: 'organization',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'city', label: 'City' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'postal_code', label: 'Postal Code', type: 'text' },
    ],
  },
  {
    slug: 'contacts',
    title: 'Contacts',
    singular: 'Contact',
    service: 'ContactService',
    servicePath: 'core/contact/_services/contact.service',
    permission: 'contact',
    useExistingServiceMethods: true,
    columns: [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'organization_id', label: 'Organization', type: 'select', optionsFrom: 'organizations', optionLabel: 'name' },
      { key: 'department_id', label: 'Department', type: 'select', optionsFrom: 'departments', optionLabel: 'name' },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', staticOptions: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] },
    ],
    loadExtras: true,
  },
  {
    slug: 'customers',
    title: 'Customers',
    singular: 'Customer',
    service: 'UserService',
    servicePath: 'core/user/_services/user.service',
    permission: 'customer',
    useExistingServiceMethods: true,
    extraParams: "{ role: 'customer' }",
    columns: [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'password', label: 'Password', type: 'password', requiredOnCreate: true },
    ],
    forceRoleCustomer: true,
  },
  {
    slug: 'users',
    title: 'Users',
    singular: 'User',
    service: 'UserService',
    servicePath: 'core/user/_services/user.service',
    permission: 'user',
    useExistingServiceMethods: true,
    columns: [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'role.name', label: 'Role' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'role_id', label: 'Role', type: 'select', optionsFrom: 'roles', optionLabel: 'name', required: true },
      { key: 'password', label: 'Password', type: 'password', requiredOnCreate: true },
    ],
    loadExtras: true,
  },
  {
    slug: 'faqs',
    title: 'FAQs',
    singular: 'FAQ',
    service: 'FaqService',
    servicePath: 'core/faq/_services/faq.service',
    permission: 'faq',
    columns: [
      { key: 'name', label: 'Question' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'name', label: 'Question', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', staticOptions: [{ value: 1, label: 'Published' }, { value: 0, label: 'Draft' }] },
      { key: 'details', label: 'Answer', type: 'textarea', required: true },
    ],
  },
  {
    slug: 'blogs',
    title: 'Blog Posts',
    singular: 'Blog Post',
    service: 'BlogService',
    servicePath: 'core/blog/_services/blog.service',
    permission: 'blog',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type.name', label: 'Type' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type_id', label: 'Type', type: 'select', optionsFrom: 'types', optionLabel: 'name' },
      { key: 'details', label: 'Details', type: 'textarea', required: true },
    ],
    loadExtras: true,
  },
  {
    slug: 'knowledge-base',
    title: 'Knowledge Base',
    singular: 'Article',
    service: 'KnowledgeBaseService',
    servicePath: 'core/knowledge-base/_services/knowledge-base.service',
    permission: 'knowledge_base',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type.name', label: 'Type' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type_id', label: 'Type', type: 'select', optionsFrom: 'types', optionLabel: 'name' },
      { key: 'details', label: 'Details', type: 'textarea', required: true },
    ],
    loadExtras: true,
  },
  {
    slug: 'services',
    title: 'Services',
    singular: 'Service',
    service: 'CmsServiceService',
    servicePath: 'core/service/_services/service.service',
    permission: 'front_page',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'icon', label: 'Icon' },
      { key: 'created_at', label: 'Created' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'details', label: 'Details', type: 'textarea', required: true },
    ],
  },
];

function nestedGetExpr(key) {
  if (!key.includes('.')) return `row.${key}`;
  const parts = key.split('.');
  return parts.reduce((acc, p, i) => (i === 0 ? `row?.${p}` : `${acc}?.${p}`), '');
}

function formControlInit(field) {
  const def =
    field.type === 'select' && field.staticOptions
      ? field.staticOptions[0]?.value ?? null
      : field.type === 'color'
        ? "'#3b82f6'"
        : "''";
  if (field.required) return `[${typeof def === 'number' ? def : def}, Validators.required]`;
  if (field.requiredOnCreate) return `[${typeof def === 'string' && def.startsWith("'") ? def : JSON.stringify(def)}]`;
  if (typeof def === 'number') return `[${def}]`;
  return `[${def}]`;
}

for (const f of features) {
  const pascal = toPascal(f.slug);
  const listComp = `${pascal}ListComponent`;
  const formComp = `${pascal}FormComponent`;
  const folder = path.join('views', 'pages', f.slug);
  const routeBase = `/${f.slug}`;

  // Create method names for existing services
  const createCall = f.useExistingServiceMethods
    ? f.service === 'ContactService'
      ? 'createContact'
      : 'createUser'
    : 'create';
  const updateCall = f.useExistingServiceMethods
    ? f.service === 'ContactService'
      ? 'updateContact'
      : 'updateUser'
    : 'update';
  const deleteCall = f.useExistingServiceMethods
    ? f.service === 'ContactService'
      ? 'deleteContact'
      : 'deleteUser'
    : 'deleteById';

  // —— LIST TS ——
  const listExtrasImports = [];
  if (f.loadExtras) {
    // no extra imports needed; form component loads extras
  }

  write(
    path.join(folder, `${f.slug}-list`, `${f.slug}-list.component.ts`),
    `import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ${f.service} } from '../../../../${f.servicePath}';

@Component({
  selector: 'app-${f.slug}-list',
  templateUrl: './${f.slug}-list.component.html',
  styleUrls: ['./${f.slug}-list.component.scss'],
})
export class ${listComp} implements OnInit {
  rows: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  deletingId: string | number | null = null;

  constructor(
    private service: ${f.service},
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.getAll(${f.extraParams || '{}'}).subscribe({
      next: (data: any) => {
        this.rows = Array.isArray(data) ? data : (data?.items || data?.list || data?.data || []);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load ${f.title.toLowerCase()}';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = (this.search || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.rows];
      return;
    }
    this.filtered = this.rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(q)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  createNew(): void {
    this.router.navigate(['${routeBase}/create']);
  }

  edit(row: any): void {
    const id = row.id || row._id;
    this.router.navigate(['${routeBase}', id, 'edit']);
  }

  remove(row: any): void {
    const id = row.id || row._id;
    if (!id) return;
    if (!confirm('Delete this ${f.singular.toLowerCase()}? This can usually be restored from the API if soft-delete is enabled.')) {
      return;
    }
    this.deletingId = id;
    this.service.${deleteCall}(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Failed to delete ${f.singular.toLowerCase()}';
      },
    });
  }

  cell(row: any, key: string): any {
    if (!key.includes('.')) return row?.[key];
    return key.split('.').reduce((acc: any, k: string) => (acc == null ? null : acc[k]), row);
  }

  formatDate(value: any): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
}
`
  );

  // —— LIST HTML ——
  const ths = f.columns
    .map((c) => `            <th>${c.label}</th>`)
    .join('\n');
  const tds = f.columns
    .map((c) => {
      if (c.type === 'color') {
        return `            <td>
              <span class="inline-flex items-center gap-2">
                <span class="w-3 h-3 rounded-full border border-slate-200" [style.background]="cell(row, '${c.key}') || '#cbd5e1'"></span>
                {{ cell(row, '${c.key}') || '—' }}
              </span>
            </td>`;
      }
      if (c.key === 'created_at') {
        return `            <td>{{ formatDate(cell(row, '${c.key}')) }}</td>`;
      }
      return `            <td>{{ cell(row, '${c.key}') || '—' }}</td>`;
    })
    .join('\n');

  write(
    path.join(folder, `${f.slug}-list`, `${f.slug}-list.component.html`),
    `<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">${f.title}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage ${f.title.toLowerCase()} used across the helpdesk</p>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" class="hd-btn-secondary" (click)="load()">Refresh</button>
      <button type="button" class="hd-btn-primary" (click)="createNew()">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Create ${f.singular}
      </button>
    </div>
  </div>

  <div class="hd-card p-4">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="relative flex-1">
        <input
          type="search"
          class="hd-input pl-10"
          placeholder="Search ${f.title.toLowerCase()}..."
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange()"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <div class="text-sm text-slate-500 whitespace-nowrap">
        Total: {{ rows.length }} · Showing: {{ filtered.length }}
      </div>
    </div>
  </div>

  <div *ngIf="loading" class="hd-card p-10 text-center text-slate-500">
    <div class="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p>Loading ${f.title.toLowerCase()}…</p>
  </div>

  <div *ngIf="!loading && error" class="hd-card p-8 text-center text-red-600">{{ error }}</div>

  <div *ngIf="!loading && !error" class="hd-table-wrap">
    <div class="overflow-x-auto">
      <table class="hd-table">
        <thead>
          <tr>
${ths}
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          <tr *ngFor="let row of filtered">
${tds}
            <td class="text-right whitespace-nowrap">
              <button type="button" class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3" (click)="edit(row)">Edit</button>
              <button
                type="button"
                class="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                [disabled]="deletingId === (row.id || row._id)"
                (click)="remove(row)"
              >Delete</button>
            </td>
          </tr>
          <tr *ngIf="!filtered.length">
            <td colspan="${f.columns.length + 1}" class="px-4 py-10 text-center text-slate-500">
              No ${f.title.toLowerCase()} found. Create one to get started.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`
  );

  write(path.join(folder, `${f.slug}-list`, `${f.slug}-list.component.scss`), '');

  // —— FORM TS ——
  const formGroupLines = f.fields
    .map((field) => `      ${field.key}: ${formControlInit(field)},`)
    .join('\n');

  const extrasProps = [];
  const extrasLoad = [];
  const extrasImports = [];

  if (f.loadExtras) {
    const needs = new Set();
    f.fields.forEach((field) => {
      if (field.optionsFrom) needs.add(field.optionsFrom);
    });
    if (needs.has('departments')) {
      extrasImports.push(`import { DepartmentService } from '../../../../core/department/_services/department.service';`);
      extrasProps.push('departments: any[] = [];');
      extrasLoad.push(`    this.departmentService.getAll().subscribe({ next: (d) => { this.departments = Array.isArray(d) ? d : (d?.items || d?.list || []); } });`);
    }
    if (needs.has('parents') || needs.has('categories')) {
      extrasProps.push('parents: any[] = [];');
      extrasLoad.push(`    this.service.getAll().subscribe({ next: (d) => { this.parents = Array.isArray(d) ? d : (d?.items || d?.list || []); } });`);
    }
    if (needs.has('organizations')) {
      extrasImports.push(`import { OrganizationService } from '../../../../core/organization/_services/organization.service';`);
      extrasProps.push('organizations: any[] = [];');
      extrasLoad.push(`    this.organizationService.getAll().subscribe({ next: (d) => { this.organizations = Array.isArray(d) ? d : (d?.items || d?.list || []); } });`);
    }
    if (needs.has('roles')) {
      extrasImports.push(`import { RoleService } from '../../../../core/role/_services/role.service';`);
      extrasProps.push('roles: any[] = [];');
      extrasLoad.push(`    this.roleService.getAll().subscribe({ next: (d) => { this.roles = Array.isArray(d) ? d : (d?.items || d?.list || []); } });`);
    }
    if (needs.has('types')) {
      extrasImports.push(`import { TypeService } from '../../../../core/type/_services/type.service';`);
      extrasProps.push('types: any[] = [];');
      extrasLoad.push(`    this.typeService.getAll().subscribe({ next: (d) => { this.types = Array.isArray(d) ? d : (d?.items || d?.list || []); } });`);
    }
  }

  const ctorExtra = [];
  if (extrasImports.some((i) => i.includes('DepartmentService'))) ctorExtra.push('private departmentService: DepartmentService');
  if (extrasImports.some((i) => i.includes('OrganizationService'))) ctorExtra.push('private organizationService: OrganizationService');
  if (extrasImports.some((i) => i.includes('RoleService'))) ctorExtra.push('private roleService: RoleService');
  if (extrasImports.some((i) => i.includes('TypeService'))) ctorExtra.push('private typeService: TypeService');

  const patchLines = f.fields
    .map((field) => `          ${field.key}: item.${field.key} ?? ${field.type === 'select' && field.staticOptions ? field.staticOptions[0]?.value ?? 'null' : 'null'},`)
    .join('\n');

  write(
    path.join(folder, `${f.slug}-form`, `${f.slug}-form.component.ts`),
    `import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ${f.service} } from '../../../../${f.servicePath}';
${extrasImports.join('\n')}

@Component({
  selector: 'app-${f.slug}-form',
  templateUrl: './${f.slug}-form.component.html',
  styleUrls: ['./${f.slug}-form.component.scss'],
})
export class ${formComp} implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  error = '';
  isEditMode = false;
  entityId: string | null = null;
${extrasProps.map((p) => '  ' + p).join('\n')}

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: ${f.service}${ctorExtra.length ? ',\n    ' + ctorExtra.join(',\n    ') : ''}
  ) {}

  ngOnInit(): void {
    this.entityId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entityId;

    this.form = this.fb.group({
      id: [this.entityId],
${formGroupLines}
    });

${f.forceRoleCustomer ? `    // Customers are users with customer role (Laravel parity)\n    // role_id may be set by API from slug; keep password optional on edit.\n` : ''}
    this.loadExtras();

    if (this.isEditMode && this.entityId) {
      this.loadingData = true;
      this.service.getById(this.entityId).subscribe({
        next: (res) => {
          const item = res?.data ?? res?.item ?? res;
          this.form.patchValue({
            id: item.id || item._id || this.entityId,
${patchLines}
          });
${f.fields.some((x) => x.requiredOnCreate) ? `          // Password not required when editing\n          this.form.get('password')?.clearValidators();\n          this.form.get('password')?.updateValueAndValidity();\n` : ''}
          this.loadingData = false;
        },
        error: () => {
          this.error = 'Failed to load ${f.singular.toLowerCase()}';
          this.loadingData = false;
        },
      });
    } else {
${f.fields
  .filter((x) => x.requiredOnCreate)
  .map(
    (x) => `      this.form.get('${x.key}')?.setValidators([Validators.required]);\n      this.form.get('${x.key}')?.updateValueAndValidity();`
  )
  .join('\n')}
    }
  }

  loadExtras(): void {
${extrasLoad.join('\n') || '    // no extras'}
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = { ...this.form.getRawValue() };
${f.forceRoleCustomer ? `    raw.role = 'customer';\n` : ''}
    if (!raw.password) {
      delete raw.password;
    }

    const req$ = this.isEditMode
      ? this.service.${updateCall}(raw)
      : this.service.${createCall}(raw);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['${routeBase}']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['${routeBase}']);
  }

  hasError(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
`
  );

  // —— FORM HTML ——
  const fieldHtml = f.fields
    .map((field) => {
      const err = `        <p *ngIf="hasError('${field.key}')" class="mt-1 text-xs text-red-600">{{ '${field.label}' }} is required</p>`;
      if (field.type === 'textarea') {
        return `      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}</label>
        <textarea class="hd-input min-h-[140px]" formControlName="${field.key}" rows="6"></textarea>
${err}
      </div>`;
      }
      if (field.type === 'color') {
        return `      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}</label>
        <div class="flex items-center gap-3">
          <input type="color" class="h-10 w-14 rounded border border-slate-300 cursor-pointer" formControlName="${field.key}" />
          <input type="text" class="hd-input" formControlName="${field.key}" placeholder="#3b82f6" />
        </div>
      </div>`;
      }
      if (field.type === 'select') {
        let options = '';
        if (field.staticOptions) {
          options = field.staticOptions
            .map((o) => `          <option [ngValue]="${JSON.stringify(o.value)}">${o.label}</option>`)
            .join('\n');
        } else if (field.optionsFrom) {
          options = `          <option [ngValue]="null">None</option>
          <option *ngFor="let opt of ${field.optionsFrom}" [ngValue]="opt.id || opt._id">{{ opt.${field.optionLabel || 'name'} }}</option>`;
        }
        return `      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}</label>
        <select class="hd-input" formControlName="${field.key}">
${options}
        </select>
${field.required ? err : ''}
      </div>`;
      }
      const inputType =
        field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text';
      return `      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${field.label}${field.requiredOnCreate ? ' <span class="text-slate-400 font-normal">(required on create)</span>' : ''}</label>
        <input type="${inputType}" class="hd-input" formControlName="${field.key}" />
${field.required || field.requiredOnCreate ? err : ''}
      </div>`;
    })
    .join('\n\n');

  write(
    path.join(folder, `${f.slug}-form`, `${f.slug}-form.component.html`),
    `<div class="space-y-6 max-w-3xl">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {{ isEditMode ? 'Edit ${f.singular}' : 'Create ${f.singular}' }}
      </h1>
      <p class="text-sm text-slate-500 mt-0.5">{{ isEditMode ? 'Update existing record' : 'Add a new ${f.singular.toLowerCase()}' }}</p>
    </div>
    <button type="button" class="hd-btn-secondary" (click)="cancel()">Back</button>
  </div>

  <div *ngIf="loadingData" class="hd-card p-10 text-center text-slate-500">Loading…</div>

  <form *ngIf="!loadingData" class="hd-card" [formGroup]="form" (ngSubmit)="submit()">
    <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
${fieldHtml}
    </div>

    <div *ngIf="error" class="px-6 pb-2 text-sm text-red-600">{{ error }}</div>

    <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
      <button type="button" class="hd-btn-secondary" (click)="cancel()" [disabled]="loading">Cancel</button>
      <button type="submit" class="hd-btn-primary" [disabled]="loading">
        {{ loading ? 'Saving…' : (isEditMode ? 'Update ${f.singular}' : 'Create ${f.singular}') }}
      </button>
    </div>
  </form>
</div>
`
  );

  write(path.join(folder, `${f.slug}-form`, `${f.slug}-form.component.scss`), '');

  // —— ROUTING ——
  write(
    path.join(folder, `${f.slug}-routing.module.ts`),
    `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ${listComp} } from './${f.slug}-list/${f.slug}-list.component';
import { ${formComp} } from './${f.slug}-form/${f.slug}-form.component';

const routes: Routes = [
  { path: '', component: ${listComp} },
  { path: 'create', component: ${formComp} },
  { path: ':id/edit', component: ${formComp} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ${pascal}RoutingModule {}
`
  );

  // —— MODULE ——
  write(
    path.join(folder, `${f.slug}.module.ts`),
    `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ${pascal}RoutingModule } from './${f.slug}-routing.module';
import { ${listComp} } from './${f.slug}-list/${f.slug}-list.component';
import { ${formComp} } from './${f.slug}-form/${f.slug}-form.component';

@NgModule({
  declarations: [${listComp}, ${formComp}],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ${pascal}RoutingModule],
})
export class ${pascal}Module {}
`
  );
}

console.log('Upgraded CRUD features:', features.length);
console.log('Generated services:', services.filter((s) => !s.custom).length + 1);
