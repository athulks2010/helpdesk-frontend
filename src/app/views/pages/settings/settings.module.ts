import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsRoutingModule } from './settings-routing.module';
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

@NgModule({
  declarations: [
    GlobalSettingsComponent,
    SmtpSettingsComponent,
    PusherSettingsComponent,
    PipingSettingsComponent,
    LanguagesListComponent,
    LanguagesFormComponent,
    MenusListComponent,
    MenusFormComponent,
    EmailTemplatesListComponent,
    EmailTemplateEditComponent,
    TicketFieldsBuilderComponent,
    LicenseComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SettingsRoutingModule],
})
export class SettingsModule {}
