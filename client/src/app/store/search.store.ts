import { Injectable, signal } from '@angular/core';
import type { SearchParams, FilterState, FlightResult } from '../types/flight';

export const DEFAULT_FILTER_STATE: FilterState = {
  priceRange: [0, 10000],
  stops: [],
  airlines: [],
  departureTimeSlots: [],
  maxDurationHours: null,
  sortBy: 'price',
  sortOrder: 'asc',
};

@Injectable({ providedIn: 'root' })
export class SearchStore {
  readonly searchParams = signal<SearchParams | null>(null);
  readonly filterState = signal<FilterState>({ ...DEFAULT_FILTER_STATE });
  readonly priceMax = signal<number>(10000);

  // Cache dei risultati — evita di rifare la chiamata API quando si torna dalla pagina dettaglio
  readonly cachedResults = signal<FlightResult[]>([]);
  readonly cachedSearchKey = signal<string>(''); // chiave per invalidare la cache

  setSearchParams(params: SearchParams): void {
    this.searchParams.set(params);
  }

  setResults(results: FlightResult[], searchKey: string): void {
    this.cachedResults.set(results);
    this.cachedSearchKey.set(searchKey);
    if (results.length > 0) {
      const max = Math.ceil(Math.max(...results.map((r) => parseFloat(r.price.grandTotal))));
      this.priceMax.set(max);
      this.syncPriceRange(0, max);
    }
  }

  clearResults(): void {
    this.cachedResults.set([]);
    this.cachedSearchKey.set('');
  }

  swapOriginDestination(): void {
    const current = this.searchParams();
    if (!current) return;
    this.searchParams.set({
      ...current,
      origin: current.destination,
      destination: current.origin,
    });
  }

  setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]): void {
    this.filterState.update((state) => ({ ...state, [key]: value }));
  }

  resetFilters(): void {
    this.filterState.set({ ...DEFAULT_FILTER_STATE, priceRange: [0, this.priceMax()] });
  }

  syncPriceRange(min: number, max: number): void {
    this.filterState.update((state) => ({ ...state, priceRange: [min, max] }));
  }
}
