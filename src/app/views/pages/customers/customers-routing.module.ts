import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { CustomersFormComponent } from './customers-form/customers-form.component';

const routes: Routes = [
  { path: '', component: CustomersListComponent },
  { path: 'create', component: CustomersFormComponent },
  { path: ':id/edit', component: CustomersFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersRoutingModule {}
