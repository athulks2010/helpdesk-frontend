import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontPagesRoutingModule } from './front-pages-routing.module';
import { FrontPageEditorComponent } from './front-page-editor/front-page-editor.component';

@NgModule({
  declarations: [FrontPageEditorComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FrontPagesRoutingModule],
})
export class FrontPagesModule {}
