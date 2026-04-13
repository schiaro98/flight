import type { Airport } from '../types/flight';

const AIRPORT_SEARCH_ENDPOINT = '/api/airports';

// Amadeus /v1/reference-data/locations response shape
interface AmadeusLocation {
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
    countryCode: string;
  };
}

interface AmadeusLocationsResponse {
  data: AmadeusLocation[];
}

function mapLocation(loc: AmadeusLocation): Airport {
  return {
    iataCode: loc.iataCode,
    name: loc.name,
    city: loc.address.cityName,
    country: loc.address.countryName,
    countryCode: loc.address.countryCode,
  };
}

export const airportService = {
  async search(query: string): Promise<Airport[]> {
    if (query.length < 2) {
      return [];
    }

    try {
      const url = `${AIRPORT_SEARCH_ENDPOINT}?keyword=${encodeURIComponent(query)}&subType=AIRPORT`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Airport search failed: HTTP ${response.status} ${response.statusText}`);
      }

      const raw: unknown = await response.json();
      const data = raw as AmadeusLocationsResponse;

      if (!data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map(mapLocation);
    } catch (error) {
      console.error('[airportService] Error searching airports:', error);
      return [];
    }
  },
};
