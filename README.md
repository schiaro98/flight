# ✈️ Flight Search App

A single-page application for searching flights and filtering results — built with Angular, TypeScript, and the Duffel API.

## Features

- **Flight search** — origin/destination autocomplete (IATA codes), trip type (one-way, round-trip, multi-city), passengers, cabin class
- **Results page** — sortable list with airline, times, duration, stops, and total price
- **Filters** — price range, stops, airline, departure time slot, max duration
- **URL-based state** — searches are shareable and browser back/forward works correctly
- **~8000 airports** bundled client-side — zero API calls for autocomplete

## Tech Stack

| Layer | Library |
|---|---|
| Frontend | Angular (standalone components, signals) |
| Routing | Angular Router |
| State | Angular Signals |
| HTTP | Angular HttpClient + RxJS |
| Styling | Tailwind CSS |
| Forms | Angular Reactive Forms |
| API | Vercel Functions (serverless) |
| Flight data | Duffel API |
| Hosting | Vercel |

## Project Structure

```
/
├── client/
│   ├── api/            ← Vercel serverless functions
│   │   └── flights.ts  ← GET /api/flights → Duffel
│   └── src/app/
│       ├── components/ ← SearchForm, FlightResults, FilterPanel
│       ├── pages/      ← HomeComponent, ResultsComponent
│       ├── services/   ← FlightService, AirportService
│       ├── store/      ← SearchStore (signals)
│       └── utils/      ← filter-utils, url-serializer
└── server/             ← Legacy Express server (not used in production)
```

## Getting Started

### Prerequisites

- Node.js ≥ 22 (LTS)
- npm ≥ 9
- Vercel CLI (`npm i -g vercel`)

### Install

```bash
cd client && npm install
```

### Run in development

```bash
cd client && npx vercel dev
```

This starts the Angular app and the serverless API functions together on `http://localhost:3000`, simulating the Vercel environment locally.

### Environment variables

Create `client/.env.local`:

```
DUFFEL_API_KEY=duffel_test_...
```

Get your key from [app.duffel.com](https://app.duffel.com) → **Developers → Access tokens**.

### Build

```bash
cd client && npm run build
```

## Deployment

The app deploys automatically to Vercel on every push to `main` via GitHub Actions.

Make sure the following are set in your Vercel project (**Settings → Environment Variables**):
- `DUFFEL_API_KEY`

And in GitHub (**Settings → Secrets → Actions**):
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Updating dependencies

### Client (Angular)

Angular packages must all be on the same version. Use `ng update` for a coordinated upgrade:

```bash
cd client

# Check what can be updated
npx ng update

# Update Angular core + CLI (updates all @angular/* together)
npx ng update @angular/core @angular/cli
```

For non-Angular packages:

```bash
cd client && npx npm-check-updates --reject '@angular/*' -u && npm install --legacy-peer-deps
```

## License

MIT — see [LICENSE](LICENSE).

---

## Roadmap / TODO

### New features
- [ ] Flexible destination search — search by country (e.g. "Italy" → top airports) or "Anywhere" (popular destinations worldwide)
- [ ] Flexible date search (±3/7 days from selected date)
- [ ] Price calendar (disabled — SSE not supported on Vercel Functions free tier)

### Robustness
- [ ] Handle browser back button between home and results
