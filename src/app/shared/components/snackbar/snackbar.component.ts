import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { SnackbarState, SnackbarType } from './snackbar.state';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./snackbar.component.html' ,
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
