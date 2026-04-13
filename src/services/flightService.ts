import type { SearchParams, FlightResult } from '../types/flight';
import { serializeSearchParams } from '../utils/urlSerializer';

const FLIGHT_SEARCH_ENDPOINT = '/api/flights';
const TIMEOUT_MS = 10000;

interface FlightServiceError {
  error: string;
  message?: string;
  airport?: string;
}

export const flightService = {
  async search(params: SearchParams): Promise<FlightResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const queryString = serializeSearchParams(params).toString();
    const url = `${FLIGHT_SEARCH_ENDPOINT}?${queryString}`;

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as FlightServiceError;
        
        // Special handling for unsupported airports
        if (body.error === 'UNSUPPORTED_AIRPORT') {
          const err = new Error(body.message ?? 'Airport not supported');
          (err as any).code = 'UNSUPPORTED_AIRPORT';
          (err as any).airport = body.airport;
          throw err;
        }

        throw new Error(
          body.message ??
            `Flight search failed: HTTP ${response.status}`
        );
      }

      const data: FlightResult[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Flight search timed out. Please try again.');
      }
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
