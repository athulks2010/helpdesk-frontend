import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { CustomersFormComponent } from './customers-form/customers-form.component';

@NgModule({
  declarations: [CustomersListComponent, CustomersFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomersRoutingModule],
})
export class CustomersModule {}
