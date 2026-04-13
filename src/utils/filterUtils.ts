import type { FlightResult } from '../types/flight';

/**
 * Parses an ISO 8601 duration string (e.g. "PT2H30M") into total minutes.
 */
export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  return hours * 60 + minutes;
}

/**
 * Counts total stops for the first itinerary of a flight result.
 * Stops = sum of numberOfStops across all segments + (segments.length - 1) for layovers.
 */
function countStops(result: FlightResult): number {
  const segments = result.itineraries[0]?.segments ?? [];
  const segmentStops = segments.reduce((sum, seg) => sum + seg.numberOfStops, 0);
  const layovers = Math.max(0, segments.length - 1);
  return segmentStops + layovers;
}

/**
 * Filters results where price.grandTotal is within [min, max] inclusive.
 */
export function filterByPrice(
  results: FlightResult[],
  range: [number, number]
): FlightResult[] {
  const [min, max] = range;
  return results.filter((r) => {
    const price = parseFloat(r.price.grandTotal);
    return price >= min && price <= max;
  });
}

/**
 * Filters results by number of stops.
 * If stops array is empty, returns all results.
 */
export function filterByStops(
  results: FlightResult[],
  stops: ('direct' | '1-stop' | '2+')[]
): FlightResult[] {
  if (stops.length === 0) return results;
  return results.filter((r) => {
    const total = countStops(r);
    return stops.some((s) => {
      if (s === 'direct') return total === 0;
      if (s === '1-stop') return total === 1;
      if (s === '2+') return total >= 2;
      return false;
    });
  });
}

/**
 * Filters results where at least one validatingAirlineCode is in the airlines array.
 * If airlines is empty, returns all results.
 */
export function filterByAirline(
  results: FlightResult[],
  airlines: string[]
): FlightResult[] {
  if (airlines.length === 0) return results;
  return results.filter((r) =>
    r.validatingAirlineCodes.some((code) => airlines.includes(code))
  );
}

/**
 * Returns the time slot for a given ISO 8601 datetime string.
 */
function getTimeSlot(at: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const date = new Date(at);
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night'; // 00:00–05:59
}

/**
 * Filters results by departure time slot of the first segment of the first itinerary.
 * If slots is empty, returns all results.
 */
export function filterByDepartureTime(
  results: FlightResult[],
  slots: ('morning' | 'afternoon' | 'evening' | 'night')[]
): FlightResult[] {
  if (slots.length === 0) return results;
  return results.filter((r) => {
    const firstSegment = r.itineraries[0]?.segments[0];
    if (!firstSegment) return false;
    const slot = getTimeSlot(firstSegment.departure.at);
    return slots.includes(slot);
  });
}

/**
 * Filters results where the first itinerary duration is ≤ maxHours.
 * If maxHours is null, returns all results.
 */
export function filterByDuration(
  results: FlightResult[],
  maxHours: number | null
): FlightResult[] {
  if (maxHours === null) return results;
  const maxMinutes = maxHours * 60;
  return results.filter((r) => {
    const duration = r.itineraries[0]?.duration;
    if (!duration) return false;
    return parseDurationToMinutes(duration) <= maxMinutes;
  });
}

/**
 * Returns a new sorted array of FlightResult without mutating the original.
 */
export function sortResults(
  results: FlightResult[],
  sortBy: 'price' | 'duration' | 'departure' | 'arrival',
  sortOrder: 'asc' | 'desc'
): FlightResult[] {
  const sorted = [...results];
  const direction = sortOrder === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let aVal: number;
    let bVal: number;

    switch (sortBy) {
      case 'price':
        aVal = parseFloat(a.price.grandTotal);
        bVal = parseFloat(b.price.grandTotal);
        break;
      case 'duration':
        aVal = parseDurationToMinutes(a.itineraries[0]?.duration ?? 'PT0M');
        bVal = parseDurationToMinutes(b.itineraries[0]?.duration ?? 'PT0M');
        break;
      case 'departure': {
        const aAt = a.itineraries[0]?.segments[0]?.departure.at ?? '';
        const bAt = b.itineraries[0]?.segments[0]?.departure.at ?? '';
        aVal = new Date(aAt).getTime();
        bVal = new Date(bAt).getTime();
        break;
      }
      case 'arrival': {
        const aSegs = a.itineraries[0]?.segments ?? [];
        const bSegs = b.itineraries[0]?.segments ?? [];
        const aAt = aSegs[aSegs.length - 1]?.arrival.at ?? '';
        const bAt = bSegs[bSegs.length - 1]?.arrival.at ?? '';
        aVal = new Date(aAt).getTime();
        bVal = new Date(bAt).getTime();
        break;
      }
    }

    return (aVal - bVal) * direction;
  });

  return sorted;
}
