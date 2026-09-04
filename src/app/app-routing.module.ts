import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './views/theme/base/base.component';
import { AuthGuard } from './core/auth/_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./views/pages/landing/landing.module').then((m) => m.LandingModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./views/pages/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin-services',
        loadChildren: () =>
          import('./views/pages/services/services.module').then(
            (m) => m.ServicesModule
          ),
      },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./views/pages/tickets/tickets.module').then(
            (m) => m.TicketsModule
          ),
      },
      {
        path: 'chat',
        loadChildren: () =>
          import('./views/pages/chat/chat.module').then((m) => m.ChatModule),
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./views/pages/contacts/contacts.module').then(
            (m) => m.ContactsModule
          ),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./views/pages/customers/customers.module').then(
            (m) => m.CustomersModule
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./views/pages/users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'pending-users',
        loadChildren: () =>
          import('./views/pages/pending-users/pending-users.module').then(
            (m) => m.PendingUsersModule
          ),
      },
      {
        path: 'organizations',
        loadChildren: () =>
          import('./views/pages/organizations/organizations.module').then(
            (m) => m.OrganizationsModule
          ),
      },
      {
        path: 'notes',
        loadChildren: () =>
          import('./views/pages/notes/notes.module').then((m) => m.NotesModule),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./views/pages/categories/categories.module').then(
            (m) => m.CategoriesModule
          ),
      },
      {
        path: 'priorities',
        loadChildren: () =>
          import('./views/pages/priorities/priorities.module').then(
            (m) => m.PrioritiesModule
          ),
      },
      {
        path: 'statuses',
        loadChildren: () =>
          import('./views/pages/statuses/statuses.module').then(
            (m) => m.StatusesModule
          ),
      },
      {
        path: 'departments',
        loadChildren: () =>
          import('./views/pages/departments/departments.module').then(
            (m) => m.DepartmentsModule
          ),
      },
      {
        path: 'types',
        loadChildren: () =>
          import('./views/pages/types/types.module').then((m) => m.TypesModule),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./views/pages/roles/roles.module').then((m) => m.RolesModule),
      },
      {
        path: 'faqs',
        loadChildren: () =>
          import('./views/pages/faqs/faqs.module').then((m) => m.FaqsModule),
      },
      {
        path: 'blogs',
        loadChildren: () =>
          import('./views/pages/blogs/blogs.module').then((m) => m.BlogsModule),
      },
      {
        path: 'knowledge-base',
        loadChildren: () =>
          import('./views/pages/knowledge-base/knowledge-base.module').then(
            (m) => m.KnowledgeBaseModule
          ),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./views/pages/services/services.module').then(
            (m) => m.ServicesModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./views/pages/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: 'front-pages',
        loadChildren: () =>
          import('./views/pages/front-pages/front-pages.module').then(
            (m) => m.FrontPagesModule
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./views/pages/reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/pages/notifications/notifications.module').then(
            (m) => m.NotificationsModule
          ),
      },
      {
        path: 'ai',
        loadChildren: () =>
          import('./views/pages/ai/ai.module').then((m) => m.AiModule),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
