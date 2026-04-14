export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  passengers: PassengerCount;
  cabinClass: CabinClass;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface FlightResult {
  id: string;
  itineraries: Itinerary[];
  price: Price;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: string;
  duration: string;
  numberOfStops: number;
  baggage?: BaggageInfo;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Price {
  currency: string;
  total: string;
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
  iataCode: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export interface PriceCalendarEntry {
  date: string;
  minPrice: number | null;
  currency: string;
  isLowest: boolean;
}
