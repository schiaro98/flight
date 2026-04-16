import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import type { FlightResult } from '../types/flight';
import { parseDurationToMinutes } from '../utils/filter-utils';
import { getAirlineName } from '../utils/airline-names';

@Component({
  selector: 'app-flight-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (flight()) {
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-blue-700 px-4 py-4">
          <div class="mx-auto max-w-3xl flex items-center gap-4">
            <button (click)="goBack()"
              class="text-white hover:text-blue-200 transition-colors flex items-center gap-1 text-sm">
              ← Torna ai risultati
            </button>
          </div>
        </header>

        <main class="mx-auto max-w-3xl px-4 py-6 space-y-6">
          <!-- Summary card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Compagnia</p>
                <p class="text-lg font-bold text-gray-900">{{ airlineName }}</p>
                <p class="text-sm text-gray-400">{{ airlineCode }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Prezzo totale</p>
                <p class="text-3xl font-bold text-blue-600">{{ priceLabel }}</p>
                <p class="text-xs text-gray-400">{{ flight()!.price.currency }} · tasse incluse</p>
              </div>
            </div>

            <!-- Price breakdown -->
            <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-xs text-gray-500">Base</p>
                <p class="text-sm font-semibold text-gray-700">{{ formatAmount(flight()!.price.base) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Tasse</p>
                <p class="text-sm font-semibold text-gray-700">{{ taxAmount }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Totale</p>
                <p class="text-sm font-semibold text-blue-600">{{ priceLabel }}</p>
              </div>
            </div>
          </div>

          <!-- Itineraries -->
          @for (itinerary of flight()!.itineraries; track $index) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {{ $index === 0 ? '✈ Andata' : '✈ Ritorno' }}
                </h2>
                <span class="text-xs text-gray-500">Durata totale: {{ formatDuration(itinerary.duration) }}</span>
              </div>

              <div class="divide-y divide-gray-100">
                @for (seg of itinerary.segments; track seg.number; let last = $last; let i = $index) {
                  <div class="px-6 py-4">
                    <!-- Flight number + aircraft -->
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                          {{ seg.carrierCode }}{{ seg.number }}
                        </span>
                        @if (seg.aircraft) {
                          <span class="text-xs text-gray-400">{{ seg.aircraft }}</span>
                        }
                      </div>
                      <span class="text-xs text-gray-500">{{ formatDuration(seg.duration) }}</span>
                    </div>

                    <!-- Route -->
                    <div class="flex items-center gap-4">
                      <!-- Departure -->
                      <div class="text-center min-w-[80px]">
                        <p class="text-2xl font-bold text-gray-900">{{ formatTime(seg.departure.at) }}</p>
                        <p class="text-sm font-semibold text-gray-700">{{ seg.departure.iataCode }}</p>
                        @if (seg.departure.terminal) {
                          <p class="text-xs text-gray-400">Terminal {{ seg.departure.terminal }}</p>
                        }
                        <p class="text-xs text-gray-400">{{ formatDate(seg.departure.at) }}</p>
                      </div>

                      <!-- Arrow -->
                      <div class="flex-1 flex flex-col items-center">
                        <div class="w-full h-px bg-gray-300 relative">
                          <div class="absolute inset-0 flex items-center justify-center">
                            <span class="bg-white px-2 text-xs text-gray-400">→</span>
                          </div>
                        </div>
                        @if (seg.numberOfStops > 0) {
                          <p class="text-xs text-amber-600 mt-1">{{ seg.numberOfStops }} stop tecnico</p>
                        }
                      </div>

                      <!-- Arrival -->
                      <div class="text-center min-w-[80px]">
                        <p class="text-2xl font-bold text-gray-900">{{ formatTime(seg.arrival.at) }}</p>
                        <p class="text-sm font-semibold text-gray-700">{{ seg.arrival.iataCode }}</p>
                        @if (seg.arrival.terminal) {
                          <p class="text-xs text-gray-400">Terminal {{ seg.arrival.terminal }}</p>
                        }
                        <p class="text-xs text-gray-400">{{ formatDate(seg.arrival.at) }}</p>
                      </div>
                    </div>

                    <!-- Baggage -->
                    <div class="mt-3 flex gap-4 text-xs text-gray-500">
                      @if (seg.baggage?.includedCheckedBags) {
                        <span class="flex items-center gap-1">
                          🧳 {{ seg.baggage!.includedCheckedBags!.quantity }} bagaglio in stiva incluso
                        </span>
                      } @else {
                        <span class="flex items-center gap-1 text-amber-600">
                          🧳 Bagaglio in stiva non incluso
                        </span>
                      }
                      @if (seg.baggage?.includedCabinBags) {
                        <span class="flex items-center gap-1">
                          👜 {{ seg.baggage!.includedCabinBags!.quantity }} bagaglio a mano incluso
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Layover info between segments -->
                  @if (!last) {
                    @let nextSeg = itinerary.segments[i + 1];
                    @if (nextSeg) {
                      <div class="px-6 py-2 bg-amber-50 border-y border-amber-100 text-xs text-amber-700 text-center">
                        Scalo a {{ seg.arrival.iataCode }} · {{ layoverDuration(seg.arrival.at, nextSeg.departure.at) }}
                      </div>
                    }
                  }
                }
              </div>
            </div>
          }

          <!-- Book button -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p class="text-sm text-gray-500 mb-4">
              Prenotazione gestita direttamente dalla compagnia aerea o tramite Duffel.
            </p>
            <button
              class="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              (click)="bookFlight()">
              Prenota per {{ priceLabel }}
            </button>
          </div>
        </main>
      </div>
    } @else {
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-gray-500 mb-4">Volo non trovato.</p>
          <button (click)="goBack()" class="text-blue-600 hover:underline">← Torna ai risultati</button>
        </div>
      </div>
    }
  `,
})
export class FlightDetailPageComponent implements OnInit {
  flight = signal<FlightResult | null>(null);

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { flight?: FlightResult } | undefined;
    if (state?.flight) {
      this.flight.set(state.flight);
    } else {
      // Fallback: try history state (after page refresh this won't work — would need a store/cache)
      const histState = history.state as { flight?: FlightResult };
      if (histState?.flight) {
        this.flight.set(histState.flight);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/results']);
  }

  bookFlight(): void {
    // Placeholder — in produzione si integra con Duffel Orders API
    alert('Funzionalità di prenotazione in arrivo!');
  }

  get airlineCode(): string {
    return this.flight()?.validatingAirlineCodes[0] ?? '—';
  }

  get airlineName(): string {
    return getAirlineName(this.airlineCode);
  }

  get priceLabel(): string {
    const f = this.flight();
    if (!f) return '—';
    return parseFloat(f.price.grandTotal).toLocaleString('it-IT', {
      style: 'currency', currency: f.price.currency, maximumFractionDigits: 0,
    });
  }

  get taxAmount(): string {
    const f = this.flight();
    if (!f) return '—';
    const tax = parseFloat(f.price.grandTotal) - parseFloat(f.price.base);
    return tax.toLocaleString('it-IT', { style: 'currency', currency: f.price.currency, maximumFractionDigits: 0 });
  }

  formatAmount(amount: string): string {
    const f = this.flight();
    return parseFloat(amount).toLocaleString('it-IT', {
      style: 'currency', currency: f?.price.currency ?? 'EUR', maximumFractionDigits: 0,
    });
  }

  formatTime(at: string): string {
    return new Date(at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(at: string): string {
    return new Date(at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  }

  formatDuration(d: string): string {
    const mins = parseDurationToMinutes(d);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  layoverDuration(arrivalAt: string, nextDepartureAt: string): string {
    const mins = (new Date(nextDepartureAt).getTime() - new Date(arrivalAt).getTime()) / 60000;
    return `${Math.floor(mins / 60)}h ${mins % 60}m di attesa`;
  }
}
