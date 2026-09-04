import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';

@NgModule({
  declarations: [NotificationsListComponent],
  imports: [CommonModule, FormsModule, NotificationsRoutingModule]
})
export class NotificationsModule {}
