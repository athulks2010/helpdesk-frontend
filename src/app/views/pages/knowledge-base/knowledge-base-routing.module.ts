import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KnowledgeBaseListComponent } from './knowledge-base-list/knowledge-base-list.component';
import { KnowledgeBaseFormComponent } from './knowledge-base-form/knowledge-base-form.component';

const routes: Routes = [
  { path: '', component: KnowledgeBaseListComponent },
  { path: 'create', component: KnowledgeBaseFormComponent },
  { path: ':id/edit', component: KnowledgeBaseFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KnowledgeBaseRoutingModule {}
