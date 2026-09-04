import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrioritiesListComponent } from './priorities-list/priorities-list.component';
import { PrioritiesFormComponent } from './priorities-form/priorities-form.component';

const routes: Routes = [
  { path: '', component: PrioritiesListComponent },
  { path: 'create', component: PrioritiesFormComponent },
  { path: ':id/edit', component: PrioritiesFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrioritiesRoutingModule {}
