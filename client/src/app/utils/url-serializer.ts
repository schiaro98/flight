import type { SearchParams, CabinClass } from '../types/flight';

const VALID_TRIP_TYPES = ['one-way', 'round-trip', 'multi-city'] as const;
const VALID_CABIN_CLASSES: CabinClass[] = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];

export function serializeSearchParams(params: SearchParams): URLSearchParams {
  const search = new URLSearchParams();
  search.set('origin', params.origin);
  search.set('destination', params.destination);
  search.set('dep', params.departureDate);
  if (params.returnDate) search.set('ret', params.returnDate);
  search.set('type', params.tripType);
  search.set('adults', String(params.passengers.adults));
  search.set('children', String(params.passengers.children));
  search.set('infants', String(params.passengers.infants));
  search.set('cabin', params.cabinClass);
  return search;
}

export function deserializeSearchParams(search: URLSearchParams): SearchParams | null {
  const origin = search.get('origin');
  const destination = search.get('destination');
  const dep = search.get('dep');
  const type = search.get('type');
  const adultsRaw = search.get('adults');
  const childrenRaw = search.get('children');
  const infantsRaw = search.get('infants');
  const cabin = search.get('cabin');

  if (!origin || !destination || !dep || !type || adultsRaw === null ||
      childrenRaw === null || infantsRaw === null || !cabin) return null;

  if (!VALID_TRIP_TYPES.includes(type as (typeof VALID_TRIP_TYPES)[number])) return null;
  if (!VALID_CABIN_CLASSES.includes(cabin as CabinClass)) return null;

  const adults = parseInt(adultsRaw, 10);
  const children = parseInt(childrenRaw, 10);
  const infants = parseInt(infantsRaw, 10);

  if (isNaN(adults) || isNaN(children) || isNaN(infants)) return null;
  if (adults < 1 || children < 0 || infants < 0) return null;

  const params: SearchParams = {
    origin, destination, departureDate: dep,
    tripType: type as SearchParams['tripType'],
    passengers: { adults, children, infants },
    cabinClass: cabin as CabinClass,
  };
  const ret = search.get('ret');
  if (ret) params.returnDate = ret;
  return params;
}
