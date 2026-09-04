import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolesRoutingModule } from './roles-routing.module';
import { RolesListComponent } from './roles-list/roles-list.component';
import { RolesFormComponent } from './roles-form/roles-form.component';

@NgModule({
  declarations: [RolesListComponent, RolesFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RolesRoutingModule],
})
export class RolesModule {}
