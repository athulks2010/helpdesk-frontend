import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlogsRoutingModule } from './blogs-routing.module';
import { BlogsListComponent } from './blogs-list/blogs-list.component';
import { BlogsFormComponent } from './blogs-form/blogs-form.component';

@NgModule({
  declarations: [BlogsListComponent, BlogsFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BlogsRoutingModule],
})
export class BlogsModule {}
