import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiListComponent } from './ai-list/ai-list.component';

const routes: Routes = [
  { path: '', component: AiListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AiRoutingModule {}
