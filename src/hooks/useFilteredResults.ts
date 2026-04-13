import { useMemo } from 'react';
import type { FlightResult } from '../types/flight';
import { useFilterStore } from '../store/filterStore';
import {
  filterByPrice,
  filterByStops,
  filterByAirline,
  filterByDepartureTime,
  filterByDuration,
  sortResults,
} from '../utils/filterUtils';

export function useFilteredResults(results: FlightResult[]): FlightResult[] {
  const { filterState } = useFilterStore();

  return useMemo(() => {
    let filtered = filterByPrice(results, filterState.priceRange);
    filtered = filterByStops(filtered, filterState.stops);
    filtered = filterByAirline(filtered, filterState.airlines);
    filtered = filterByDepartureTime(filtered, filterState.departureTimeSlots);
    filtered = filterByDuration(filtered, filterState.maxDurationHours);
    return sortResults(filtered, filterState.sortBy, filterState.sortOrder);
  }, [results, filterState]);
}
