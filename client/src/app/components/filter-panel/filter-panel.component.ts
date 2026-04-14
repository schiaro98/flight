import { Component, Input, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { FlightResult } from '../../types/flight';
import { SearchStore } from '../../store/search.store';
import { parseDurationToMinutes } from '../../utils/filter-utils';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-6">
      <!-- Sort -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ordina per</label>
        <select [ngModel]="sortValue()" (ngModelChange)="onSortChange($event)"
          class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          @for (opt of sortOptions; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
      </div>
      <hr class="border-gray-100" />

      <!-- Price -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prezzo</h3>
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>{{ formatPrice(filterState().priceRange[0]) }}</span>
          <span>{{ formatPrice(filterState().priceRange[1]) }}</span>
        </div>
        <input type="range" [min]="priceMin()" [max]="priceMax()"
          [ngModel]="filterState().priceRange[1]"
          (ngModelChange)="store.setFilter('priceRange', [filterState().priceRange[0], $event])"
          class="w-full accent-blue-600" />
      </div>
      <hr class="border-gray-100" />

      <!-- Stops -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Scali</h3>
        @for (opt of stopOptions; track opt.value) {
          <label class="flex items-center gap-2 mb-1 cursor-pointer">
            <input type="checkbox"
              [checked]="filterState().stops.includes(opt.value)"
              (change)="toggleStop(opt.value)"
              class="accent-blue-600" />
            <span class="text-sm text-gray-700">{{ opt.label }}</span>
          </label>
        }
      </div>
      <hr class="border-gray-100" />

      <!-- Airlines -->
      @if (availableAirlines().length > 0) {
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Compagnie aeree</h3>
          @for (airline of availableAirlines(); track airline) {
            <label class="flex items-center gap-2 mb-1 cursor-pointer">
              <input type="checkbox"
                [checked]="filterState().airlines.includes(airline)"
                (change)="toggleAirline(airline)"
                class="accent-blue-600" />
              <span class="text-sm text-gray-700">{{ airline }}</span>
            </label>
          }
        </div>
        <hr class="border-gray-100" />
      }

      <!-- Departure time -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Orario di partenza</h3>
        @for (slot of timeSlots; track slot.value) {
          <label class="flex items-center gap-2 mb-1 cursor-pointer">
            <input type="checkbox"
              [checked]="filterState().departureTimeSlots.includes(slot.value)"
              (change)="toggleTimeSlot(slot.value)"
              class="accent-blue-600" />
            <span class="text-sm text-gray-700">{{ slot.label }}</span>
          </label>
        }
      </div>
      <hr class="border-gray-100" />

      <!-- Duration -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Durata massima: {{ filterState().maxDurationHours ?? maxDuration() }}h
        </h3>
        <input type="range" [min]="1" [max]="maxDuration()"
          [ngModel]="filterState().maxDurationHours ?? maxDuration()"
          (ngModelChange)="store.setFilter('maxDurationHours', $event)"
          class="w-full accent-blue-600" />
      </div>
      <hr class="border-gray-100" />

      <button type="button" (click)="store.resetFilters()"
        class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        Reimposta filtri
      </button>
    </aside>
  `,
})
export class FilterPanelComponent {
  @Input() set results(val: FlightResult[]) { this._results = val; this.syncPriceRange(); }
  private _results: FlightResult[] = [];

  store = inject(SearchStore);
  filterState = this.store.filterState;

  sortOptions = [
    { value: 'price:asc', label: 'Prezzo (crescente)' },
    { value: 'price:desc', label: 'Prezzo (decrescente)' },
    { value: 'duration:asc', label: 'Durata (crescente)' },
    { value: 'duration:desc', label: 'Durata (decrescente)' },
    { value: 'departure:asc', label: 'Partenza (prima)' },
    { value: 'departure:desc', label: 'Partenza (dopo)' },
    { value: 'arrival:asc', label: 'Arrivo (prima)' },
    { value: 'arrival:desc', label: 'Arrivo (dopo)' },
  ];

  stopOptions = [
    { value: 'direct' as const, label: 'Diretto' },
    { value: '1-stop' as const, label: '1 scalo' },
    { value: '2+' as const, label: '2+ scali' },
  ];

  timeSlots = [
    { value: 'morning' as const, label: 'Mattina (06–12)' },
    { value: 'afternoon' as const, label: 'Pomeriggio (12–18)' },
    { value: 'evening' as const, label: 'Sera (18–24)' },
    { value: 'night' as const, label: 'Notte (00–06)' },
  ];

  priceMin = computed(() => {
    if (!this._results.length) return 0;
    return Math.floor(Math.min(...this._results.map((r) => parseFloat(r.price.grandTotal))));
  });

  priceMax = computed(() => {
    if (!this._results.length) return 10000;
    return Math.ceil(Math.max(...this._results.map((r) => parseFloat(r.price.grandTotal))));
  });

  maxDuration = computed(() => {
    if (!this._results.length) return 24;
    const durations = this._results.map((r) => {
      const d = r.itineraries[0]?.duration ?? 'PT0M';
      return parseDurationToMinutes(d) / 60;
    });
    return Math.ceil(Math.max(...durations, 1));
  });

  availableAirlines = computed(() => {
    const codes = new Set<string>();
    this._results.forEach((r) => r.validatingAirlineCodes.forEach((c) => codes.add(c)));
    return Array.from(codes).sort();
  });

  sortValue = computed(() => `${this.filterState().sortBy}:${this.filterState().sortOrder}`);

  private syncPriceRange(): void {
    if (this._results.length > 0) {
      this.store.syncPriceRange(this.priceMin(), this.priceMax());
    }
  }

  onSortChange(value: string): void {
    const [sortBy, sortOrder] = value.split(':') as ['price' | 'duration' | 'departure' | 'arrival', 'asc' | 'desc'];
    this.store.setFilter('sortBy', sortBy);
    this.store.setFilter('sortOrder', sortOrder);
  }

  toggleStop(value: 'direct' | '1-stop' | '2+'): void {
    const current = this.filterState().stops;
    const updated = current.includes(value) ? current.filter((s) => s !== value) : [...current, value];
    this.store.setFilter('stops', updated);
  }

  toggleAirline(code: string): void {
    const current = this.filterState().airlines;
    const updated = current.includes(code) ? current.filter((a) => a !== code) : [...current, code];
    this.store.setFilter('airlines', updated);
  }

  toggleTimeSlot(slot: 'morning' | 'afternoon' | 'evening' | 'night'): void {
    const current = this.filterState().departureTimeSlots;
    const updated = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot];
    this.store.setFilter('departureTimeSlots', updated);
  }

  formatPrice(val: number): string {
    return val.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }
}
