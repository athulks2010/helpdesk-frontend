import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendingUsersRoutingModule } from './pending-users-routing.module';
import { PendingUsersListComponent } from './pending-users-list/pending-users-list.component';

@NgModule({
  declarations: [PendingUsersListComponent],
  imports: [CommonModule, FormsModule, PendingUsersRoutingModule],
})
export class PendingUsersModule {}
