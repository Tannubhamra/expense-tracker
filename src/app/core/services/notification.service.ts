import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
} from '@angular/core';
import { SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { SnackbarType } from '../../shared/components/snackbar/snackbar.state';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private currentSnackbar?: ComponentRef<SnackbarComponent>;

  constructor(private appRef: ApplicationRef) {}

  private show(message: string, type: SnackbarType, duration: number): void {
    if (!this.currentSnackbar) {
      
      const snackbarComponent = createComponent(SnackbarComponent, {
        environmentInjector: this.appRef.injector,
      });

      // Attach to DOM
      document.body.appendChild(snackbarComponent.location.nativeElement);
      this.appRef.attachView(snackbarComponent.hostView);

      this.currentSnackbar = snackbarComponent;
    }

    this.currentSnackbar.instance.show(message, type, duration);

    // Clean up when hidden
    setTimeout(() => {
      if (!this.currentSnackbar?.instance.state().show) {
        this.currentSnackbar?.destroy();
        this.currentSnackbar = undefined;
      }
    }, duration + 300);
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string) {
    this.show(message, 'warning', 5000);
  }
}
