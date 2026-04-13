// Feature: flight-search-app, Property 2: Round-trip FlightResult JSON

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { FlightResult } from '../../types/flight';

/**
 * Validates: Requirements 7.3
 *
 * Property 2: For any valid FlightResult object, serializing it to JSON and
 * then deserializing it must produce an object equivalent to the original.
 */

// Arbitrary for a non-empty string
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 20 });

// Arbitrary for a decimal price string
const priceStringArb = fc.float({ min: 10, max: 9999, noNaN: true })
  .map((n) => n.toFixed(2));

// Arbitrary for a FlightEndpoint
const flightEndpointArb = fc.record({
  iataCode: fc.stringMatching(/^[A-Z]{3}$/),
  at: fc.date({ min: new Date('2025-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString()),
  terminal: fc.option(nonEmptyStringArb, { nil: undefined }),
});

// Arbitrary for a BaggageInfo (optional)
const baggageInfoArb = fc.option(
  fc.record({
    includedCheckedBags: fc.option(
      fc.record({ quantity: fc.integer({ min: 0, max: 3 }) }),
      { nil: undefined }
    ),
    includedCabinBags: fc.option(
      fc.record({ quantity: fc.integer({ min: 0, max: 2 }) }),
      { nil: undefined }
    ),
  }),
  { nil: undefined }
);

// Arbitrary for a Segment
const segmentArb = fc.record({
  departure: flightEndpointArb,
  arrival: flightEndpointArb,
  carrierCode: fc.stringMatching(/^[A-Z]{2}$/),
  number: fc.stringMatching(/^[0-9]{1,4}$/),
  aircraft: nonEmptyStringArb,
  duration: fc.constantFrom('PT1H30M', 'PT2H', 'PT3H45M', 'PT5H'),
  numberOfStops: fc.integer({ min: 0, max: 2 }),
  baggage: baggageInfoArb,
});

// Arbitrary for an Itinerary
const itineraryArb = fc.record({
  duration: fc.constantFrom('PT1H30M', 'PT2H', 'PT3H45M', 'PT5H'),
  segments: fc.array(segmentArb, { minLength: 1, maxLength: 3 }),
});

// Arbitrary for a Fee
const feeArb = fc.record({
  amount: priceStringArb,
  type: fc.constantFrom('SUPPLIER', 'TICKETING'),
});

// Arbitrary for a Price
const priceArb = fc.record({
  currency: fc.constantFrom('EUR', 'USD', 'GBP'),
  total: priceStringArb,
  base: priceStringArb,
  fees: fc.array(feeArb, { minLength: 0, maxLength: 3 }),
  grandTotal: priceStringArb,
});

// Arbitrary for a complete FlightResult
const flightResultArb: fc.Arbitrary<FlightResult> = fc.record({
  id: nonEmptyStringArb,
  itineraries: fc.array(itineraryArb, { minLength: 1, maxLength: 2 }),
  price: priceArb,
  validatingAirlineCodes: fc.array(
    fc.stringMatching(/^[A-Z]{2}$/),
    { minLength: 1, maxLength: 3 }
  ),
  numberOfBookableSeats: fc.integer({ min: 1, max: 9 }),
});

describe('Property 2: Round-trip FlightResult JSON', () => {
  it('JSON.parse(JSON.stringify(flightResult)) deep-equals the original', () => {
    fc.assert(
      fc.property(flightResultArb, (flightResult) => {
        const serialized = JSON.stringify(flightResult);
        const deserialized = JSON.parse(serialized) as FlightResult;
        expect(deserialized).toEqual(flightResult);
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('serialized JSON is a valid string', () => {
    fc.assert(
      fc.property(flightResultArb, (flightResult) => {
        const serialized = JSON.stringify(flightResult);
        expect(typeof serialized).toBe('string');
        expect(serialized.length).toBeGreaterThan(0);
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('deserialized object has the same id as the original', () => {
    fc.assert(
      fc.property(flightResultArb, (flightResult) => {
        const deserialized = JSON.parse(JSON.stringify(flightResult)) as FlightResult;
        expect(deserialized.id).toBe(flightResult.id);
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('deserialized price fields match the original', () => {
    fc.assert(
      fc.property(flightResultArb, (flightResult) => {
        const deserialized = JSON.parse(JSON.stringify(flightResult)) as FlightResult;
        expect(deserialized.price.currency).toBe(flightResult.price.currency);
        expect(deserialized.price.total).toBe(flightResult.price.total);
        expect(deserialized.price.grandTotal).toBe(flightResult.price.grandTotal);
      }),
      { numRuns: 100, verbose: true }
    );
  });
});
