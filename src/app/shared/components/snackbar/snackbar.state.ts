export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarState {
  message: string;
  type: SnackbarType;
  duration: number;
  show: boolean;
}
