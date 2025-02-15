import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative pt-1">
      <div class="flex mb-2 items-center justify-between">
        <div>
          <span [class]="textColorClass">{{ label() }}</span>
        </div>
        <div class="text-right">
          <span [class]="textColorClass">{{ value().toFixed(1) }}%</span>
        </div>
      </div>
      <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
        <div
          [style.width.%]="value()"
          [class]="barColorClass"
          class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
        ></div>
      </div>
    </div>
  `,
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
