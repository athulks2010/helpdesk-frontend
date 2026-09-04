import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactsRoutingModule } from './contacts-routing.module';
import { ContactsListComponent } from './contacts-list/contacts-list.component';
import { ContactsFormComponent } from './contacts-form/contacts-form.component';

@NgModule({
  declarations: [ContactsListComponent, ContactsFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ContactsRoutingModule],
})
export class ContactsModule {}
