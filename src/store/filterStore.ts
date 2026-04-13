import { create } from 'zustand';
import type { FilterState } from '../types/flight';

export const DEFAULT_FILTER_STATE: FilterState = {
  priceRange: [0, 10000],
  stops: [],
  airlines: [],
  departureTimeSlots: [],
  maxDurationHours: null,
  sortBy: 'price',
  sortOrder: 'asc',
};

interface FilterStore {
  filterState: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filterState: { ...DEFAULT_FILTER_STATE },

  setFilter: (key, value) =>
    set((state) => ({
      filterState: { ...state.filterState, [key]: value },
    })),

  resetFilters: () => set({ filterState: { ...DEFAULT_FILTER_STATE } }),
}));
