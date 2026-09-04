import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicesRoutingModule } from './services-routing.module';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesFormComponent } from './services-form/services-form.component';

@NgModule({
  declarations: [ServicesListComponent, ServicesFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ServicesRoutingModule],
})
export class ServicesModule {}
