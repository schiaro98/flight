import { create } from 'zustand';
import type { SearchParams } from '../types/flight';

interface SearchStore {
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams) => void;
  swapOriginDestination: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchParams: null,

  setSearchParams: (params) => set({ searchParams: params }),

  swapOriginDestination: () =>
    set((state) => {
      if (!state.searchParams) return state;
      return {
        searchParams: {
          ...state.searchParams,
          origin: state.searchParams.destination,
          destination: state.searchParams.origin,
        },
      };
    }),
}));
