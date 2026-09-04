import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesListComponent } from './notes-list/notes-list.component';

@NgModule({
  declarations: [NotesListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NotesRoutingModule],
})
export class NotesModule {}
