import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesFormComponent } from './services-form/services-form.component';

const routes: Routes = [
  { path: '', component: ServicesListComponent },
  { path: 'create', component: ServicesFormComponent },
  { path: ':id/edit', component: ServicesFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesRoutingModule {}
