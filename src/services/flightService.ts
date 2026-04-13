import type { SearchParams, FlightResult } from '../types/flight';
import { serializeSearchParams } from '../utils/urlSerializer';
import { parseAmadeusResponse } from '../utils/flightParser';

const FLIGHT_SEARCH_ENDPOINT = '/api/flights';
const TIMEOUT_MS = 5000;

export const flightService = {
  async search(params: SearchParams): Promise<FlightResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const queryString = serializeSearchParams(params).toString();
    const url = `${FLIGHT_SEARCH_ENDPOINT}?${queryString}`;

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(
          `Flight search failed: HTTP ${response.status} ${response.statusText}`
        );
      }

      const raw: unknown = await response.json();
      return parseAmadeusResponse(raw);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new Error(
          'Flight search timed out after 5 seconds. Please try again.'
        );
        console.error('[flightService] Request timed out:', timeoutError);
        throw timeoutError;
      }

      if (error instanceof TypeError) {
        const networkError = new Error(
          `Network error during flight search: ${error.message}`
        );
        console.error('[flightService] Network error:', networkError);
        throw networkError;
      }

      console.error('[flightService] Error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
