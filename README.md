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
# Frontend
npm install

# Backend
cd server && npm install
```

### Run in development

In due terminali separati:

```bash
# Terminale 1 — backend (porta 3001)
cd server
cp .env.example .env   # aggiungi la tua DUFFEL_API_KEY
npm run dev

# Terminale 2 — frontend (porta 5173)
npm run dev
```

Il frontend proxerà automaticamente `/api/flights` al backend. Gli aeroporti sono cercati client-side (nessuna chiamata API).

### Ottenere la Duffel API key

1. Registrati su [app.duffel.com](https://app.duffel.com)
2. Vai su **Developers → Access tokens**
3. Crea un token di test (`duffel_test_...`)
4. Aggiungilo a `server/.env` come `DUFFEL_API_KEY`

### Build per produzione

```bash
# Frontend
npm run build

# Backend
cd server && npm run build && npm start
```

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
