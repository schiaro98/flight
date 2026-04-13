// Feature: flight-search-app, Property 17: isLowest nel calendario è calcolato correttamente
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { computeIsLowest } from '../priceCalendarUtils';
import { PriceCalendarEntry } from '../../types/flight';

/**
 * Validates: Requirements 4.3
 *
 * Property 17: For any array of PriceCalendarEntry with variable prices,
 * the isLowest flag must be true exactly for entries with minPrice strictly
 * less than the average of available prices.
 */

const priceCalendarEntryArb = fc.record({
  date: fc.date({ min: new Date('2025-01-01'), max: new Date('2025-12-31') }).map((d) => d.toISOString().slice(0, 10)),
  minPrice: fc.oneof(
    fc.float({ min: 0, max: 2000, noNaN: true, noDefaultInfinity: true }).map((v) => Math.round(v * 100) / 100),
    fc.constant(null)
  ),
  currency: fc.constantFrom('EUR', 'USD', 'GBP'),
  isLowest: fc.boolean(), // will be overwritten by computeIsLowest
}) as fc.Arbitrary<PriceCalendarEntry>;

describe('computeIsLowest', () => {
  it('Property 17: isLowest is true exactly for entries with minPrice < average of available prices', () => {
    fc.assert(
      fc.property(fc.array(priceCalendarEntryArb, { minLength: 0, maxLength: 30 }), (entries) => {
        const result = computeIsLowest(entries);

        // Compute expected average from non-null prices
        const available = entries.filter((e) => e.minPrice !== null) as (PriceCalendarEntry & { minPrice: number })[];
        const average =
          available.length > 0
            ? available.reduce((sum, e) => sum + e.minPrice, 0) / available.length
            : null;

        for (let i = 0; i < result.length; i++) {
          const entry = result[i];
          if (entry.minPrice === null || average === null) {
            // No available prices → isLowest must be false
            if (entry.isLowest !== false) return false;
          } else {
            // isLowest must be true iff minPrice < average
            const expected = entry.minPrice < average;
            if (entry.isLowest !== expected) return false;
          }
        }
        return true;
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('Property 17: computeIsLowest does not mutate the input array', () => {
    fc.assert(
      fc.property(fc.array(priceCalendarEntryArb, { minLength: 1, maxLength: 20 }), (entries) => {
        const copy = entries.map((e) => ({ ...e }));
        computeIsLowest(entries);
        // Original entries should be unchanged
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].minPrice !== copy[i].minPrice) return false;
          if (entries[i].date !== copy[i].date) return false;
        }
        return true;
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('Property 17: result array has same length as input', () => {
    fc.assert(
      fc.property(fc.array(priceCalendarEntryArb, { minLength: 0, maxLength: 30 }), (entries) => {
        const result = computeIsLowest(entries);
        return result.length === entries.length;
      }),
      { numRuns: 100, verbose: true }
    );
  });
});
