import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KnowledgeBaseRoutingModule } from './knowledge-base-routing.module';
import { KnowledgeBaseListComponent } from './knowledge-base-list/knowledge-base-list.component';
import { KnowledgeBaseFormComponent } from './knowledge-base-form/knowledge-base-form.component';

@NgModule({
  declarations: [KnowledgeBaseListComponent, KnowledgeBaseFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, KnowledgeBaseRoutingModule],
})
export class KnowledgeBaseModule {}
