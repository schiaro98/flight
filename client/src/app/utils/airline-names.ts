// Common airline IATA code → full name mapping
const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  AF: 'Air France',
  AY: 'Finnair',
  AZ: 'ITA Airways',
  BA: 'British Airways',
  DL: 'Delta Air Lines',
  EI: 'Aer Lingus',
  EK: 'Emirates',
  EW: 'Eurowings',
  FR: 'Ryanair',
  IB: 'Iberia',
  KL: 'KLM',
  KM: 'Air Malta',
  LH: 'Lufthansa',
  LO: 'LOT Polish Airlines',
  LX: 'Swiss',
  MS: 'EgyptAir',
  OS: 'Austrian Airlines',
  QR: 'Qatar Airways',
  SK: 'SAS',
  SN: 'Brussels Airlines',
  TK: 'Turkish Airlines',
  TP: 'TAP Air Portugal',
  U2: 'easyJet',
  UA: 'United Airlines',
  VL: 'Volotea',
  VY: 'Vueling',
  W6: 'Wizz Air',
  WS: 'WestJet',
  ZZ: 'IndiGo',
};

export function getAirlineName(iataCode: string): string {
  return AIRLINE_NAMES[iataCode.toUpperCase()] ?? iataCode;
}
