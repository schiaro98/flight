# Requirements Document

## Introduction

Flight Search App è una web application che consente agli utenti di cercare voli tra aeroporti di partenza e destinazione, filtrare i risultati per prezzo, durata e compagnia aerea, e visualizzare le migliori offerte disponibili. L'applicazione si comporta come un motore di ricerca voli autonomo, simile a Skyscanner, aggregando e presentando opzioni di volo in modo chiaro e navigabile.

## Glossary

- **Flight_Search_Engine**: Il sistema principale che gestisce le ricerche di voli e restituisce i risultati.
- **User**: L'utente finale che interagisce con la web application tramite browser.
- **Search_Form**: Il componente UI che raccoglie i parametri di ricerca inseriti dall'utente.
- **Flight_Result**: Un singolo risultato di volo restituito dalla ricerca, contenente compagnia aerea, orari, scali e prezzo.
- **Filter_Panel**: Il componente UI che permette di filtrare e ordinare i risultati di ricerca.
- **Price_Calendar**: Il componente che mostra la variazione dei prezzi per data.
- **Itinerary**: Una combinazione di voli (andata e/o ritorno) che costituisce un percorso completo.
- **Airport**: Un aeroporto identificato da codice IATA (es. FCO, LHR, JFK).
- **Cabin_Class**: La classe di viaggio selezionata (Economy, Premium Economy, Business, First).
- **Passenger**: Un viaggiatore incluso nella ricerca (adulto, bambino o neonato).

---

## Requirements

### Requirement 1: Ricerca Voli

**User Story:** Come utente, voglio inserire i parametri di ricerca (origine, destinazione, date, passeggeri, classe), così da ottenere una lista di voli disponibili.

#### Acceptance Criteria

1. THE Search_Form SHALL consentire all'utente di selezionare un Airport di partenza e uno di destinazione tramite autocompletamento per nome città o codice IATA.
2. THE Search_Form SHALL consentire la selezione della modalità di viaggio tra: solo andata, andata e ritorno, e multi-tratta.
3. WHEN l'utente seleziona la modalità "andata e ritorno", THE Search_Form SHALL richiedere sia la data di partenza che la data di ritorno.
4. THE Search_Form SHALL consentire la selezione del numero di passeggeri per categoria: adulti (≥12 anni), bambini (2–11 anni), neonati (<2 anni).
5. THE Search_Form SHALL consentire la selezione della Cabin_Class tra Economy, Premium Economy, Business e First.
6. WHEN l'utente avvia la ricerca con parametri validi, THE Flight_Search_Engine SHALL restituire i risultati entro 5 secondi.
7. IF l'utente avvia la ricerca senza aver selezionato Airport di partenza o destinazione, THEN THE Search_Form SHALL mostrare un messaggio di errore esplicito e impedire l'invio.
8. IF l'utente seleziona una data di ritorno precedente alla data di partenza, THEN THE Search_Form SHALL mostrare un messaggio di errore e impedire l'invio.

---

### Requirement 2: Visualizzazione Risultati

**User Story:** Come utente, voglio vedere una lista chiara di voli disponibili con informazioni essenziali, così da poter confrontare le opzioni rapidamente.

#### Acceptance Criteria

1. WHEN la ricerca restituisce risultati, THE Flight_Search_Engine SHALL mostrare ogni Flight_Result con: compagnia aerea, orario di partenza e arrivo, durata totale, numero di scali e prezzo totale per tutti i passeggeri.
2. THE Flight_Search_Engine SHALL ordinare i risultati per prezzo crescente come ordinamento predefinito.
3. WHEN la ricerca non produce risultati, THE Flight_Search_Engine SHALL mostrare un messaggio informativo e suggerire date o rotte alternative.
4. THE Flight_Search_Engine SHALL indicare chiaramente se un volo è diretto o con scali, specificando il numero e la durata degli scali.
5. WHEN l'utente seleziona un Flight_Result, THE Flight_Search_Engine SHALL mostrare il dettaglio completo dell'Itinerary, inclusi i singoli segmenti di volo, i numeri di volo e le informazioni sul bagaglio.

---

### Requirement 3: Filtri e Ordinamento

**User Story:** Come utente, voglio filtrare e ordinare i risultati di ricerca, così da trovare il volo più adatto alle mie esigenze.

#### Acceptance Criteria

1. THE Filter_Panel SHALL consentire il filtraggio dei risultati per fascia di prezzo tramite un range slider con valori minimo e massimo.
2. THE Filter_Panel SHALL consentire il filtraggio per numero di scali (diretto, 1 scalo, 2+ scali).
3. THE Filter_Panel SHALL consentire il filtraggio per compagnia aerea, con selezione multipla.
4. THE Filter_Panel SHALL consentire il filtraggio per orario di partenza tramite fasce orarie (mattina, pomeriggio, sera, notte).
5. THE Filter_Panel SHALL consentire il filtraggio per durata massima del volo in ore.
6. WHEN l'utente applica uno o più filtri, THE Flight_Search_Engine SHALL aggiornare la lista dei risultati entro 500ms senza ricaricare la pagina.
7. THE Filter_Panel SHALL consentire l'ordinamento dei risultati per: prezzo, durata, orario di partenza e orario di arrivo.
8. WHEN l'utente rimuove tutti i filtri, THE Flight_Search_Engine SHALL ripristinare la lista completa dei risultati originali.

---

### Requirement 4: Calendario Prezzi

**User Story:** Come utente, voglio vedere come variano i prezzi nelle date vicine a quelle selezionate, così da scegliere il momento più conveniente per viaggiare.

#### Acceptance Criteria

1. THE Price_Calendar SHALL mostrare il prezzo minimo disponibile per ogni giorno del mese corrente e del mese successivo rispetto alla data di partenza selezionata.
2. WHEN l'utente seleziona una data diversa nel Price_Calendar, THE Search_Form SHALL aggiornare automaticamente la data di partenza e avviare una nuova ricerca.
3. THE Price_Calendar SHALL evidenziare visivamente i giorni con i prezzi più bassi rispetto alla media del periodo visualizzato.
4. IF non sono disponibili voli per una data specifica, THEN THE Price_Calendar SHALL indicare quella data come non disponibile.

---

### Requirement 5: Gestione degli Aeroporti

**User Story:** Come utente, voglio cercare aeroporti per nome di città o codice IATA, così da trovare rapidamente l'aeroporto corretto.

#### Acceptance Criteria

1. WHEN l'utente digita almeno 2 caratteri nel campo Airport, THE Search_Form SHALL mostrare suggerimenti di autocompletamento entro 300ms.
2. THE Search_Form SHALL mostrare nei suggerimenti: nome dell'aeroporto, città, paese e codice IATA.
3. THE Search_Form SHALL supportare la ricerca per nome città, nome aeroporto e codice IATA.
4. IF l'utente seleziona lo stesso Airport sia come partenza che come destinazione, THEN THE Search_Form SHALL mostrare un messaggio di errore.
5. THE Search_Form SHALL supportare la funzione "scambia origine e destinazione" con un singolo click.

---

### Requirement 6: Esperienza Utente e Accessibilità

**User Story:** Come utente, voglio un'interfaccia intuitiva e reattiva, così da poter cercare voli comodamente da qualsiasi dispositivo.

#### Acceptance Criteria

1. THE Flight_Search_Engine SHALL rendere l'interfaccia completamente utilizzabile su dispositivi mobile con viewport a partire da 320px di larghezza.
2. THE Flight_Search_Engine SHALL mantenere lo stato della ricerca nell'URL, in modo che l'utente possa condividere o salvare la ricerca tramite link.
3. WHEN l'utente preme il tasto "indietro" del browser dopo aver visualizzato i risultati, THE Flight_Search_Engine SHALL ripristinare i parametri di ricerca precedenti.
4. THE Flight_Search_Engine SHALL mostrare un indicatore di caricamento visibile durante il recupero dei risultati.
5. WHILE la ricerca è in corso, THE Search_Form SHALL disabilitare il pulsante di ricerca per evitare invii multipli.

---

### Requirement 7: Integrazione Dati Voli

**User Story:** Come utente, voglio che i dati sui voli siano aggiornati e accurati, così da poter fare scelte informate.

#### Acceptance Criteria

1. THE Flight_Search_Engine SHALL recuperare i dati di volo da almeno una fonte esterna tramite API (es. Amadeus, Skyscanner API, o dati mock strutturati).
2. WHEN i dati di volo vengono recuperati dall'API esterna, THE Flight_Search_Engine SHALL effettuare il parsing della risposta e produrre una lista di Flight_Result strutturati.
3. FOR ALL risposte API valide, il parsing e la serializzazione dei dati SHALL produrre oggetti Flight_Result equivalenti se applicati in sequenza (proprietà round-trip).
4. IF l'API esterna non è raggiungibile, THEN THE Flight_Search_Engine SHALL mostrare un messaggio di errore all'utente e registrare l'errore nel log applicativo.
5. IF l'API esterna restituisce una risposta malformata, THEN THE Flight_Search_Engine SHALL gestire l'errore di parsing e mostrare un messaggio di errore descrittivo all'utente.
