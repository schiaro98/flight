import { Router, type Request, type Response } from 'express';
import { Duffel } from '@duffel/api';

const router = Router();

const duffel = new Duffel({
  token: process.env.DUFFEL_API_KEY ?? '',
});

// List of airports that Duffel supports (major international hubs)
const SUPPORTED_AIRPORTS = new Set([
  'FCO', 'MXP', 'VCE', 'BLQ', 'NAP', 'CTA', 'TRN', 'PSA', 'VRN', 'TSF',
  'LHR', 'LGW', 'STN', 'LTN', 'CDG', 'ORY', 'AMS', 'FRA', 'DUS', 'BER',
  'MAD', 'BCN', 'SVQ', 'IBZ', 'AGP', 'PMI', 'IBZ', 'SVQ',
  'JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'DEN', 'SFO', 'SEA', 'MIA', 'BOS',
  'DXB', 'AUH', 'DOH', 'BKK', 'SIN', 'HKG', 'NRT', 'HND', 'ICN', 'PEK',
  'SYD', 'MEL', 'BNE', 'PER', 'ADL',
]);

// Maps our SearchParams query string to a Duffel offer request
router.get('/', async (req: Request, res: Response) => {
  const {
    origin,
    destination,
    dep,
    ret,
    type,
    adults,
    children,
    infants,
    cabin,
  } = req.query as Record<string, string>;

  // Basic validation
  if (!origin || !destination || !dep) {
    res.status(400).json({ error: 'Missing required parameters: origin, destination, dep' });
    return;
  }

  const originUpper = origin.toUpperCase();
  const destUpper = destination.toUpperCase();

  // Check if airports are supported
  if (!SUPPORTED_AIRPORTS.has(originUpper)) {
    res.status(400).json({
      error: 'UNSUPPORTED_AIRPORT',
      message: `Airport ${originUpper} is not supported. Please choose a major international airport.`,
      airport: originUpper,
    });
    return;
  }

  if (!SUPPORTED_AIRPORTS.has(destUpper)) {
    res.status(400).json({
      error: 'UNSUPPORTED_AIRPORT',
      message: `Airport ${destUpper} is not supported. Please choose a major international airport.`,
      airport: destUpper,
    });
    return;
  }

  const adultsCount = parseInt(adults ?? '1', 10);
  const childrenCount = parseInt(children ?? '0', 10);
  const infantsCount = parseInt(infants ?? '0', 10);

  // Build passengers array for Duffel
  const passengers: { type?: 'adult'; age?: number }[] = [
    ...Array(adultsCount).fill({ type: 'adult' as const }),
    ...Array(childrenCount).fill({ age: 10 }), // children: 2-11
    ...Array(infantsCount).fill({ age: 1 }),    // infants: <2
  ];

  // Build slices
  const slices: { origin: string; destination: string; departure_date: string }[] = [
    { origin: originUpper, destination: destUpper, departure_date: dep },
  ];

  if (type === 'round-trip' && ret) {
    slices.push({ origin: destUpper, destination: originUpper, departure_date: ret });
  }

  // Map cabin class
  const cabinMap: Record<string, string> = {
    ECONOMY: 'economy',
    PREMIUM_ECONOMY: 'premium_economy',
    BUSINESS: 'business',
    FIRST: 'first',
  };
  const cabinClass = cabinMap[cabin ?? 'ECONOMY'] ?? 'economy';

  try {
    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class: cabinClass as 'economy' | 'premium_economy' | 'business' | 'first',
      return_offers: true,
    });

    const offers = offerRequest.data.offers ?? [];

    // Map Duffel offers → our FlightResult shape
    const results = offers.map((offer) => ({
      id: offer.id,
      itineraries: offer.slices.map((slice) => ({
        duration: slice.duration ?? 'PT0H',
        segments: slice.segments.map((seg) => ({
          departure: {
            iataCode: seg.origin.iata_code,
            terminal: seg.origin_terminal ?? undefined,
            at: seg.departing_at,
          },
          arrival: {
            iataCode: seg.destination.iata_code,
            terminal: seg.destination_terminal ?? undefined,
            at: seg.arriving_at,
          },
          carrierCode: seg.operating_carrier.iata_code ?? seg.marketing_carrier.iata_code,
          number: seg.marketing_carrier_flight_number,
          aircraft: seg.aircraft?.iata_code ?? '',
          duration: seg.duration ?? 'PT0H',
          numberOfStops: seg.stops?.length ?? 0,
          baggage: seg.passengers?.[0]?.baggages?.[0]
            ? {
                includedCheckedBags: {
                  quantity: seg.passengers[0].baggages.filter(
                    (b: { type: string }) => b.type === 'checked'
                  ).length,
                },
              }
            : undefined,
        })),
      })),
      price: {
        currency: offer.total_currency,
        total: offer.total_amount,
        base: offer.base_amount ?? offer.total_amount,
        fees: offer.tax_amount
          ? [{ amount: offer.tax_amount, type: 'TAX' }]
          : [],
        grandTotal: offer.total_amount,
      },
      validatingAirlineCodes: [
        offer.slices[0]?.segments[0]?.marketing_carrier.iata_code ?? '',
      ],
      numberOfBookableSeats: offer.available_services?.length ?? 9,
    }));

    res.json(results);
  } catch (err) {
    console.error('[flights] Duffel error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: `Duffel API error: ${message}` });
  }
});

export { router as flightsRouter };
