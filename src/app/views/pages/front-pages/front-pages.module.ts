import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontPagesRoutingModule } from './front-pages-routing.module';
import { FrontPageEditorComponent } from './front-page-editor/front-page-editor.component';
import { HomePageEditorComponent } from './home-page-editor/home-page-editor.component';
import { ServicesPageEditorComponent } from './services-page-editor/services-page-editor.component';
import { ContactPageEditorComponent } from './contact-page-editor/contact-page-editor.component';
import { PrivacyPageEditorComponent } from './privacy-page-editor/privacy-page-editor.component';
import { TermsPageEditorComponent } from './terms-page-editor/terms-page-editor.component';

@NgModule({
  declarations: [
    FrontPageEditorComponent,
    HomePageEditorComponent,
    ServicesPageEditorComponent,
    ContactPageEditorComponent,
    PrivacyPageEditorComponent,
    TermsPageEditorComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FrontPagesRoutingModule],
})
export class FrontPagesModule {}
