import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontPageEditorComponent } from './front-page-editor/front-page-editor.component';
import { HomePageEditorComponent } from './home-page-editor/home-page-editor.component';
import { ServicesPageEditorComponent } from './services-page-editor/services-page-editor.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageEditorComponent },
  { path: 'services', component: ServicesPageEditorComponent },
  { path: ':page', component: FrontPageEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrontPagesRoutingModule {}
