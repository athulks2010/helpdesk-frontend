import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentsListComponent } from './departments-list/departments-list.component';
import { DepartmentsFormComponent } from './departments-form/departments-form.component';

const routes: Routes = [
  { path: '', component: DepartmentsListComponent },
  { path: 'create', component: DepartmentsFormComponent },
  { path: ':id/edit', component: DepartmentsFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepartmentsRoutingModule {}
