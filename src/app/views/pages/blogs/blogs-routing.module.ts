import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogsListComponent } from './blogs-list/blogs-list.component';
import { BlogsFormComponent } from './blogs-form/blogs-form.component';

const routes: Routes = [
  { path: '', component: BlogsListComponent },
  { path: 'create', component: BlogsFormComponent },
  { path: ':id/edit', component: BlogsFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogsRoutingModule {}
