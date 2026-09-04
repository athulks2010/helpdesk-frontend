import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { OrganizationsFormComponent } from './organizations-form/organizations-form.component';

const routes: Routes = [
  { path: '', component: OrganizationsListComponent },
  { path: 'create', component: OrganizationsFormComponent },
  { path: ':id/edit', component: OrganizationsFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
