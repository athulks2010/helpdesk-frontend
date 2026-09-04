import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusesRoutingModule } from './statuses-routing.module';
import { StatusesListComponent } from './statuses-list/statuses-list.component';
import { StatusesFormComponent } from './statuses-form/statuses-form.component';

@NgModule({
  declarations: [StatusesListComponent, StatusesFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusesRoutingModule],
})
export class StatusesModule {}
