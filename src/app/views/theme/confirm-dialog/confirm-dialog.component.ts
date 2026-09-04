import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogService, ConfirmDialogState } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  state: ConfirmDialogState = {
    isOpen: false,
    options: {},
  };
  private sub?: Subscription;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.sub = this.confirmService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onConfirm(): void {
    this.confirmService.handleConfirm();
  }

  onCancel(): void {
    this.confirmService.handleCancel();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.onCancel();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.onConfirm();
    }
  }
}
