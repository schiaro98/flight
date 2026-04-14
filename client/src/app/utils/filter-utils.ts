import type { FlightResult } from '../types/flight';

export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return parseInt(match[1] ?? '0', 10) * 60 + parseInt(match[2] ?? '0', 10);
}

function countStops(result: FlightResult): number {
  const segments = result.itineraries[0]?.segments ?? [];
  return segments.reduce((sum, seg) => sum + seg.numberOfStops, 0) + Math.max(0, segments.length - 1);
}

function getTimeSlot(at: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date(at).getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

export function filterByPrice(results: FlightResult[], range: [number, number]): FlightResult[] {
  const [min, max] = range;
  return results.filter((r) => {
    const p = parseFloat(r.price.grandTotal);
    return p >= min && p <= max;
  });
}

export function filterByStops(results: FlightResult[], stops: ('direct' | '1-stop' | '2+')[]): FlightResult[] {
  if (!stops.length) return results;
  return results.filter((r) => {
    const total = countStops(r);
    return stops.some((s) => s === 'direct' ? total === 0 : s === '1-stop' ? total === 1 : total >= 2);
  });
}

export function filterByAirline(results: FlightResult[], airlines: string[]): FlightResult[] {
  if (!airlines.length) return results;
  return results.filter((r) => r.validatingAirlineCodes.some((c) => airlines.includes(c)));
}

export function filterByDepartureTime(results: FlightResult[], slots: ('morning' | 'afternoon' | 'evening' | 'night')[]): FlightResult[] {
  if (!slots.length) return results;
  return results.filter((r) => {
    const seg = r.itineraries[0]?.segments[0];
    return seg ? slots.includes(getTimeSlot(seg.departure.at)) : false;
  });
}

export function filterByDuration(results: FlightResult[], maxHours: number | null): FlightResult[] {
  if (maxHours === null) return results;
  const maxMin = maxHours * 60;
  return results.filter((r) => {
    const d = r.itineraries[0]?.duration;
    return d ? parseDurationToMinutes(d) <= maxMin : false;
  });
}

export function sortResults(
  results: FlightResult[],
  sortBy: 'price' | 'duration' | 'departure' | 'arrival',
  sortOrder: 'asc' | 'desc'
): FlightResult[] {
  const dir = sortOrder === 'asc' ? 1 : -1;
  return [...results].sort((a, b) => {
    let av: number, bv: number;
    switch (sortBy) {
      case 'price':
        av = parseFloat(a.price.grandTotal); bv = parseFloat(b.price.grandTotal); break;
      case 'duration':
        av = parseDurationToMinutes(a.itineraries[0]?.duration ?? 'PT0M');
        bv = parseDurationToMinutes(b.itineraries[0]?.duration ?? 'PT0M'); break;
      case 'departure':
        av = new Date(a.itineraries[0]?.segments[0]?.departure.at ?? '').getTime();
        bv = new Date(b.itineraries[0]?.segments[0]?.departure.at ?? '').getTime(); break;
      case 'arrival': {
        const as_ = a.itineraries[0]?.segments ?? [], bs_ = b.itineraries[0]?.segments ?? [];
        av = new Date(as_[as_.length - 1]?.arrival.at ?? '').getTime();
        bv = new Date(bs_[bs_.length - 1]?.arrival.at ?? '').getTime(); break;
      }
    }
    return (av - bv) * dir;
  });
}
