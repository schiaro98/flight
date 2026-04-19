# ✈️ Flight Search App

A single-page application for searching flights, filtering results, and browsing a price calendar — built with Angular 18, TypeScript, and the Duffel API.

## Features

- **Flight search** — origin/destination autocomplete (IATA codes), trip type (one-way, round-trip, multi-city), passengers, cabin class
- **Results page** — sortable list with airline, times, duration, stops, and total price
- **Filters** — price range, stops, airline, departure time slot, max duration
- **URL-based state** — searches are shareable and browser back/forward works correctly
- **~8000 airports** bundled client-side — zero API calls for autocomplete

## Tech Stack

| Layer | Library |
|---|---|
| Frontend | Angular 18 (standalone components, signals) |
| Routing | Angular Router |
| State | Angular Signals |
| HTTP | Angular HttpClient + RxJS |
| Styling | Tailwind CSS |
| Forms | Angular Reactive Forms |
| Backend | Node.js + Express + TypeScript |
| Flight data | Duffel API |

## Project Structure

```
/
├── client/             ← Angular frontend (porta 4200)
│   └── src/app/
│       ├── components/ ← SearchForm, FlightResults, FilterPanel
│       ├── pages/      ← HomeComponent, ResultsComponent
│       ├── services/   ← FlightService, AirportService
│       ├── store/      ← SearchStore (signals)
│       └── utils/      ← filter-utils, url-serializer
└── server/             ← Express backend (porta 3001)
    └── src/
        ├── routes/     ← /api/flights → Duffel
        └── index.ts
```

## Getting Started

### Prerequisites

- Node.js ≥ 22 (LTS)
- npm ≥ 9

### Install

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### Run in development

```bash
# Terminale 1 — backend (porta 3001)
cd server && npm run dev

# Terminale 2 — frontend (porta 4200)
cd client && npm start
```

### Ottenere la Duffel API key

1. Registrati su [app.duffel.com](https://app.duffel.com)
2. Vai su **Developers → Access tokens**
3. Crea un token di test (`duffel_test_...`)
4. Crea `server/.env` (vedi `server/.env.example`) e aggiungi `DUFFEL_API_KEY`

### Build per produzione

```bash
cd client && npm run build
cd server && npm run build && npm start
```

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

### Server

```bash
cd server && npx npm-check-updates -u && npm install
```

> After upgrading, test the app locally before committing.

## License

MIT — see [LICENSE](LICENSE).

---

## Roadmap / TODO

### New features
- [ ] Search by country as origin/destination (e.g. "Italy" → all Italian airports)
- [ ] "Anywhere" destination — show best deals to any destination
- [ ] Flexible date search (±3/7 days from selected date)
- [x] Hide flights with departure time in the past (already-departed flights on today's searches)

### Robustezza
- [ ] Gestione back button del browser tra homepage e risultati
- [ ] Gestione OAuth2 token refresh per Amadeus (se si vuole aggiungere come fonte alternativa)

### CI/CD
- [ ] Fixare il deploy automatico Vercel via GitHub Actions (path `client/client` issue)
- [ ] Fixare il deploy automatico Railway via GitHub Actions (token scaduto)

