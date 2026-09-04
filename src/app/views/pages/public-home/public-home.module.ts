import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicHomeRoutingModule } from './public-home-routing.module';
import { PublicHomeComponent } from './public-home.component';

@NgModule({
  declarations: [PublicHomeComponent],
  imports: [CommonModule, PublicHomeRoutingModule],
})
export class PublicHomeModule {}
