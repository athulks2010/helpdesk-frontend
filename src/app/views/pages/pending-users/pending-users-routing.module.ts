import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingUsersListComponent } from './pending-users-list/pending-users-list.component';

const routes: Routes = [
  { path: '', component: PendingUsersListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingUsersRoutingModule {}
