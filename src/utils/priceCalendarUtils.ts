import { PriceCalendarEntry } from '../types/flight';

/**
 * Computes the isLowest flag for each PriceCalendarEntry.
 * isLowest = true if minPrice is strictly less than the average of all available (non-null) prices.
 * Returns a new array without mutating the input.
 */
export function computeIsLowest(entries: PriceCalendarEntry[]): PriceCalendarEntry[] {
  const available = entries.filter((e) => e.minPrice !== null) as (PriceCalendarEntry & { minPrice: number })[];

  if (available.length === 0) {
    return entries.map((e) => ({ ...e, isLowest: false }));
  }

  const average = available.reduce((sum, e) => sum + e.minPrice, 0) / available.length;

  return entries.map((e) => ({
    ...e,
    isLowest: e.minPrice !== null && e.minPrice < average,
  }));
}
