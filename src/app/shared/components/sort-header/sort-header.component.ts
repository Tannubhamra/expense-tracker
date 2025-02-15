import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortDirection } from '../../../dashboard/interfaces/sort.interface';

@Component({
  selector: 'app-sort-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2" (click)="handleSort()">
      <span><ng-content></ng-content></span>
      <span class="inline-flex flex-none items-center">
        <!-- Ascending arrow -->
        <svg
          [class.text-gray-900]="direction() === 'asc'"
          [class.text-gray-400]="direction() !== 'asc'"
          class="h-4 w-4"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"
          />
        </svg>
        <!-- Descending arrow -->
        <svg
          [class.text-gray-900]="direction() === 'desc'"
          [class.text-gray-400]="direction() !== 'desc'"
          class="h-4 w-4"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"
          />
        </svg>
      </span>
    </div>
  `,
  host: {
    class: 'cursor-pointer hover:bg-gray-50 group',
  },
})
export class SortHeaderComponent {
  direction = model.required<SortDirection | 'none'>();
  handleSort = () => this.direction.update((current) => current);
}
