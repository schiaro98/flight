# ✈️ Flight Search App

A single-page application for searching flights, filtering results, and browsing a price calendar — built with React 18, TypeScript, and the Amadeus Self-Service API.

## Features

- **Flight search** — origin/destination autocomplete (IATA codes), trip type (one-way, round-trip, multi-city), passengers, cabin class
- **Results page** — sortable list with airline, times, duration, stops, and total price
- **Filters** — price range, stops, airline, departure time slot, max duration
- **Price calendar** — highlights the cheapest days in the current and next month
- **URL-based state** — searches are shareable and browser back/forward works correctly
- **Mock layer** — MSW intercepts API calls in dev/test so no Amadeus credentials are needed to run locally

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| State | Zustand |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Mocking | MSW v2 |
| Testing | Vitest + React Testing Library + fast-check |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. API calls are intercepted by MSW and served from `src/services/mockData.ts` — no Amadeus credentials required.

### Build for production

```bash
npm run build
npm run preview
```

### Connect to the real Amadeus API

Create a `.env` file in the project root:

```env
VITE_AMADEUS_CLIENT_ID=your_client_id
VITE_AMADEUS_CLIENT_SECRET=your_client_secret
```

Then update `src/services/flightService.ts` and `src/services/airportService.ts` to use the env variables instead of the mock endpoints.

## Testing

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# Visual UI
npm run test:ui
```

The test suite includes **property-based tests** (via fast-check) covering 18 correctness properties — URL serialization round-trips, parser correctness, filter/sort invariants, form validation, and component rendering.

## Project Structure

```
src/
├── components/
│   ├── SearchForm/       # Search form and sub-components
│   ├── FlightResults/    # Result list, card, detail
│   ├── FilterPanel/      # Price, stops, airline, time, duration filters
│   ├── PriceCalendar/    # Calendar with price highlights
│   └── common/           # LoadingSpinner, ErrorMessage
├── hooks/                # useFlightSearch, useAirportSearch, useFilteredResults
├── mocks/                # MSW handlers and server setup
├── pages/                # HomePage, ResultsPage
├── services/             # flightService, airportService, mockData
├── store/                # Zustand stores (search, filter)
├── types/                # TypeScript interfaces
└── utils/                # urlSerializer, flightParser, filterUtils, priceCalendarUtils
```

## License

MIT — see [LICENSE](LICENSE).
