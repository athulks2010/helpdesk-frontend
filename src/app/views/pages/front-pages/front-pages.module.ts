import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontPagesRoutingModule } from './front-pages-routing.module';
import { FrontPageEditorComponent } from './front-page-editor/front-page-editor.component';
import { HomePageEditorComponent } from './home-page-editor/home-page-editor.component';

@NgModule({
  declarations: [FrontPageEditorComponent, HomePageEditorComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FrontPagesRoutingModule],
})
export class FrontPagesModule {}
