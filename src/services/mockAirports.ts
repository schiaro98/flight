import type { Airport } from '../types/flight';

export const mockAirports: Airport[] = [
  { iataCode: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', countryCode: 'IT' },
  { iataCode: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR' },
  { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
  { iataCode: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', countryCode: 'ES' },
  { iataCode: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', countryCode: 'ES' },
  { iataCode: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', countryCode: 'IT' },
  { iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', countryCode: 'US' },
  { iataCode: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
  { iataCode: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  { iataCode: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', countryCode: 'AU' },
];
