import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  itemName?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  resolve?: (value: boolean) => void;
}

const DEFAULT_STATE: ConfirmDialogState = {
  isOpen: false,
  options: {
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
  },
};

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private stateSubject = new BehaviorSubject<ConfirmDialogState>(DEFAULT_STATE);
  public state$: Observable<ConfirmDialogState> = this.stateSubject.asObservable();

  confirm(options?: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.stateSubject.next({
        isOpen: true,
        options: {
          title: options?.title || 'Confirm Delete',
          message:
            options?.message ||
            'Are you sure you want to delete this item? This action cannot be undone.',
          confirmText: options?.confirmText || 'Delete',
          cancelText: options?.cancelText || 'Cancel',
          type: options?.type || 'danger',
          itemName: options?.itemName,
        },
        resolve,
      });
    });
  }

  handleConfirm(): void {
    const current = this.stateSubject.value;
    if (current.resolve) {
      current.resolve(true);
    }
    this.close();
  }

  handleCancel(): void {
    const current = this.stateSubject.value;
    if (current.resolve) {
      current.resolve(false);
    }
    this.close();
  }

  private close(): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      isOpen: false,
      resolve: undefined,
    });
  }
}
