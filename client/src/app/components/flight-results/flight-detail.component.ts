import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FlightResult } from '../../types/flight';
import { parseDurationToMinutes } from '../../utils/filter-utils';

@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 border border-t-0 border-gray-200 rounded-b-xl px-4 py-4 space-y-4">
      @for (itinerary of result.itineraries; track $index) {
        <div>
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {{ $index === 0 ? 'Outbound' : 'Return' }}
          </h4>
          @for (seg of itinerary.segments; track seg.number; let i = $index) {
            <div class="flex gap-4 py-2 border-b border-gray-100 last:border-0">
              <div class="w-16 text-center">
                <p class="text-sm font-bold text-gray-800">{{ seg.carrierCode }}{{ seg.number }}</p>
                <p class="text-xs text-gray-400">{{ seg.aircraft }}</p>
              </div>
              <div class="flex-1">
                <div class="flex justify-between text-sm">
                  <span class="font-medium">{{ formatTime(seg.departure.at) }} {{ seg.departure.iataCode }}</span>
                  <span class="text-gray-400">{{ formatDuration(seg.duration) }}</span>
                  <span class="font-medium">{{ formatTime(seg.arrival.at) }} {{ seg.arrival.iataCode }}</span>
                </div>
                @if (seg.baggage?.includedCheckedBags) {
                  <p class="text-xs text-gray-500 mt-1">
                    ✓ {{ seg.baggage!.includedCheckedBags!.quantity }} checked bag(s) included
                  </p>
                }
              </div>
            </div>
            @if (i < itinerary.segments.length - 1) {
              @let layover = getLayover(seg.arrival.at, itinerary.segments[i + 1].departure.at);
              <div class="flex items-center gap-2 py-1 px-2 my-1 bg-amber-50 rounded text-xs text-amber-700">
                <span>⏱</span>
                <span>Layover at {{ seg.arrival.iataCode }} · {{ layover }}</span>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class FlightDetailComponent {
  @Input({ required: true }) result!: FlightResult;

  formatTime(at: string): string {
    return new Date(at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(d: string): string {
    const mins = parseDurationToMinutes(d);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  getLayover(arrivalAt: string, nextDepartureAt: string): string {
    const mins = Math.round((new Date(nextDepartureAt).getTime() - new Date(arrivalAt).getTime()) / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }
}
