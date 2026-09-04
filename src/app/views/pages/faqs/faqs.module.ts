import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FaqsRoutingModule } from './faqs-routing.module';
import { FaqsListComponent } from './faqs-list/faqs-list.component';
import { FaqsFormComponent } from './faqs-form/faqs-form.component';

@NgModule({
  declarations: [FaqsListComponent, FaqsFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FaqsRoutingModule],
})
export class FaqsModule {}
