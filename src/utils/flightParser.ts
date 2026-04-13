import type {
  AmadeusApiResponse,
  AmadeusFlightOffer,
  AmadeusSegment,
  AmadeusFareDetail,
  FlightResult,
  Itinerary,
  Segment,
  BaggageInfo,
} from '../types/flight';

/**
 * Maps a single AmadeusSegment to a normalized Segment.
 * Uses dictionaries for aircraft name lookup if available.
 */
function parseSegment(
  seg: AmadeusSegment,
  fareDetails: AmadeusFareDetail[] | undefined,
  dictionaries: AmadeusApiResponse['dictionaries']
): Segment {
  const aircraftCode = seg.aircraft?.code ?? '';
  const aircraft = dictionaries?.aircraft?.[aircraftCode] ?? aircraftCode;

  let baggage: BaggageInfo | undefined;
  if (fareDetails) {
    const detail = fareDetails.find((fd) => fd.segmentId === seg.id);
    if (detail) {
      baggage = {};
      if (detail.includedCheckedBags !== undefined) {
        baggage.includedCheckedBags = detail.includedCheckedBags;
      }
      if (detail.includedCabinBags !== undefined) {
        baggage.includedCabinBags = detail.includedCabinBags;
      }
      if (Object.keys(baggage).length === 0) {
        baggage = undefined;
      }
    }
  }

  return {
    departure: {
      iataCode: seg.departure.iataCode,
      terminal: seg.departure.terminal,
      at: seg.departure.at,
    },
    arrival: {
      iataCode: seg.arrival.iataCode,
      terminal: seg.arrival.terminal,
      at: seg.arrival.at,
    },
    carrierCode: seg.carrierCode,
    number: seg.number,
    aircraft,
    duration: seg.duration,
    numberOfStops: seg.numberOfStops ?? 0,
    ...(baggage ? { baggage } : {}),
  };
}

/**
 * Maps a single AmadeusFlightOffer to a normalized FlightResult.
 */
export function parseFlightOffer(
  offer: AmadeusFlightOffer,
  dictionaries?: AmadeusApiResponse['dictionaries']
): FlightResult {
  const fareDetails = offer.travelerPricings?.[0]?.fareDetailsBySegment;

  const itineraries: Itinerary[] = (offer.itineraries ?? []).map((itin) => ({
    duration: itin.duration,
    segments: (itin.segments ?? []).map((seg) =>
      parseSegment(seg, fareDetails, dictionaries)
    ),
  }));

  const rawPrice = offer.price ?? {};

  return {
    id: offer.id,
    itineraries,
    price: {
      currency: rawPrice.currency ?? '',
      total: rawPrice.total ?? '0',
      base: rawPrice.base ?? '0',
      fees: rawPrice.fees ?? [],
      grandTotal: rawPrice.grandTotal ?? rawPrice.total ?? '0',
    },
    validatingAirlineCodes: offer.validatingAirlineCodes ?? [],
    numberOfBookableSeats: offer.numberOfBookableSeats ?? 0,
  };
}

/**
 * Parses a raw Amadeus API response into an array of FlightResult.
 * Never throws — returns an empty array for any malformed input.
 */
export function parseAmadeusResponse(raw: unknown): FlightResult[] {
  try {
    if (
      raw === null ||
      typeof raw !== 'object' ||
      !Array.isArray((raw as Record<string, unknown>).data)
    ) {
      return [];
    }

    const response = raw as AmadeusApiResponse;
    const results: FlightResult[] = [];

    for (const offer of response.data) {
      try {
        results.push(parseFlightOffer(offer, response.dictionaries));
      } catch {
        // Skip malformed individual offers, continue with the rest
      }
    }

    return results;
  } catch {
    return [];
  }
}
