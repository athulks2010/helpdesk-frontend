import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';
import { TicketEditComponent } from './ticket-edit/ticket-edit.component';
import { TicketShowComponent } from './ticket-show/ticket-show.component';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'create', component: TicketCreateComponent },
  { path: ':id/edit', component: TicketCreateComponent },
  { path: ':id', component: TicketShowComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule {}
