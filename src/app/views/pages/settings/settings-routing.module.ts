import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { SmtpSettingsComponent } from './smtp-settings/smtp-settings.component';
import { PusherSettingsComponent } from './pusher-settings/pusher-settings.component';
import { PipingSettingsComponent } from './piping-settings/piping-settings.component';
import { LanguagesListComponent } from './languages-list/languages-list.component';
import { LanguagesFormComponent } from './languages-form/languages-form.component';
import { MenusListComponent } from './menus-list/menus-list.component';
import { MenusFormComponent } from './menus-form/menus-form.component';
import { EmailTemplatesListComponent } from './email-templates-list/email-templates-list.component';
import { EmailTemplateEditComponent } from './email-template-edit/email-template-edit.component';
import { TicketFieldsBuilderComponent } from './ticket-fields-builder/ticket-fields-builder.component';
import { LicenseComponent } from './license/license.component';
import { LatestUpdateComponent } from './latest-update/latest-update.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'global' },
  { path: 'global', component: GlobalSettingsComponent },
  { path: 'latest-update', component: LatestUpdateComponent },
  { path: 'updates', pathMatch: 'full', redirectTo: 'latest-update' },
  { path: 'smtp', component: SmtpSettingsComponent },
  { path: 'pusher', component: PusherSettingsComponent },
  { path: 'piping', component: PipingSettingsComponent },
  { path: 'languages', component: LanguagesListComponent },
  { path: 'languages/create', component: LanguagesFormComponent },
  { path: 'languages/:id/edit', component: LanguagesFormComponent },
  { path: 'menus', component: MenusListComponent },
  { path: 'menus/create', component: MenusFormComponent },
  { path: 'menus/:id/edit', component: MenusFormComponent },
  { path: 'email-templates', component: EmailTemplatesListComponent },
  { path: 'email-templates/:id/edit', component: EmailTemplateEditComponent },
  { path: 'ticket-fields', component: TicketFieldsBuilderComponent },
  { path: 'license', component: LicenseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
