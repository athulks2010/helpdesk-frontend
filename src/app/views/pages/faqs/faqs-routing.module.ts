import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqsListComponent } from './faqs-list/faqs-list.component';
import { FaqsFormComponent } from './faqs-form/faqs-form.component';

const routes: Routes = [
  { path: '', component: FaqsListComponent },
  { path: 'create', component: FaqsFormComponent },
  { path: ':id/edit', component: FaqsFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqsRoutingModule {}
