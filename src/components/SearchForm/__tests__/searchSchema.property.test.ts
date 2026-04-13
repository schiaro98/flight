// Feature: flight-search-app, Property 12: Validazione date — ritorno non precede partenza

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { searchParamsSchema } from '../searchSchema';

/**
 * Validates: Requirements 1.8
 *
 * Property 12: For any pair of dates (departureDate, returnDate) where
 * returnDate < departureDate, the form validation must reject the input
 * and not allow submission.
 */

// Helper: format a Date as YYYY-MM-DD
function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Base valid input (all fields except dates)
const baseInput = {
  origin: 'FCO',
  destination: 'LHR',
  tripType: 'round-trip' as const,
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'ECONOMY' as const,
};

describe('Property 12: Validazione date — ritorno non precede partenza', () => {
  it('should reject when returnDate < departureDate', () => {
    fc.assert(
      fc.property(
        // Generate two distinct dates and ensure the second is strictly before the first
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date1, date2) => {
          // Ensure date1 > date2 so departureDate > returnDate
          const [laterDate, earlierDate] =
            date1 >= date2 ? [date1, date2] : [date2, date1];

          // Skip when dates are equal (not a violation)
          fc.pre(toISODate(laterDate) > toISODate(earlierDate));

          const departureDate = toISODate(laterDate);
          const returnDate = toISODate(earlierDate);

          const result = searchParamsSchema.safeParse({
            ...baseInput,
            departureDate,
            returnDate,
          });

          return result.success === false;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should accept when returnDate >= departureDate (positive case)', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date1, date2) => {
          // Ensure departureDate <= returnDate
          const [earlierDate, laterDate] =
            date1 <= date2 ? [date1, date2] : [date2, date1];

          const departureDate = toISODate(earlierDate);
          const returnDate = toISODate(laterDate);

          const result = searchParamsSchema.safeParse({
            ...baseInput,
            departureDate,
            returnDate,
          });

          return result.success === true;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should accept when returnDate is omitted (one-way trip)', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date) => {
          const result = searchParamsSchema.safeParse({
            ...baseInput,
            tripType: 'one-way',
            departureDate: toISODate(date),
            // no returnDate
          });

          return result.success === true;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});

// Feature: flight-search-app, Property 13: Validazione aeroporto — origine ≠ destinazione

/**
 * Validates: Requirements 5.4
 *
 * Property 13: For any IATA code, if origin === destination, the form
 * validation must reject the input and show an error message.
 */

// A valid ISO date to use as a fixed departure date
const FIXED_DEPARTURE = '2025-06-01';

// Arbitrary for a non-empty string (simulating any IATA-like code)
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 10 });

describe('Property 13: Validazione aeroporto — origine ≠ destinazione', () => {
  it('should reject when origin === destination', () => {
    fc.assert(
      fc.property(nonEmptyStringArb, (iataCode) => {
        const result = searchParamsSchema.safeParse({
          origin: iataCode,
          destination: iataCode,
          departureDate: FIXED_DEPARTURE,
          tripType: 'one-way' as const,
          passengers: { adults: 1, children: 0, infants: 0 },
          cabinClass: 'ECONOMY' as const,
        });

        return result.success === false;
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('should accept when origin !== destination (positive case)', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArb,
        nonEmptyStringArb,
        (origin, destination) => {
          // Skip when they happen to be equal
          fc.pre(origin !== destination);

          const result = searchParamsSchema.safeParse({
            origin,
            destination,
            departureDate: FIXED_DEPARTURE,
            tripType: 'one-way' as const,
            passengers: { adults: 1, children: 0, infants: 0 },
            cabinClass: 'ECONOMY' as const,
          });

          return result.success === true;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});
