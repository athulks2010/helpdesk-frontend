import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TypesListComponent } from './types-list/types-list.component';
import { TypesFormComponent } from './types-form/types-form.component';

const routes: Routes = [
  { path: '', component: TypesListComponent },
  { path: 'create', component: TypesFormComponent },
  { path: ':id/edit', component: TypesFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypesRoutingModule {}
