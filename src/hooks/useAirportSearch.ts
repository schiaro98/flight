import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { airportService } from '../services/airportService';

export function useAirportSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: airports = [], isLoading } = useQuery({
    queryKey: ['airports', debouncedQuery],
    queryFn: () => airportService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return { airports, isLoading };
}
