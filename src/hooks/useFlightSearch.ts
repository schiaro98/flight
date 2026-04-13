import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { deserializeSearchParams } from '../utils/urlSerializer';
import { flightService } from '../services/flightService';

export function useFlightSearch() {
  const [searchParams] = useSearchParams();
  const params = deserializeSearchParams(searchParams);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['flights', params],
    queryFn: () => flightService.search(params!),
    enabled: params !== null,
  });

  return { data, isLoading, isError, error };
}
