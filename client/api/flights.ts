import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({ token: process.env.DUFFEL_API_KEY ?? '' });

const SUPPORTED_AIRPORTS = new Set([
  'FCO', 'MXP', 'VCE', 'BLQ', 'NAP', 'CTA', 'TRN', 'PSA', 'VRN', 'TSF',
  'LHR', 'LGW', 'STN', 'LTN', 'CDG', 'ORY', 'AMS', 'FRA', 'DUS', 'BER',
  'MAD', 'BCN', 'SVQ', 'IBZ', 'AGP', 'PMI',
  'JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'DEN', 'SFO', 'SEA', 'MIA', 'BOS',
  'DXB', 'AUH', 'DOH', 'BKK', 'SIN', 'HKG', 'NRT', 'HND', 'ICN', 'PEK',
  'SYD', 'MEL', 'BNE', 'PER', 'ADL',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { origin, destination, dep, ret, type, adults, children, infants, cabin } =
    req.query as Record<string, string>;

  if (!origin || !destination || !dep) {
    return res.status(400).json({ error: 'Missing required parameters: origin, destination, dep' });
  }

  const originUpper = origin.toUpperCase();
  const destUpper = destination.toUpperCase();

  if (!SUPPORTED_AIRPORTS.has(originUpper)) {
    return res.status(400).json({
      error: 'UNSUPPORTED_AIRPORT',
      message: `Airport ${originUpper} is not supported.`,
      airport: originUpper,
    });
  }

  if (!SUPPORTED_AIRPORTS.has(destUpper)) {
    return res.status(400).json({
      error: 'UNSUPPORTED_AIRPORT',
      message: `Airport ${destUpper} is not supported.`,
      airport: destUpper,
    });
  }

  const adultsCount = parseInt(adults ?? '1', 10);
  const childrenCount = parseInt(children ?? '0', 10);
  const infantsCount = parseInt(infants ?? '0', 10);

  if (adultsCount + childrenCount + infantsCount > 9) {
    return res.status(400).json({ error: 'Total passengers cannot exceed 9.' });
  }

  const passengers = [
    ...Array.from({ length: adultsCount }, () => ({ type: 'adult' as const })),
    ...Array.from({ length: childrenCount }, () => ({ age: 10 })),
    ...Array.from({ length: infantsCount }, () => ({ age: 1 })),
  ];

  const slices = [
    { origin: originUpper, destination: destUpper, departure_date: dep, arrival_time: null, departure_time: null },
    ...(type === 'round-trip' && ret
      ? [{ origin: destUpper, destination: originUpper, departure_date: ret, arrival_time: null, departure_time: null }]
      : []),
  ];

  const cabinMap: Record<string, string> = {
    ECONOMY: 'economy', PREMIUM_ECONOMY: 'premium_economy', BUSINESS: 'business', FIRST: 'first',
  };
  const cabinClass = (cabinMap[cabin ?? 'ECONOMY'] ?? 'economy') as 'economy' | 'premium_economy' | 'business' | 'first';

  try {
    const offerRequest = await duffel.offerRequests.create({
      slices, passengers, cabin_class: cabinClass, return_offers: true,
    });

    const offers = offerRequest.data.offers ?? [];
    const results = offers.map((offer) => ({
      id: offer.id,
      itineraries: offer.slices.map((slice) => ({
        duration: slice.duration ?? 'PT0H',
        segments: slice.segments.map((seg) => ({
          departure: { iataCode: seg.origin.iata_code, terminal: seg.origin_terminal ?? undefined, at: seg.departing_at },
          arrival: { iataCode: seg.destination.iata_code, terminal: seg.destination_terminal ?? undefined, at: seg.arriving_at },
          carrierCode: seg.operating_carrier.iata_code ?? seg.marketing_carrier.iata_code,
          number: seg.marketing_carrier_flight_number,
          aircraft: seg.aircraft?.iata_code ?? '',
          duration: seg.duration ?? 'PT0H',
          numberOfStops: seg.stops?.length ?? 0,
          baggage: seg.passengers?.[0]?.baggages?.[0]
            ? { includedCheckedBags: { quantity: seg.passengers[0].baggages.filter((b: { type: string }) => b.type === 'checked').length } }
            : undefined,
        })),
      })),
      price: {
        currency: offer.total_currency,
        total: offer.total_amount,
        base: offer.base_amount ?? offer.total_amount,
        fees: offer.tax_amount ? [{ amount: offer.tax_amount, type: 'TAX' }] : [],
        grandTotal: offer.total_amount,
      },
      validatingAirlineCodes: [offer.slices[0]?.segments[0]?.marketing_carrier.iata_code ?? ''],
      numberOfBookableSeats: 9,
    }));

    return res.json(results);
  } catch (err) {
    console.error('[flights] Duffel error:', JSON.stringify(err, null, 2));
    const message = err instanceof Error ? err.message : 'Unknown error';
    const details = (err as any)?.errors?.[0]?.message ?? '';
    return res.status(502).json({ error: `Duffel API error: ${message}`, details });
  }
}
