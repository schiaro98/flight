// Feature: flight-search-app, Property 1: Round-trip serializzazione SearchParams

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { serializeSearchParams, deserializeSearchParams } from '../urlSerializer';
import type { SearchParams } from '../../types/flight';

/**
 * Validates: Requirements 6.2
 *
 * Property 1: For any valid SearchParams object, serializing it to URL query
 * string and then deserializing it must produce an object equivalent to the original.
 */

// Arbitrary for a 3-uppercase-letter IATA-like code
const iataArb = fc.stringMatching(/^[A-Z]{3}$/);

// Arbitrary for an ISO date string YYYY-MM-DD in a reasonable range
const isoDateArb = fc.date({
  min: new Date('2025-01-01'),
  max: new Date('2030-12-31'),
}).map((d) => d.toISOString().slice(0, 10));

// Arbitrary for a valid SearchParams object
const searchParamsArb: fc.Arbitrary<SearchParams> = fc
  .record({
    origin: iataArb,
    destination: iataArb,
    departureDate: isoDateArb,
    hasReturn: fc.boolean(),
    returnOffset: fc.integer({ min: 0, max: 365 }),
    tripType: fc.constantFrom('one-way', 'round-trip', 'multi-city' as const),
    adults: fc.integer({ min: 1, max: 9 }),
    children: fc.integer({ min: 0, max: 5 }),
    infantsOffset: fc.integer({ min: 0, max: 0 }), // placeholder, computed below
    cabinClass: fc.constantFrom(
      'ECONOMY',
      'PREMIUM_ECONOMY',
      'BUSINESS',
      'FIRST' as const
    ),
  })
  .filter((r) => r.origin !== r.destination)
  .map((r) => {
    const infants = Math.min(r.adults, r.children <= r.adults ? r.children : r.adults);
    // Compute returnDate as departureDate + returnOffset days (only when hasReturn)
    let returnDate: string | undefined;
    if (r.hasReturn) {
      const dep = new Date(r.departureDate);
      dep.setDate(dep.getDate() + r.returnOffset);
      returnDate = dep.toISOString().slice(0, 10);
    }

    const params: SearchParams = {
      origin: r.origin,
      destination: r.destination,
      departureDate: r.departureDate,
      tripType: r.tripType,
      passengers: {
        adults: r.adults,
        children: r.children,
        infants,
      },
      cabinClass: r.cabinClass,
    };

    if (returnDate !== undefined) {
      params.returnDate = returnDate;
    }

    return params;
  });

describe('Property 1: Round-trip serializzazione SearchParams', () => {
  it('serialize then deserialize produces an equivalent SearchParams', () => {
    fc.assert(
      fc.property(searchParamsArb, (original) => {
        const serialized = serializeSearchParams(original);
        const deserialized = deserializeSearchParams(serialized);

        if (deserialized === null) return false;

        return (
          deserialized.origin === original.origin &&
          deserialized.destination === original.destination &&
          deserialized.departureDate === original.departureDate &&
          deserialized.returnDate === original.returnDate &&
          deserialized.tripType === original.tripType &&
          deserialized.passengers.adults === original.passengers.adults &&
          deserialized.passengers.children === original.passengers.children &&
          deserialized.passengers.infants === original.passengers.infants &&
          deserialized.cabinClass === original.cabinClass
        );
      }),
      { numRuns: 100, verbose: true }
    );
  });
});
