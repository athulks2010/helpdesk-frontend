import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactsListComponent } from './contacts-list/contacts-list.component';
import { ContactsFormComponent } from './contacts-form/contacts-form.component';

const routes: Routes = [
  { path: '', component: ContactsListComponent },
  { path: 'create', component: ContactsFormComponent },
  { path: ':id/edit', component: ContactsFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsRoutingModule {}
