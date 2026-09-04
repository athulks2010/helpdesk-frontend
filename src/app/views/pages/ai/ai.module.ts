import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AiRoutingModule } from './ai-routing.module';
import { AiListComponent } from './ai-list/ai-list.component';

@NgModule({
  declarations: [AiListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AiRoutingModule],
})
export class AiModule {}
