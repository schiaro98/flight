import React, { useMemo } from 'react';
import type { FlightResult } from '../../types/flight';
import { useFilterStore } from '../../store/filterStore';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StopsFilter } from './StopsFilter';
import { AirlineFilter } from './AirlineFilter';
import { DepartureTimeFilter } from './DepartureTimeFilter';
import { DurationFilter } from './DurationFilter';

interface FilterPanelProps {
  results: FlightResult[];
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'price:asc', label: 'Prezzo (crescente)' },
  { value: 'price:desc', label: 'Prezzo (decrescente)' },
  { value: 'duration:asc', label: 'Durata (crescente)' },
  { value: 'duration:desc', label: 'Durata (decrescente)' },
  { value: 'departure:asc', label: 'Partenza (prima)' },
  { value: 'departure:desc', label: 'Partenza (dopo)' },
  { value: 'arrival:asc', label: 'Arrivo (prima)' },
  { value: 'arrival:desc', label: 'Arrivo (dopo)' },
];

export function FilterPanel({ results }: FilterPanelProps) {
  const { filterState, setFilter, resetFilters } = useFilterStore();

  // Derive available airlines from results
  const availableAirlines = useMemo(() => {
    const codes = new Set<string>();
    results.forEach((r) => r.validatingAirlineCodes.forEach((c) => codes.add(c)));
    return Array.from(codes).sort();
  }, [results]);

  // Derive price bounds from results and sync with filter store on first load
  const { priceMin, priceMax } = useMemo(() => {
    if (results.length === 0) return { priceMin: 0, priceMax: 10000 };
    const prices = results.map((r) => parseFloat(r.price.grandTotal));
    return {
      priceMin: Math.floor(Math.min(...prices)),
      priceMax: Math.ceil(Math.max(...prices)),
    };
  }, [results]);

  // Sync priceRange in store when results change (so filter starts with full range)
  const prevMaxRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (results.length > 0 && prevMaxRef.current !== priceMax) {
      prevMaxRef.current = priceMax;
      setFilter('priceRange', [priceMin, priceMax]);
    }
  }, [priceMin, priceMax, results.length, setFilter]);

  // Derive max duration from results (in hours, rounded up)
  const maxDuration = useMemo(() => {
    if (results.length === 0) return 24;
    const durations = results.map((r) => {
      const match = r.itineraries[0]?.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!match) return 0;
      return (parseInt(match[1] ?? '0') + parseInt(match[2] ?? '0') / 60);
    });
    return Math.ceil(Math.max(...durations, 1));
  }, [results]);

  const sortValue = `${filterState.sortBy}:${filterState.sortOrder}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(':') as [
      'price' | 'duration' | 'departure' | 'arrival',
      'asc' | 'desc',
    ];
    setFilter('sortBy', sortBy);
    setFilter('sortOrder', sortOrder);
  };

  return (
    <aside className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-6">
      {/* Sort */}
      <div>
        <label htmlFor="sort-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Ordina per
        </label>
        <select
          id="sort-select"
          value={sortValue}
          onChange={handleSortChange}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-gray-100" />

      {/* Price range */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prezzo</h3>
        <PriceRangeSlider
          min={priceMin}
          max={priceMax}
          value={filterState.priceRange}
          onChange={(range) => setFilter('priceRange', range)}
        />
      </div>

      <hr className="border-gray-100" />

      {/* Stops */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Scali</h3>
        <StopsFilter
          value={filterState.stops}
          onChange={(stops) => setFilter('stops', stops)}
        />
      </div>

      <hr className="border-gray-100" />

      {/* Airlines */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Compagnie aeree</h3>
        <AirlineFilter
          airlines={availableAirlines}
          value={filterState.airlines}
          onChange={(airlines) => setFilter('airlines', airlines)}
        />
      </div>

      <hr className="border-gray-100" />

      {/* Departure time */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Orario di partenza</h3>
        <DepartureTimeFilter
          value={filterState.departureTimeSlots}
          onChange={(slots) => setFilter('departureTimeSlots', slots)}
        />
      </div>

      <hr className="border-gray-100" />

      {/* Duration */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Durata massima</h3>
        <DurationFilter
          value={filterState.maxDurationHours}
          onChange={(hours) => setFilter('maxDurationHours', hours)}
          max={maxDuration}
        />
      </div>

      <hr className="border-gray-100" />

      {/* Reset */}
      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Reimposta filtri
      </button>
    </aside>
  );
}
