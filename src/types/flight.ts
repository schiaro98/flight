// SearchForm → flightService
export interface SearchParams {
  origin: string;        // IATA code, es. "FCO"
  destination: string;   // IATA code, es. "LHR"
  departureDate: string; // ISO 8601, es. "2025-03-15"
  returnDate?: string;   // Solo per andata e ritorno
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  passengers: PassengerCount;
  cabinClass: CabinClass;
}

export interface PassengerCount {
  adults: number;   // ≥1
  children: number; // ≥0
  infants: number;  // ≥0, ≤ adults
}

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

// Risultato normalizzato (output del parser)
export interface FlightResult {
  id: string;
  itineraries: Itinerary[];
  price: Price;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

export interface Itinerary {
  duration: string;    // ISO 8601 duration, es. "PT2H30M"
  segments: Segment[];
}

export interface Segment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;       // Numero volo, es. "AZ123"
  aircraft: string;
  duration: string;
  numberOfStops: number;
  baggage?: BaggageInfo;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string; // ISO 8601 datetime
}

export interface Price {
  currency: string;
  total: string;      // Prezzo totale come stringa decimale
  base: string;
  fees: Fee[];
  grandTotal: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface BaggageInfo {
  includedCheckedBags?: { quantity: number };
  includedCabinBags?: { quantity: number };
}

export interface FilterState {
  priceRange: [number, number];
  stops: ('direct' | '1-stop' | '2+')[];
  airlines: string[];
  departureTimeSlots: ('morning' | 'afternoon' | 'evening' | 'night')[];
  maxDurationHours: number | null;
  sortBy: 'price' | 'duration' | 'departure' | 'arrival';
  sortOrder: 'asc' | 'desc';
}

export interface Airport {
  iataCode: string;    // "FCO"
  name: string;        // "Leonardo da Vinci International Airport"
  city: string;        // "Rome"
  country: string;     // "Italy"
  countryCode: string; // "IT"
}

export interface PriceCalendarEntry {
  date: string;             // ISO 8601 date
  minPrice: number | null;  // null = nessun volo disponibile
  currency: string;
  isLowest: boolean;        // true se sotto la media del periodo
}

// Raw Amadeus API response types (used by flightParser.ts)
export interface AmadeusFlightOffer {
  id: string;
  itineraries: AmadeusItinerary[];
  price: AmadeusPrice;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
  travelerPricings?: AmadeusTravelerPricing[];
}

export interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

export interface AmadeusSegment {
  departure: { iataCode: string; terminal?: string; at: string };
  arrival: { iataCode: string; terminal?: string; at: string };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  duration: string;
  numberOfStops: number;
  id: string;
}

export interface AmadeusPrice {
  currency: string;
  total: string;
  base: string;
  fees?: Array<{ amount: string; type: string }>;
  grandTotal: string;
}

export interface AmadeusTravelerPricing {
  travelerId: string;
  fareDetailsBySegment?: AmadeusFareDetail[];
}

export interface AmadeusFareDetail {
  segmentId: string;
  includedCheckedBags?: { quantity: number };
  includedCabinBags?: { quantity: number };
}

export interface AmadeusApiResponse {
  data: AmadeusFlightOffer[];
  dictionaries?: {
    carriers?: Record<string, string>;
    aircraft?: Record<string, string>;
    locations?: Record<string, { cityCode: string; countryCode: string }>;
  };
}
