import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontPageEditorComponent } from './front-page-editor/front-page-editor.component';
import { HomePageEditorComponent } from './home-page-editor/home-page-editor.component';
import { ServicesPageEditorComponent } from './services-page-editor/services-page-editor.component';
import { ContactPageEditorComponent } from './contact-page-editor/contact-page-editor.component';
import { PrivacyPageEditorComponent } from './privacy-page-editor/privacy-page-editor.component';
import { TermsPageEditorComponent } from './terms-page-editor/terms-page-editor.component';
import { FooterPageEditorComponent } from './footer-page-editor/footer-page-editor.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageEditorComponent },
  { path: 'services', component: ServicesPageEditorComponent },
  { path: 'contact', component: ContactPageEditorComponent },
  { path: 'privacy', component: PrivacyPageEditorComponent },
  { path: 'terms', component: TermsPageEditorComponent },
  { path: 'footer', component: FooterPageEditorComponent },
  { path: ':page', component: FrontPageEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrontPagesRoutingModule {}
