import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { HdIconComponent } from './hd-icon/hd-icon.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [BaseComponent, HdIconComponent, ConfirmDialogComponent],
  imports: [CommonModule, RouterModule],
  exports: [BaseComponent, HdIconComponent, ConfirmDialogComponent],
})
export class ThemeModule {}
