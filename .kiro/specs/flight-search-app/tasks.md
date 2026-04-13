# Implementation Plan: Flight Search App

## Overview

Implementazione incrementale di una SPA React + TypeScript per la ricerca voli, partendo dalla struttura del progetto e dai tipi, fino all'integrazione completa con l'API Amadeus e il layer di mock MSW.

## Tasks

- [x] 1. Inizializzazione progetto e struttura base
  - Scaffolding con Vite + React 18 + TypeScript
  - Configurazione Tailwind CSS, React Router v6, Zustand, TanStack Query v5
  - Configurazione Vitest + React Testing Library + fast-check
  - Configurazione fast-check globale (numRuns: 100, verbose: true)
  - Creazione struttura cartelle: `components/`, `hooks/`, `store/`, `services/`, `types/`, `utils/`
  - _Requirements: 6.1, 7.1_

- [x] 2. Definizione tipi TypeScript e schema Zod
  - [x] 2.1 Creare `src/types/flight.ts` con tutte le interfacce principali
    - `SearchParams`, `PassengerCount`, `CabinClass`, `FlightResult`, `Itinerary`, `Segment`, `FlightEndpoint`, `Price`, `BaggageInfo`, `FilterState`, `Airport`, `PriceCalendarEntry`
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 3.1_
  - [x] 2.2 Creare `src/components/SearchForm/searchSchema.ts` con schema Zod per `SearchParams`
    - Validazione: origin ≠ destination, returnDate ≥ departureDate, adults ≥ 1, infants ≤ adults
    - _Requirements: 1.7, 1.8, 5.4_
  - [x] 2.3 Scrivere property test per validazione date (Property 12)
    - **Property 12: Validazione date — ritorno non precede partenza**
    - **Validates: Requirements 1.8**
  - [x] 2.4 Scrivere property test per validazione origin === destination (Property 13)
    - **Property 13: Validazione aeroporto — origine ≠ destinazione**
    - **Validates: Requirements 5.4**

- [x] 3. Implementazione URL serialization
  - [x] 3.1 Creare `src/utils/urlSerializer.ts`
    - `serializeSearchParams(params: SearchParams): URLSearchParams`
    - `deserializeSearchParams(search: URLSearchParams): SearchParams | null`
    - _Requirements: 6.2, 6.3_
  - [x] 3.2 Scrivere property test per round-trip serializzazione (Property 1)
    - **Property 1: Round-trip serializzazione SearchParams**
    - **Validates: Requirements 6.2**

- [x] 4. Implementazione dati mock e MSW
  - [x] 4.1 Creare `src/services/mockData.ts` con array di `FlightResult` strutturati
    - Almeno 10 voli mock con variazioni di prezzo, scali, compagnie e orari
    - _Requirements: 7.1_
  - [x] 4.2 Configurare MSW handler per `GET /api/flights` che restituisce i dati mock
    - _Requirements: 7.1_

- [x] 5. Implementazione parser Amadeus
  - [x] 5.1 Creare `src/utils/flightParser.ts`
    - Funzione `parseAmadeusResponse(raw: unknown): FlightResult[]`
    - Mapping `AmadeusFlightOffer` → `FlightResult` con gestione `dictionaries`
    - Gestione errori strutturata (no eccezioni non gestite)
    - _Requirements: 7.2, 7.5_
  - [x] 5.2 Scrivere property test per parsing risposta valida (Property 3)
    - **Property 3: Parsing produce FlightResult validi**
    - **Validates: Requirements 7.2**
  - [x] 5.3 Scrivere property test per gestione risposta malformata (Property 4)
    - **Property 4: Gestione risposta API malformata**
    - **Validates: Requirements 7.5**
  - [x] 5.4 Scrivere property test per round-trip FlightResult JSON (Property 2)
    - **Property 2: Round-trip FlightResult JSON**
    - **Validates: Requirements 7.3**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implementazione servizi API
  - [x] 7.1 Creare `src/services/flightService.ts`
    - `flightService.search(params: SearchParams): Promise<FlightResult[]>`
    - Chiamata a Amadeus `GET /v2/shopping/flight-offers` (o mock MSW in dev/test)
    - Gestione timeout 5s con `AbortController`, retry con backoff (delegato a TanStack Query)
    - _Requirements: 1.6, 7.1, 7.4_
  - [x] 7.2 Creare `src/services/airportService.ts`
    - `airportService.search(query: string): Promise<Airport[]>`
    - Chiamata a Amadeus `GET /v1/reference-data/locations` con `subType=AIRPORT`
    - Debounce 300ms, minimo 2 caratteri
    - _Requirements: 5.1, 5.3_

- [x] 8. Implementazione Zustand store
  - [x] 8.1 Creare `src/store/searchStore.ts`
    - Slice: `searchParams`, `setSearchParams`, `swapOriginDestination`
    - _Requirements: 5.5_
  - [x] 8.2 Scrivere property test per scambio origine/destinazione (Property 16)
    - **Property 16: Scambio origine/destinazione è corretto**
    - **Validates: Requirements 5.5**
  - [x] 8.3 Creare `src/store/filterStore.ts`
    - Slice: `filterState`, `setFilter`, `resetFilters`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_

- [x] 9. Implementazione logica di filtraggio e ordinamento
  - [x] 9.1 Creare `src/utils/filterUtils.ts`
    - `filterByPrice(results, [min, max])`, `filterByStops(results, stops[])`, `filterByAirline(results, airlines[])`, `filterByDepartureTime(results, slots[])`, `filterByDuration(results, maxHours)`, `sortResults(results, sortBy, sortOrder)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_
  - [x] 9.2 Scrivere property test per filtraggio prezzo (Property 5)
    - **Property 5: Filtraggio per prezzo è corretto**
    - **Validates: Requirements 3.1**
  - [x] 9.3 Scrivere property test per filtraggio scali (Property 6)
    - **Property 6: Filtraggio per scali è corretto**
    - **Validates: Requirements 3.2**
  - [x] 9.4 Scrivere property test per filtraggio compagnia (Property 7)
    - **Property 7: Filtraggio per compagnia è corretto**
    - **Validates: Requirements 3.3**
  - [x] 9.5 Scrivere property test per filtraggio fascia oraria (Property 8)
    - **Property 8: Filtraggio per fascia oraria è corretto**
    - **Validates: Requirements 3.4**
  - [x] 9.6 Scrivere property test per filtraggio durata (Property 9)
    - **Property 9: Filtraggio per durata massima è corretto**
    - **Validates: Requirements 3.5**
  - [x] 9.7 Scrivere property test per ordinamento (Property 10)
    - **Property 10: Ordinamento è corretto e preserva gli elementi**
    - **Validates: Requirements 2.2, 3.7**
  - [x] 9.8 Scrivere property test per reset filtri (Property 11)
    - **Property 11: Reset filtri ripristina la lista originale**
    - **Validates: Requirements 3.8**

- [x] 10. Implementazione hook TanStack Query
  - [x] 10.1 Creare `src/hooks/useFlightSearch.ts`
    - Legge `SearchParams` dall'URL tramite `deserializeSearchParams`
    - Chiama `flightService.search()`, gestisce loading/error states
    - _Requirements: 1.6, 7.4_
  - [x] 10.2 Creare `src/hooks/useAirportSearch.ts`
    - Chiama `airportService.search()` con debounce 300ms
    - _Requirements: 5.1_
  - [x] 10.3 Creare `src/hooks/useFilteredResults.ts`
    - Deriva i risultati filtrati e ordinati applicando `filterUtils` allo stato Zustand
    - _Requirements: 3.6, 3.8_

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implementazione componenti SearchForm
  - [x] 12.1 Creare `src/components/SearchForm/AirportInput.tsx`
    - Input con autocompletamento IATA, mostra nome aeroporto + città + paese + codice
    - Usa `useAirportSearch`, mostra suggerimenti entro 300ms
    - _Requirements: 1.1, 5.1, 5.2, 5.3_
  - [x] 12.2 Scrivere property test per autocompletamento aeroporti (Property 14)
    - **Property 14: Autocompletamento aeroporti — risultati coerenti con query**
    - **Validates: Requirements 1.1, 5.1, 5.3**
  - [x] 12.3 Scrivere property test per rendering suggerimento aeroporto (Property 15)
    - **Property 15: Rendering suggerimento aeroporto contiene tutti i campi**
    - **Validates: Requirements 5.2**
  - [x] 12.4 Creare `src/components/SearchForm/DatePicker.tsx`
    - Selezione date con validazione (returnDate ≥ departureDate)
    - _Requirements: 1.3, 1.8_
  - [x] 12.5 Creare `src/components/SearchForm/PassengerSelector.tsx`
    - Contatore adulti/bambini/neonati con vincoli (adults ≥ 1, infants ≤ adults)
    - _Requirements: 1.4_
  - [x] 12.6 Creare `src/components/SearchForm/CabinClassSelect.tsx`
    - Dropdown Economy / Premium Economy / Business / First
    - _Requirements: 1.5_
  - [x] 12.7 Creare `src/components/SearchForm/SearchForm.tsx`
    - Integra tutti i sotto-componenti, usa React Hook Form + Zod schema
    - Pulsante "scambia origine/destinazione", pulsante ricerca disabilitato durante loading
    - Serializza `SearchParams` nell'URL al submit
    - _Requirements: 1.2, 1.7, 5.5, 6.2, 6.5_

- [x] 13. Implementazione componenti FlightResults
  - [x] 13.1 Creare `src/components/common/LoadingSpinner.tsx` e `ErrorMessage.tsx`
    - _Requirements: 6.4, 7.4_
  - [x] 13.2 Creare `src/components/FlightResults/FlightResultCard.tsx`
    - Mostra: compagnia aerea, orario partenza/arrivo, durata totale, numero scali, prezzo totale
    - _Requirements: 2.1, 2.4_
  - [x] 13.3 Scrivere property test per rendering FlightResultCard (Property 18)
    - **Property 18: Rendering FlightResultCard contiene tutti i campi obbligatori**
    - **Validates: Requirements 2.1**
  - [x] 13.4 Creare `src/components/FlightResults/FlightDetail.tsx`
    - Dettaglio itinerario espanso: segmenti, numeri volo, informazioni bagaglio
    - _Requirements: 2.5_
  - [x] 13.5 Creare `src/components/FlightResults/FlightResultList.tsx`
    - Lista risultati con virtualizzazione, messaggio "nessun risultato" con suggerimenti
    - Avvolge `FlightResultCard`, gestisce click per espandere `FlightDetail`
    - _Requirements: 2.2, 2.3_

- [x] 14. Implementazione FilterPanel
  - [x] 14.1 Creare `src/components/FilterPanel/PriceRangeSlider.tsx`
    - Range slider con valori min/max derivati dai risultati
    - _Requirements: 3.1_
  - [x] 14.2 Creare `src/components/FilterPanel/StopsFilter.tsx`
    - Checkbox: diretto, 1 scalo, 2+ scali
    - _Requirements: 3.2_
  - [x] 14.3 Creare `src/components/FilterPanel/AirlineFilter.tsx`
    - Multi-select compagnie aeree presenti nei risultati
    - _Requirements: 3.3_
  - [x] 14.4 Creare `src/components/FilterPanel/DepartureTimeFilter.tsx`
    - Fasce orarie: mattina (06–12), pomeriggio (12–18), sera (18–24), notte (00–06)
    - _Requirements: 3.4_
  - [x] 14.5 Creare `src/components/FilterPanel/DurationFilter.tsx`
    - Slider durata massima in ore
    - _Requirements: 3.5_
  - [x] 14.6 Creare `src/components/FilterPanel/FilterPanel.tsx`
    - Contenitore che integra tutti i filtri + dropdown ordinamento + pulsante "reset filtri"
    - Aggiorna `filterStore` Zustand; i risultati si aggiornano entro 500ms senza reload
    - _Requirements: 3.6, 3.7, 3.8_

- [x] 15. Implementazione PriceCalendar
  - [x] 15.1 Creare `src/utils/priceCalendarUtils.ts`
    - `computeIsLowest(entries: PriceCalendarEntry[]): PriceCalendarEntry[]`
    - Flag `isLowest` = true se `minPrice` < media dei prezzi disponibili nel periodo
    - _Requirements: 4.3_
  - [x] 15.2 Scrivere property test per isLowest nel calendario (Property 17)
    - **Property 17: isLowest nel calendario è calcolato correttamente**
    - **Validates: Requirements 4.3**
  - [x] 15.3 Creare `src/components/PriceCalendar/PriceCalendar.tsx`
    - Griglia calendario mese corrente + mese successivo
    - Evidenzia giorni con prezzo più basso, indica date non disponibili
    - Click su data aggiorna `SearchForm` e avvia nuova ricerca
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 16. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Wiring finale — routing e layout
  - [x] 17.1 Configurare React Router v6 con route `/` (SearchForm) e `/results` (risultati)
    - Sincronizzazione URL ↔ Zustand store tramite `urlSerializer`
    - Gestione tasto "indietro" del browser
    - _Requirements: 6.2, 6.3_
  - [x] 17.2 Creare layout principale `App.tsx`
    - Integra `SearchForm`, `FilterPanel`, `FlightResultList`, `PriceCalendar`
    - `ErrorBoundary` attorno a `FlightResults`
    - Indicatore di caricamento globale durante fetch
    - _Requirements: 6.4, 7.4, 7.5_
  - [x] 17.3 Applicare responsive design con Tailwind CSS
    - Viewport minimo 320px, layout mobile-first
    - _Requirements: 6.1_

- [x] 18. Checkpoint finale — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- I task contrassegnati con `*` sono opzionali e possono essere saltati per un MVP più rapido
- Ogni task referenzia i requisiti specifici per la tracciabilità
- I property test usano fast-check con `numRuns: 100` come da configurazione globale
- I checkpoint garantiscono la validazione incrementale ad ogni fase
- Il mock MSW è intercambiabile con l'API Amadeus reale tramite variabile d'ambiente
