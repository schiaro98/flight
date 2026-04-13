/**
 * Maps regional/small airports to nearby international airports
 * that have commercial flight availability on Duffel
 */
export const AIRPORT_MAPPING: Record<string, string> = {
  // Italian regional airports → nearest international hub
  AOI: 'BLQ', // Ancona → Bologna
  AOS: 'FCO', // Aosta → Rome
  BDS: 'MXP', // Bardolino → Milan Malpensa
  BRI: 'BRI', // Bari (keep as-is, it's international)
  BZO: 'VCE', // Bolzano → Venice
  CTA: 'CTA', // Catania (keep as-is, it's international)
  CIY: 'FCO', // Ciampino → Rome Fiumicino
  EGO: 'VCE', // Egna → Venice
  FRL: 'TRN', // Forlì → Turin
  GOA: 'MXP', // Genoa → Milan Malpensa
  LIN: 'MXP', // Milan Linate → Milan Malpensa
  MXP: 'MXP', // Milan Malpensa (keep as-is)
  NAP: 'NAP', // Naples (keep as-is, it's international)
  OLB: 'VCE', // Olbia → Venice
  PMF: 'FCO', // Perugia → Rome
  PSA: 'FCO', // Pisa → Rome (or Florence if available)
  PEG: 'FCO', // Perugia → Rome
  RMI: 'FCO', // Rimini → Rome Fiumicino
  TRN: 'TRN', // Turin (keep as-is, it's international)
  TSF: 'VCE', // Treviso → Venice
  VCE: 'VCE', // Venice (keep as-is, it's international)
  VRN: 'VCE', // Verona → Venice
  ZLD: 'MXP', // Zeltweg → Milan Malpensa
};

/**
 * Resolves an airport code to a Duffel-compatible airport
 * If the airport is not in the mapping, returns it as-is
 */
export function resolveAirport(iataCode: string): string {
  return AIRPORT_MAPPING[iataCode.toUpperCase()] ?? iataCode.toUpperCase();
}
