import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 class="text-sm font-semibold text-red-800">{{ title }}</h3>
      <p class="mt-1 text-sm text-red-700">{{ message }}</p>
    </div>
  `,
})
export class ErrorMessageComponent {
  @Input() title = 'Error';
  @Input() message = '';
}
