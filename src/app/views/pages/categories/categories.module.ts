import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { CategoriesFormComponent } from './categories-form/categories-form.component';

@NgModule({
  declarations: [CategoriesListComponent, CategoriesFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CategoriesRoutingModule],
})
export class CategoriesModule {}
