import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FlightResult } from '../../types/flight';
import { parseDurationToMinutes } from '../../utils/filter-utils';

@Component({
  selector: 'app-flight-result-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
      [class.border-blue-400]="isSelected"
      [class.border-gray-200]="!isSelected"
      (click)="select.emit()"
    >
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <!-- Airline -->
        <div class="flex items-center gap-2 min-w-[80px]">
          <span class="text-sm font-bold text-gray-800">{{ airline }}</span>
        </div>

        <!-- Departure -->
        <div class="text-center">
          <p class="text-lg font-bold text-gray-900">{{ departureTime }}</p>
          <p class="text-xs text-gray-500">{{ departureIata }}</p>
        </div>

        <!-- Duration + stops -->
        <div class="text-center flex-1">
          <p class="text-xs text-gray-500">{{ durationLabel }}</p>
          <div class="relative my-1 h-px bg-gray-300">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="bg-white px-1 text-xs text-gray-400">{{ stopsLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Arrival -->
        <div class="text-center">
          <p class="text-lg font-bold text-gray-900">{{ arrivalTime }}</p>
          <p class="text-xs text-gray-500">{{ arrivalIata }}</p>
        </div>

        <!-- Price -->
        <div class="text-right min-w-[80px]">
          <p class="text-xl font-bold text-blue-600">{{ priceLabel }}</p>
          <p class="text-xs text-gray-400">{{ result.price.currency }}</p>
        </div>
      </div>
    </div>
  `,
})
export class FlightResultCardComponent {
  @Input({ required: true }) result!: FlightResult;
  @Input() isSelected = false;
  @Output() select = new EventEmitter<void>();

  get airline(): string {
    return this.result.validatingAirlineCodes[0] ?? '—';
  }

  get firstSeg() { return this.result.itineraries[0]?.segments[0]; }
  get lastSeg() {
    const segs = this.result.itineraries[0]?.segments ?? [];
    return segs[segs.length - 1];
  }

  get departureTime(): string {
    return this.firstSeg ? new Date(this.firstSeg.departure.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '—';
  }
  get arrivalTime(): string {
    return this.lastSeg ? new Date(this.lastSeg.arrival.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '—';
  }
  get departureIata(): string { return this.firstSeg?.departure.iataCode ?? '—'; }
  get arrivalIata(): string { return this.lastSeg?.arrival.iataCode ?? '—'; }

  get durationLabel(): string {
    const d = this.result.itineraries[0]?.duration ?? 'PT0M';
    const mins = parseDurationToMinutes(d);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  get stopsLabel(): string {
    const segs = this.result.itineraries[0]?.segments ?? [];
    const stops = segs.length - 1;
    return stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`;
  }

  get priceLabel(): string {
    return parseFloat(this.result.price.grandTotal).toLocaleString('it-IT', {
      style: 'currency', currency: this.result.price.currency, maximumFractionDigits: 0,
    });
  }
}
