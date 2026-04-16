import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { FlightResult } from '../../types/flight';
import { parseDurationToMinutes } from '../../utils/filter-utils';
import { getAirlineName } from '../../utils/airline-names';

@Component({
  selector: 'app-flight-result-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
      [class.border-blue-400]="isSelected"
      [class.border-gray-200]="!isSelected"
      (click)="select.emit()"
    >
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <!-- Airline -->
        <div class="flex flex-col min-w-[100px]">
          <span class="text-sm font-bold text-gray-800">{{ airlineName }}</span>
          <span class="text-xs text-gray-400">{{ airlineCode }}</span>
        </div>

        <!-- Departure -->
        <div class="text-center">
          <p class="text-lg font-bold text-gray-900">{{ departureTime }}</p>
          <p class="text-xs text-gray-500">{{ departureIata }}</p>
        </div>

        <!-- Duration + stops -->
        <div class="text-center flex-1 min-w-[80px]">
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

        <!-- Price + detail link -->
        <div class="text-right min-w-[100px]">
          <p class="text-xl font-bold text-blue-600">{{ priceLabel }}</p>
          <a
            [routerLink]="['/flight', result.id]"
            [state]="{ flight: result }"
            (click)="$event.stopPropagation()"
            class="text-xs text-blue-500 hover:underline mt-1 inline-block"
          >
            Dettagli →
          </a>
        </div>
      </div>
    </div>
  `,
})
export class FlightResultCardComponent {
  @Input({ required: true }) result!: FlightResult;
  @Input() isSelected = false;
  @Output() select = new EventEmitter<void>();

  get airlineCode(): string {
    return this.result.validatingAirlineCodes[0] ?? '—';
  }

  get airlineName(): string {
    return getAirlineName(this.airlineCode);
  }

  get firstSeg() { return this.result.itineraries[0]?.segments[0]; }
  get lastSeg() {
    const segs = this.result.itineraries[0]?.segments ?? [];
    return segs[segs.length - 1];
  }

  get departureTime(): string {
    return this.firstSeg
      ? new Date(this.firstSeg.departure.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      : '—';
  }
  get arrivalTime(): string {
    return this.lastSeg
      ? new Date(this.lastSeg.arrival.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      : '—';
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
    return stops === 0 ? 'Diretto' : `${stops} scalo${stops > 1 ? 'i' : ''}`;
  }

  get priceLabel(): string {
    return parseFloat(this.result.price.grandTotal).toLocaleString('it-IT', {
      style: 'currency', currency: this.result.price.currency, maximumFractionDigits: 0,
    });
  }
}
