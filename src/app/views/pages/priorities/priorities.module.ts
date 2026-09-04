import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrioritiesRoutingModule } from './priorities-routing.module';
import { PrioritiesListComponent } from './priorities-list/priorities-list.component';
import { PrioritiesFormComponent } from './priorities-form/priorities-form.component';

@NgModule({
  declarations: [PrioritiesListComponent, PrioritiesFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PrioritiesRoutingModule],
})
export class PrioritiesModule {}
