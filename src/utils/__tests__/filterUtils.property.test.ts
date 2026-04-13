// Feature: flight-search-app, Property 5: Filtraggio per prezzo è corretto
// Feature: flight-search-app, Property 6: Filtraggio per scali è corretto
// Feature: flight-search-app, Property 7: Filtraggio per compagnia è corretto
// Feature: flight-search-app, Property 8: Filtraggio per fascia oraria è corretto
// Feature: flight-search-app, Property 9: Filtraggio per durata massima è corretto
// Feature: flight-search-app, Property 10: Ordinamento è corretto e preserva gli elementi
// Feature: flight-search-app, Property 11: Reset filtri ripristina la lista originale

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  filterByPrice,
  filterByStops,
  filterByAirline,
  filterByDepartureTime,
  filterByDuration,
  sortResults,
  parseDurationToMinutes,
} from '../filterUtils';
import type { FlightResult } from '../../types/flight';

// ---------------------------------------------------------------------------
// Shared arbitrary: flightResultArb
// ---------------------------------------------------------------------------

const airlineCodeArb = fc.stringMatching(/^[A-Z]{2}$/);

const isoDateTimeArb = fc
  .tuple(
    fc.integer({ min: 2025, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 }),
  )
  .map(([year, month, day, hour, minute]) => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const min = String(minute).padStart(2, '0');
    return `${year}-${mm}-${dd}T${hh}:${min}:00.000Z`;
  });

const segmentArb = fc.record({
  departure: fc.record({
    iataCode: fc.stringMatching(/^[A-Z]{3}$/),
    at: isoDateTimeArb,
  }),
  arrival: fc.record({
    iataCode: fc.stringMatching(/^[A-Z]{3}$/),
    at: isoDateTimeArb,
  }),
  carrierCode: airlineCodeArb,
  number: fc.stringMatching(/^[0-9]{1,4}$/),
  aircraft: fc.constant('320'),
  duration: fc.constantFrom('PT1H', 'PT2H30M', 'PT5H', 'PT10H', 'PT15H'),
  numberOfStops: fc.integer({ min: 0, max: 2 }),
});

const itineraryArb = fc.record({
  duration: fc.constantFrom('PT1H', 'PT2H30M', 'PT5H', 'PT10H', 'PT15H', 'PT20H'),
  segments: fc.array(segmentArb, { minLength: 1, maxLength: 3 }),
});

const priceStringArb = fc
  .integer({ min: 50, max: 2000 })
  .map((n) => n.toFixed(2));

const flightResultArb: fc.Arbitrary<FlightResult> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  itineraries: fc.array(itineraryArb, { minLength: 1, maxLength: 2 }),
  price: fc.record({
    currency: fc.constant('EUR'),
    total: priceStringArb,
    base: priceStringArb,
    fees: fc.constant([]),
    grandTotal: priceStringArb,
  }),
  validatingAirlineCodes: fc.array(airlineCodeArb, { minLength: 1, maxLength: 3 }),
  numberOfBookableSeats: fc.integer({ min: 1, max: 9 }),
});

// ---------------------------------------------------------------------------
// Property 5: Filtraggio per prezzo è corretto
// Validates: Requirements 3.1
// ---------------------------------------------------------------------------

describe('Property 5: Filtraggio per prezzo è corretto', () => {
  it('all returned results have grandTotal within [min, max]', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.tuple(
          fc.integer({ min: 50, max: 1000 }),
          fc.integer({ min: 1000, max: 2000 }),
        ),
        (results, [min, max]) => {
          const filtered = filterByPrice(results, [min, max]);
          return filtered.every((r) => {
            const price = parseFloat(r.price.grandTotal);
            return price >= min && price <= max;
          });
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('no excluded result has grandTotal within [min, max]', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.tuple(
          fc.integer({ min: 50, max: 1000 }),
          fc.integer({ min: 1000, max: 2000 }),
        ),
        (results, [min, max]) => {
          const filtered = filterByPrice(results, [min, max]);
          const filteredIds = new Set(filtered.map((r) => r.id));
          const excluded = results.filter((r) => !filteredIds.has(r.id));
          return excluded.every((r) => {
            const price = parseFloat(r.price.grandTotal);
            return price < min || price > max;
          });
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Filtraggio per scali è corretto
// Validates: Requirements 3.2
// ---------------------------------------------------------------------------

function countStopsForResult(result: FlightResult): number {
  const segments = result.itineraries[0]?.segments ?? [];
  const segmentStops = segments.reduce((sum, seg) => sum + seg.numberOfStops, 0);
  const layovers = Math.max(0, segments.length - 1);
  return segmentStops + layovers;
}

describe('Property 6: Filtraggio per scali è corretto', () => {
  it('every returned result has stop count consistent with at least one selected filter', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.subarray(['direct', '1-stop', '2+'] as const, { minLength: 1 }),
        (results, stops) => {
          const filtered = filterByStops(results, stops);
          return filtered.every((r) => {
            const total = countStopsForResult(r);
            return stops.some((s) => {
              if (s === 'direct') return total === 0;
              if (s === '1-stop') return total === 1;
              if (s === '2+') return total >= 2;
              return false;
            });
          });
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('empty stops array returns all results', () => {
    fc.assert(
      fc.property(fc.array(flightResultArb, { maxLength: 20 }), (results) => {
        const filtered = filterByStops(results, []);
        return filtered.length === results.length;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Filtraggio per compagnia è corretto
// Validates: Requirements 3.3
// ---------------------------------------------------------------------------

describe('Property 7: Filtraggio per compagnia è corretto', () => {
  it('every returned result has at least one validatingAirlineCode in selected airlines', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.array(airlineCodeArb, { minLength: 1, maxLength: 5 }),
        (results, airlines) => {
          const filtered = filterByAirline(results, airlines);
          return filtered.every((r) =>
            r.validatingAirlineCodes.some((code) => airlines.includes(code)),
          );
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('empty airlines array returns all results', () => {
    fc.assert(
      fc.property(fc.array(flightResultArb, { maxLength: 20 }), (results) => {
        const filtered = filterByAirline(results, []);
        return filtered.length === results.length;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Filtraggio per fascia oraria è corretto
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------

function getExpectedSlot(at: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const date = new Date(at);
  const hour = date.getHours(); // match filterUtils which uses getHours() (local time)
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

describe('Property 8: Filtraggio per fascia oraria è corretto', () => {
  it('every returned result has departure time of first segment in at least one selected slot', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.subarray(
          ['morning', 'afternoon', 'evening', 'night'] as const,
          { minLength: 1 },
        ),
        (results, slots) => {
          const filtered = filterByDepartureTime(results, slots);
          return filtered.every((r) => {
            const firstAt = r.itineraries[0]?.segments[0]?.departure.at;
            if (!firstAt) return false;
            const slot = getExpectedSlot(firstAt);
            return slots.includes(slot);
          });
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('empty slots array returns all results', () => {
    fc.assert(
      fc.property(fc.array(flightResultArb, { maxLength: 20 }), (results) => {
        const filtered = filterByDepartureTime(results, []);
        return filtered.length === results.length;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Filtraggio per durata massima è corretto
// Validates: Requirements 3.5
// ---------------------------------------------------------------------------

describe('Property 9: Filtraggio per durata massima è corretto', () => {
  it('every returned result has first itinerary duration ≤ maxHours', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.integer({ min: 1, max: 30 }),
        (results, maxHours) => {
          const filtered = filterByDuration(results, maxHours);
          return filtered.every((r) => {
            const duration = r.itineraries[0]?.duration;
            if (!duration) return false;
            return parseDurationToMinutes(duration) <= maxHours * 60;
          });
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('null maxHours returns all results', () => {
    fc.assert(
      fc.property(fc.array(flightResultArb, { maxLength: 20 }), (results) => {
        const filtered = filterByDuration(results, null);
        return filtered.length === results.length;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: Ordinamento è corretto e preserva gli elementi
// Validates: Requirements 2.2, 3.7
// ---------------------------------------------------------------------------

describe('Property 10: Ordinamento è corretto e preserva gli elementi', () => {
  it('sorted array contains exactly the same elements as original', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.constantFrom('price', 'duration', 'departure', 'arrival' as const),
        fc.constantFrom('asc', 'desc' as const),
        (results, sortBy, sortOrder) => {
          const sorted = sortResults(results, sortBy, sortOrder);
          if (sorted.length !== results.length) return false;
          const originalIds = results.map((r) => r.id).sort();
          const sortedIds = sorted.map((r) => r.id).sort();
          return originalIds.every((id, i) => id === sortedIds[i]);
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('sorted by price asc respects ordering relation', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { minLength: 2, maxLength: 20 }),
        (results) => {
          const sorted = sortResults(results, 'price', 'asc');
          for (let i = 0; i < sorted.length - 1; i++) {
            const a = parseFloat(sorted[i].price.grandTotal);
            const b = parseFloat(sorted[i + 1].price.grandTotal);
            if (a > b) return false;
          }
          return true;
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('sorted by price desc respects ordering relation', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { minLength: 2, maxLength: 20 }),
        (results) => {
          const sorted = sortResults(results, 'price', 'desc');
          for (let i = 0; i < sorted.length - 1; i++) {
            const a = parseFloat(sorted[i].price.grandTotal);
            const b = parseFloat(sorted[i + 1].price.grandTotal);
            if (a < b) return false;
          }
          return true;
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('sorted by duration asc respects ordering relation', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { minLength: 2, maxLength: 20 }),
        (results) => {
          const sorted = sortResults(results, 'duration', 'asc');
          for (let i = 0; i < sorted.length - 1; i++) {
            const a = parseDurationToMinutes(sorted[i].itineraries[0]?.duration ?? 'PT0M');
            const b = parseDurationToMinutes(sorted[i + 1].itineraries[0]?.duration ?? 'PT0M');
            if (a > b) return false;
          }
          return true;
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });

  it('sorted by departure asc respects ordering relation', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { minLength: 2, maxLength: 20 }),
        (results) => {
          const sorted = sortResults(results, 'departure', 'asc');
          for (let i = 0; i < sorted.length - 1; i++) {
            const aAt = sorted[i].itineraries[0]?.segments[0]?.departure.at ?? '';
            const bAt = sorted[i + 1].itineraries[0]?.segments[0]?.departure.at ?? '';
            if (new Date(aAt).getTime() > new Date(bAt).getTime()) return false;
          }
          return true;
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Reset filtri ripristina la lista originale
// Validates: Requirements 3.8
// ---------------------------------------------------------------------------

describe('Property 11: Reset filtri ripristina la lista originale', () => {
  it('applying any combination of filters then resetting returns all original elements', () => {
    fc.assert(
      fc.property(
        fc.array(flightResultArb, { maxLength: 20 }),
        fc.record({
          priceRange: fc.tuple(
            fc.integer({ min: 50, max: 1000 }),
            fc.integer({ min: 1000, max: 2000 }),
          ),
          stops: fc.subarray(['direct', '1-stop', '2+'] as const),
          airlines: fc.array(airlineCodeArb, { maxLength: 5 }),
          departureTimeSlots: fc.subarray(
            ['morning', 'afternoon', 'evening', 'night'] as const,
          ),
          maxDurationHours: fc.option(fc.integer({ min: 1, max: 30 }), { nil: null }),
        }),
        (results, filters) => {
          // Apply all filters
          let filtered = filterByPrice(results, filters.priceRange);
          filtered = filterByStops(filtered, filters.stops);
          filtered = filterByAirline(filtered, filters.airlines);
          filtered = filterByDepartureTime(filtered, filters.departureTimeSlots);
          filtered = filterByDuration(filtered, filters.maxDurationHours);

          // Reset: empty arrays and null maxDuration
          let reset = filterByPrice(results, [0, Infinity]);
          reset = filterByStops(reset, []);
          reset = filterByAirline(reset, []);
          reset = filterByDepartureTime(reset, []);
          reset = filterByDuration(reset, null);

          // After reset, should have all original elements
          if (reset.length !== results.length) return false;
          const originalIds = new Set(results.map((r) => r.id));
          return reset.every((r) => originalIds.has(r.id));
        },
      ),
      { numRuns: 100, verbose: true },
    );
  });
});
