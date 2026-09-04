import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypesRoutingModule } from './types-routing.module';
import { TypesListComponent } from './types-list/types-list.component';
import { TypesFormComponent } from './types-form/types-form.component';

@NgModule({
  declarations: [TypesListComponent, TypesFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TypesRoutingModule],
})
export class TypesModule {}
