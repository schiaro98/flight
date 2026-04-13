// Feature: flight-search-app, Property 16: Scambio origine/destinazione è corretto

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useSearchStore } from '../searchStore';

/**
 * Validates: Requirements 5.5
 *
 * Property 16: For any pair (origin, destination), after executing the swap,
 * the value of origin must equal the original destination and vice versa.
 */

// Arbitrary for IATA-like strings (3 uppercase letters)
const iataArb = fc.stringMatching(/^[A-Z]{3}$/);

// Helper to reset store state between runs
function resetStore() {
  useSearchStore.setState({ searchParams: null });
}

// Base SearchParams fields (non-origin/destination)
const baseParams = {
  departureDate: '2025-06-01',
  tripType: 'one-way' as const,
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'ECONOMY' as const,
};

describe('Property 16: Scambio origine/destinazione è corretto', () => {
  beforeEach(() => {
    resetStore();
  });

  it('after swap, origin equals old destination and destination equals old origin', () => {
    fc.assert(
      fc.property(iataArb, iataArb, (origin, destination) => {
        // Skip when origin === destination (swap is trivially correct but uninteresting)
        fc.pre(origin !== destination);

        const store = useSearchStore.getState();

        // Set initial state
        store.setSearchParams({ ...baseParams, origin, destination });

        // Perform swap
        useSearchStore.getState().swapOriginDestination();

        const after = useSearchStore.getState().searchParams!;

        // Reset for next run
        resetStore();

        return after.origin === destination && after.destination === origin;
      }),
      { numRuns: 200, verbose: true }
    );
  });

  it('calling swap twice returns to the original state', () => {
    fc.assert(
      fc.property(iataArb, iataArb, (origin, destination) => {
        fc.pre(origin !== destination);

        const store = useSearchStore.getState();

        // Set initial state
        store.setSearchParams({ ...baseParams, origin, destination });

        // Swap once, then swap again
        useSearchStore.getState().swapOriginDestination();
        useSearchStore.getState().swapOriginDestination();

        const after = useSearchStore.getState().searchParams!;

        // Reset for next run
        resetStore();

        return after.origin === origin && after.destination === destination;
      }),
      { numRuns: 200, verbose: true }
    );
  });
});
