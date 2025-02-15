import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { SnackbarState, SnackbarType } from './snackbar.state';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="state().show"
      [@slideInOut]
      class="fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white flex items-center justify-between min-w-[300px]"
      [ngClass]="typeClass()"
    >
      <span>{{ state().message }}</span>
      <button
        (click)="hide()"
        class="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  `,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class SnackbarComponent {
  state = signal<SnackbarState>({
    message: '',
    type: 'info',
    duration: 3000,
    show: false,
  });

  typeClass = computed(() => {
    switch (this.state().type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  });

  constructor() {
    // Handle auto-dismiss
    effect(() => {
      if (this.state().show && this.state().duration > 0) {
        setTimeout(() => {
          this.hide();
        }, this.state().duration);
      }
    });
  }

  show(message: string, type: SnackbarType, duration: number) {
    this.state.set({
      message,
      type,
      duration,
      show: true,
    });
  }

  hide() {
    this.state.update((state) => ({
      ...state,
      show: false,
    }));
  }
}
