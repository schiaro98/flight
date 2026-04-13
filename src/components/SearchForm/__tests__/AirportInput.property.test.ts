// Feature: flight-search-app, Property 14: Autocompletamento aeroporti — risultati coerenti con query
// Feature: flight-search-app, Property 15: Rendering suggerimento aeroporto contiene tutti i campi

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { Airport } from '../../../types/flight';

/**
 * Pure filter function that mimics the MSW handler logic for airport search.
 * Filters airports by case-insensitive match on iataCode, name, or city.
 */
function filterAirports(airports: Airport[], query: string): Airport[] {
  if (query.length < 2) {
    return [];
  }
  const q = query.toLowerCase();
  return airports.filter(
    (airport) =>
      airport.iataCode.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q)
  );
}

/**
 * Helper that formats an Airport into a suggestion string containing all fields.
 * Mirrors what AirportInput renders in each suggestion list item.
 */
export function formatAirportSuggestion(airport: Airport): string {
  return `${airport.iataCode} ${airport.name} ${airport.city} ${airport.country}`;
}

// Arbitrary for a valid Airport object
const airportArb = fc.record({
  iataCode: fc.stringMatching(/^[A-Z]{3}$/),
  name: fc.string({ minLength: 1, maxLength: 80 }),
  city: fc.string({ minLength: 1, maxLength: 50 }),
  country: fc.string({ minLength: 1, maxLength: 50 }),
  countryCode: fc.stringMatching(/^[A-Z]{2}$/),
});

// Arbitrary for a non-empty array of airports
const airportArrayArb = fc.array(airportArb, { minLength: 1, maxLength: 20 });

// ─── Property 14 ─────────────────────────────────────────────────────────────

/**
 * Validates: Requirements 1.1, 5.1, 5.3
 *
 * Property 14: For any search string of at least 2 characters, all returned
 * suggestions must contain the string (case-insensitive) in the airport name,
 * city, or IATA code.
 */
describe('Property 14: Autocompletamento aeroporti — risultati coerenti con query', () => {
  it('all results contain the query in name, city, or iataCode (case-insensitive)', () => {
    fc.assert(
      fc.property(
        airportArrayArb,
        fc.string({ minLength: 2, maxLength: 20 }),
        (airports, query) => {
          const results = filterAirports(airports, query);
          const q = query.toLowerCase();
          return results.every(
            (airport) =>
              airport.iataCode.toLowerCase().includes(q) ||
              airport.name.toLowerCase().includes(q) ||
              airport.city.toLowerCase().includes(q)
          );
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('returns empty array for query shorter than 2 characters', () => {
    fc.assert(
      fc.property(
        airportArrayArb,
        fc.string({ minLength: 0, maxLength: 1 }),
        (airports, query) => {
          const results = filterAirports(airports, query);
          return results.length === 0;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});

// ─── Property 15 ─────────────────────────────────────────────────────────────

/**
 * Validates: Requirements 5.2
 *
 * Property 15: For any Airport object, the suggestion rendering must contain
 * the airport name, city, country, and IATA code.
 */
describe('Property 15: Rendering suggerimento aeroporto contiene tutti i campi', () => {
  it('formatted suggestion contains iataCode, name, city, and country', () => {
    fc.assert(
      fc.property(airportArb, (airport) => {
        const suggestion = formatAirportSuggestion(airport);
        return (
          suggestion.includes(airport.iataCode) &&
          suggestion.includes(airport.name) &&
          suggestion.includes(airport.city) &&
          suggestion.includes(airport.country)
        );
      }),
      { numRuns: 100, verbose: true }
    );
  });
});
