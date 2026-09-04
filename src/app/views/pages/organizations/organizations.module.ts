import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { OrganizationsFormComponent } from './organizations-form/organizations-form.component';

@NgModule({
  declarations: [OrganizationsListComponent, OrganizationsFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OrganizationsRoutingModule],
})
export class OrganizationsModule {}
