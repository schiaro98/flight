import { Injectable, signal, computed } from '@angular/core';
import type { SearchParams, FilterState } from '../types/flight';

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
  // Search params
  readonly searchParams = signal<SearchParams | null>(null);

  // Filter state
  readonly filterState = signal<FilterState>({ ...DEFAULT_FILTER_STATE });

  setSearchParams(params: SearchParams): void {
    this.searchParams.set(params);
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
    this.filterState.set({ ...DEFAULT_FILTER_STATE });
  }

  syncPriceRange(min: number, max: number): void {
    this.filterState.update((state) => ({ ...state, priceRange: [min, max] }));
  }
}
