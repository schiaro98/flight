import type { Airport } from '../types/flight';
import airportsRaw from './airportsData.json';

interface RawAirport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

// Build a typed array once at module load — no runtime cost on subsequent calls
const ALL_AIRPORTS: Airport[] = (airportsRaw as RawAirport[]).map((a) => ({
  iataCode: a.iata,
  name: a.name,
  city: a.city,
  country: a.country,
  countryCode: '',
}));

export const airportService = {
  search(query: string): Promise<Airport[]> {
    if (query.length < 2) return Promise.resolve([]);

    const q = query.trim().toLowerCase();

    const results = ALL_AIRPORTS.filter(
      (a) =>
        a.iataCode.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().startsWith(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 10);

    return Promise.resolve(results);
  },
};
