import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { HdIconComponent } from './hd-icon/hd-icon.component';

@NgModule({
  declarations: [BaseComponent, HdIconComponent],
  imports: [CommonModule, RouterModule],
  exports: [BaseComponent, HdIconComponent],
})
export class ThemeModule {}
