// Feature: flight-search-app, Property 18: Rendering FlightResultCard contiene tutti i campi obbligatori

import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import type { FlightResult, Segment } from '../../../types/flight';
import { FlightResultCard, formatDuration } from '../FlightResultCard';

/**
 * Validates: Requirements 2.1
 *
 * Property 18: For any FlightResult, the rendered FlightResultCard must contain
 * the airline, departure/arrival time, total duration, number of stops, and total price.
 */

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const iataCodeArb = fc.stringMatching(/^[A-Z]{2,3}$/);

const flightEndpointArb = fc.record({
  iataCode: iataCodeArb,
  at: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') }).map((d) => d.toISOString()),
});

const segmentArb: fc.Arbitrary<Segment> = fc.record({
  departure: flightEndpointArb,
  arrival: flightEndpointArb,
  carrierCode: iataCodeArb,
  number: fc.stringMatching(/^\d{1,4}$/),
  aircraft: fc.string({ minLength: 1, maxLength: 10 }),
  duration: fc
    .record({
      hours: fc.integer({ min: 0, max: 23 }),
      minutes: fc.integer({ min: 0, max: 59 }),
    })
    .map(({ hours, minutes }) => `PT${hours}H${minutes}M`),
  numberOfStops: fc.integer({ min: 0, max: 2 }),
});

const itineraryArb = fc.record({
  duration: fc
    .record({
      hours: fc.integer({ min: 1, max: 48 }),
      minutes: fc.integer({ min: 0, max: 59 }),
    })
    .map(({ hours, minutes }) => `PT${hours}H${minutes}M`),
  segments: fc.array(segmentArb, { minLength: 1, maxLength: 4 }),
});

const priceArb = fc.record({
  currency: fc.constantFrom('EUR', 'USD', 'GBP'),
  total: fc.float({ min: 50, max: 5000, noNaN: true }).map((n) => n.toFixed(2)),
  base: fc.float({ min: 50, max: 5000, noNaN: true }).map((n) => n.toFixed(2)),
  fees: fc.array(
    fc.record({ amount: fc.float({ min: 0, max: 100, noNaN: true }).map((n) => n.toFixed(2)), type: fc.string() }),
    { maxLength: 3 }
  ),
  grandTotal: fc.float({ min: 50, max: 5000, noNaN: true }).map((n) => n.toFixed(2)),
});

const flightResultArb: fc.Arbitrary<FlightResult> = fc.record({
  id: fc.uuid(),
  itineraries: fc.array(itineraryArb, { minLength: 1, maxLength: 2 }),
  price: priceArb,
  validatingAirlineCodes: fc.array(iataCodeArb, { minLength: 1, maxLength: 3 }),
  numberOfBookableSeats: fc.integer({ min: 1, max: 9 }),
});

// ─── Property 18 ─────────────────────────────────────────────────────────────

describe('Property 18: Rendering FlightResultCard contiene tutti i campi obbligatori', () => {
  it('rendered card contains airline, departure time, arrival time, duration, stops, and price', () => {
    fc.assert(
      fc.property(flightResultArb, (result) => {
        const { container, unmount } = render(
          <FlightResultCard result={result} onSelect={vi.fn()} />
        );

        const text = container.textContent ?? '';

        const itinerary = result.itineraries[0];
        const segments = itinerary.segments;
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        // Airline
        const airline = result.validatingAirlineCodes.join(', ');
        expect(text).toContain(airline);

        // Departure time (HH:MM)
        const depDate = new Date(firstSegment.departure.at);
        const depTime = `${String(depDate.getHours()).padStart(2, '0')}:${String(depDate.getMinutes()).padStart(2, '0')}`;
        expect(text).toContain(depTime);

        // Arrival time (HH:MM)
        const arrDate = new Date(lastSegment.arrival.at);
        const arrTime = `${String(arrDate.getHours()).padStart(2, '0')}:${String(arrDate.getMinutes()).padStart(2, '0')}`;
        expect(text).toContain(arrTime);

        // Duration
        const duration = formatDuration(itinerary.duration);
        expect(text).toContain(duration);

        // Stops
        const stopCount = segments.length - 1;
        const stopsText =
          stopCount === 0 ? 'Direct' : stopCount === 1 ? '1 stop' : `${stopCount} stops`;
        expect(text).toContain(stopsText);

        // Price
        const price = `${result.price.grandTotal} ${result.price.currency}`;
        expect(text).toContain(price);

        unmount();
        return true;
      }),
      { numRuns: 100, verbose: true }
    );
  });
});
