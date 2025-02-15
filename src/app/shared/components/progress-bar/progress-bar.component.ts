import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
})
export class ProgressBarComponent {
  value = model.required<number>();
  label = model.required<string>();

  get barColorClass(): string {
    return this.value() >= 100
      ? 'bg-red-500'
      : this.value() >= 80
      ? 'bg-yellow-500'
      : 'bg-green-500';
  }

  get textColorClass(): string {
    return this.value() >= 100
      ? 'text-red-600'
      : this.value() >= 80
      ? 'text-yellow-600'
      : 'text-green-600';
  }
}
