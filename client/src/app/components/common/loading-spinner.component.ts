import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center" [class]="containerClass">
      <div
        class="animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
        [class]="spinnerClass"
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get spinnerClass(): string {
    return { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[this.size];
  }

  get containerClass(): string {
    return { sm: 'py-2', md: 'py-4', lg: 'py-8' }[this.size];
  }
}
