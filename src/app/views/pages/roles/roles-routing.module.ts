import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesListComponent } from './roles-list/roles-list.component';
import { RolesFormComponent } from './roles-form/roles-form.component';

const routes: Routes = [
  { path: '', component: RolesListComponent },
  { path: 'create', component: RolesFormComponent },
  { path: ':id/edit', component: RolesFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule {}
