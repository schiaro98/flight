import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FlightResult } from '../../types/flight';
import { LoadingSpinnerComponent } from '../common/loading-spinner.component';
import { ErrorMessageComponent } from '../common/error-message.component';
import { FlightResultCardComponent } from './flight-result-card.component';
import { FlightDetailComponent } from './flight-detail.component';

@Component({
  selector: 'app-flight-result-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent, FlightResultCardComponent, FlightDetailComponent],
  template: `
    @if (isLoading) {
      <app-loading-spinner size="lg" />
    } @else if (error) {
      <app-error-message title="Search failed" [message]="error" />
    } @else if (results.length === 0) {
      <div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p class="text-lg font-semibold text-gray-700">No flights found</p>
        <p class="mt-2 text-sm text-gray-500">Try adjusting your search — different dates or nearby airports might reveal more options.</p>
      </div>
    } @else {
      <div class="space-y-3">
        @for (result of results; track result.id) {
          <div>
            <app-flight-result-card
              [result]="result"
              [isSelected]="selectedId() === result.id"
              (select)="toggleDetail(result.id)"
            />
            @if (selectedId() === result.id) {
              <app-flight-detail [result]="result" />
            }
          </div>
        }
      </div>
    }
  `,
})
export class FlightResultListComponent {
  @Input() results: FlightResult[] = [];
  @Input() isLoading = false;
  @Input() error = '';

  selectedId = signal<string | null>(null);

  toggleDetail(id: string): void {
    this.selectedId.update((prev) => prev === id ? null : id);
  }
}
