import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DepartmentsRoutingModule } from './departments-routing.module';
import { DepartmentsListComponent } from './departments-list/departments-list.component';
import { DepartmentsFormComponent } from './departments-form/departments-form.component';

@NgModule({
  declarations: [DepartmentsListComponent, DepartmentsFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DepartmentsRoutingModule],
})
export class DepartmentsModule {}
