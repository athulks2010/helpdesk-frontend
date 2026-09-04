import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketCreateComponent } from './ticket-create/ticket-create.component';
import { TicketEditComponent } from './ticket-edit/ticket-edit.component';
import { TicketShowComponent } from './ticket-show/ticket-show.component';

@NgModule({
  declarations: [
    TicketListComponent,
    TicketCreateComponent,
    TicketEditComponent,
    TicketShowComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TicketsRoutingModule],
})
export class TicketsModule {}
