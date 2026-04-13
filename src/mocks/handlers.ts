import { http, HttpResponse } from 'msw';
import { mockFlights } from '../services/mockData';
import { mockAirports } from '../services/mockAirports';

export const handlers = [
  http.get('/api/flights', () => {
    return HttpResponse.json(mockFlights);
  }),

  http.get('/api/airports', ({ request }) => {
    const url = new URL(request.url);
    const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase();

    if (!keyword) {
      return HttpResponse.json({ data: [] });
    }

    const filtered = mockAirports.filter(
      (airport) =>
        airport.iataCode.toLowerCase().includes(keyword) ||
        airport.name.toLowerCase().includes(keyword) ||
        airport.city.toLowerCase().includes(keyword)
    );

    // Map to Amadeus-shaped response so airportService.mapLocation works
    const data = filtered.map((airport) => ({
      iataCode: airport.iataCode,
      name: airport.name,
      address: {
        cityName: airport.city,
        countryName: airport.country,
        countryCode: airport.countryCode,
      },
    }));

    return HttpResponse.json({ data });
  }),
];
