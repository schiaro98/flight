import { Router, type Request, type Response } from 'express';
import { Duffel } from '@duffel/api';

const router = Router();
const duffel = new Duffel({ token: process.env.DUFFEL_API_KEY ?? '' });

/**
 * GET /api/price-calendar
 * Query params: origin, destination, year, month, cabin, adults
 * Returns: Server-Sent Events stream of { date, minPrice, currency, isLowest }
 */
router.get('/', async (req: Request, res: Response) => {
  const { origin, destination, year, month, cabin, adults } = req.query as Record<string, string>;

  if (!origin || !destination || !year || !month) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  const y = parseInt(year, 10);
  const m = parseInt(month, 10); // 1-based
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const cabinClass = ({ ECONOMY: 'economy', PREMIUM_ECONOMY: 'premium_economy', BUSINESS: 'business', FIRST: 'first' }[cabin ?? 'ECONOMY'] ?? 'economy') as 'economy' | 'premium_economy' | 'business' | 'first';
  const adultsCount = parseInt(adults ?? '1', 10);

  // Build list of dates to query (skip past dates)
  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (date >= today) dates.push(date);
  }

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Query Duffel for each date with concurrency limit of 3
  const allResults: { date: string; minPrice: number | null; currency: string }[] = [];
  const chunks: string[][] = [];
  for (let i = 0; i < dates.length; i += 3) chunks.push(dates.slice(i, i + 3));

  // First pass: collect all results to compute average
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(async (date) => {
        try {
          const offerRequest = await duffel.offerRequests.create({
            slices: [{ origin, destination, departure_date: date, arrival_time: null, departure_time: null }],
            passengers: Array.from({ length: adultsCount }, () => ({ type: 'adult' as const })),
            cabin_class: cabinClass,
            return_offers: true,
          });

          const offers = offerRequest.data.offers ?? [];
          if (offers.length === 0) return { date, minPrice: null, currency: 'EUR' };

          const prices = offers.map((o) => parseFloat(o.total_amount));
          const minPrice = Math.min(...prices);
          const currency = offers[0].total_currency;
          return { date, minPrice, currency };
        } catch {
          return { date, minPrice: null, currency: 'EUR' };
        }
      })
    );
    allResults.push(...chunkResults);

    // Send chunk results immediately as they arrive
    const available = allResults.filter((e) => e.minPrice !== null).map((e) => e.minPrice as number);
    const avg = available.length > 0 ? available.reduce((a, b) => a + b, 0) / available.length : 0;

    for (const result of chunkResults) {
      const finalResult = {
        ...result,
        isLowest: result.minPrice !== null && result.minPrice < avg,
      };
      res.write(`data: ${JSON.stringify(finalResult)}\n\n`);
    }
  }

  // Fill in past dates as null and send them
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const found = allResults.find((r) => r.date === date);
    if (!found) {
      res.write(`data: ${JSON.stringify({ date, minPrice: null, currency: 'EUR', isLowest: false })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

export { router as priceCalendarRouter };
