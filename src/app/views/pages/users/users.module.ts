import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersFormComponent } from './users-form/users-form.component';

@NgModule({
  declarations: [UsersListComponent, UsersFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UsersRoutingModule],
})
export class UsersModule {}
