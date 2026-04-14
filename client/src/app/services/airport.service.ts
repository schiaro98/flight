import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import type { Airport } from '../types/flight';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import airportsRaw from '../../assets/airportsData.json';

interface RawAirport { iata: string; name: string; city: string; country: string; }

const ALL_AIRPORTS: Airport[] = (airportsRaw as RawAirport[]).map((a) => ({
  iataCode: a.iata,
  name: a.name,
  city: a.city,
  country: a.country,
  countryCode: '',
}));

@Injectable({ providedIn: 'root' })
export class AirportService {
  search(query: string): Observable<Airport[]> {
    if (query.length < 2) return from([[]]);
    const q = query.trim().toLowerCase();
    const results = ALL_AIRPORTS.filter(
      (a) =>
        a.iataCode.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().startsWith(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 10);
    return from([results]);
  }
}
