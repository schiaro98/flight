// Feature: flight-search-app, Property 3: Parsing produce FlightResult validi

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { parseAmadeusResponse } from '../flightParser';
import type { AmadeusApiResponse } from '../../types/flight';

/**
 * Validates: Requirements 7.2
 *
 * Property 3: For any valid structured Amadeus API response, the parser must
 * produce an array of FlightResult where each element has all required fields
 * (id, itineraries, price, validatingAirlineCodes) correctly populated.
 */

// Arbitrary for a non-empty string
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 20 });

// Arbitrary for an ISO datetime string
const isoDateTimeArb = fc.date({
  min: new Date('2025-01-01'),
  max: new Date('2030-12-31'),
}).map((d) => d.toISOString());

// Arbitrary for an IATA-like code
const iataArb = fc.stringMatching(/^[A-Z]{3}$/);

// Arbitrary for a decimal price string
const priceStringArb = fc.float({ min: 10, max: 9999, noNaN: true })
  .map((n) => n.toFixed(2));

// Arbitrary for a single AmadeusSegment
const segmentArb = fc.record({
  departure: fc.record({ iataCode: iataArb, at: isoDateTimeArb }),
  arrival: fc.record({ iataCode: iataArb, at: isoDateTimeArb }),
  carrierCode: fc.stringMatching(/^[A-Z]{2}$/),
  number: fc.stringMatching(/^[0-9]{1,4}$/),
  aircraft: fc.record({ code: fc.stringMatching(/^[A-Z0-9]{3}$/) }),
  duration: fc.constantFrom('PT1H30M', 'PT2H', 'PT3H45M'),
  numberOfStops: fc.integer({ min: 0, max: 2 }),
  id: nonEmptyStringArb,
});

// Arbitrary for a single AmadeusFlightOffer
const flightOfferArb = fc.record({
  id: nonEmptyStringArb,
  itineraries: fc.array(
    fc.record({
      duration: fc.constantFrom('PT1H30M', 'PT2H', 'PT3H45M'),
      segments: fc.array(segmentArb, { minLength: 1, maxLength: 3 }),
    }),
    { minLength: 1, maxLength: 2 }
  ),
  price: fc.record({
    currency: fc.constantFrom('EUR', 'USD', 'GBP'),
    total: priceStringArb,
    base: priceStringArb,
    grandTotal: priceStringArb,
  }),
  validatingAirlineCodes: fc.array(fc.stringMatching(/^[A-Z]{2}$/), { minLength: 1, maxLength: 3 }),
  numberOfBookableSeats: fc.integer({ min: 1, max: 9 }),
});

// Arbitrary for a valid AmadeusApiResponse
const amadeusApiResponseArb: fc.Arbitrary<AmadeusApiResponse> = fc.record({
  data: fc.array(flightOfferArb, { minLength: 1, maxLength: 5 }),
});

describe('Property 3: Parsing produce FlightResult validi', () => {
  it('parseAmadeusResponse returns an array with length equal to number of offers', () => {
    fc.assert(
      fc.property(amadeusApiResponseArb, (response) => {
        const results = parseAmadeusResponse(response);
        return results.length === response.data.length;
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('each result has a non-empty id', () => {
    fc.assert(
      fc.property(amadeusApiResponseArb, (response) => {
        const results = parseAmadeusResponse(response);
        return results.every((r) => typeof r.id === 'string' && r.id.length > 0);
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('each result has an itineraries array', () => {
    fc.assert(
      fc.property(amadeusApiResponseArb, (response) => {
        const results = parseAmadeusResponse(response);
        return results.every((r) => Array.isArray(r.itineraries));
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('each result has price with currency, total, and grandTotal', () => {
    fc.assert(
      fc.property(amadeusApiResponseArb, (response) => {
        const results = parseAmadeusResponse(response);
        return results.every(
          (r) =>
            typeof r.price.currency === 'string' &&
            typeof r.price.total === 'string' &&
            typeof r.price.grandTotal === 'string'
        );
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('each result has a validatingAirlineCodes array', () => {
    fc.assert(
      fc.property(amadeusApiResponseArb, (response) => {
        const results = parseAmadeusResponse(response);
        return results.every((r) => Array.isArray(r.validatingAirlineCodes));
      }),
      { numRuns: 100, verbose: true }
    );
  });
});

// Feature: flight-search-app, Property 4: Gestione risposta API malformata

/**
 * Validates: Requirements 7.5
 *
 * Property 4: For any arbitrary JSON value not conforming to the Amadeus schema,
 * parseAmadeusResponse must NOT throw unhandled exceptions — it must always return
 * an array (possibly empty).
 */
describe('Property 4: Gestione risposta API malformata', () => {
  it('never throws for any arbitrary JSON value', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        let result: unknown;
        expect(() => {
          result = parseAmadeusResponse(value);
        }).not.toThrow();
        expect(Array.isArray(result)).toBe(true);
      }),
      { numRuns: 200, verbose: true }
    );
  });

  it('returns empty array for objects with data field of wrong type (string)', () => {
    fc.assert(
      fc.property(fc.string(), (dataValue) => {
        const result = parseAmadeusResponse({ data: dataValue });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('returns empty array for objects with data field of wrong type (number)', () => {
    fc.assert(
      fc.property(fc.float({ noNaN: true }), (dataValue) => {
        const result = parseAmadeusResponse({ data: dataValue });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('returns empty array when data is null', () => {
    const result = parseAmadeusResponse({ data: null });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for null input', () => {
    const result = parseAmadeusResponse(null);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for primitive inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.float({ noNaN: true }), fc.string(), fc.boolean()),
        (primitive) => {
          const result = parseAmadeusResponse(primitive);
          expect(Array.isArray(result)).toBe(true);
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});
