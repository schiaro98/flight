import type { FlightResult } from '../types/flight';

export const mockFlights: FlightResult[] = [
  // 1. FCO → LHR, diretto, Alitalia, mattina, economico
  {
    id: 'mock-001',
    itineraries: [
      {
        duration: 'PT2H35M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T07:15:00' },
            arrival: { iataCode: 'LHR', terminal: '2', at: '2025-06-15T09:50:00' },
            carrierCode: 'AZ',
            number: 'AZ204',
            aircraft: '320',
            duration: 'PT2H35M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '129.50',
      base: '99.00',
      fees: [{ amount: '30.50', type: 'SUPPLIER' }],
      grandTotal: '129.50',
    },
    validatingAirlineCodes: ['AZ'],
    numberOfBookableSeats: 9,
  },

  // 2. FCO → CDG, diretto, Air France, pomeriggio
  {
    id: 'mock-002',
    itineraries: [
      {
        duration: 'PT2H15M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T14:30:00' },
            arrival: { iataCode: 'CDG', terminal: '2E', at: '2025-06-15T16:45:00' },
            carrierCode: 'AF',
            number: 'AF1120',
            aircraft: '319',
            duration: 'PT2H15M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '154.80',
      base: '120.00',
      fees: [{ amount: '34.80', type: 'SUPPLIER' }],
      grandTotal: '154.80',
    },
    validatingAirlineCodes: ['AF'],
    numberOfBookableSeats: 4,
  },

  // 3. MXP → JFK, 1 scalo (LHR), British Airways, mattina
  {
    id: 'mock-003',
    itineraries: [
      {
        duration: 'PT13H45M',
        segments: [
          {
            departure: { iataCode: 'MXP', terminal: '1', at: '2025-06-15T08:00:00' },
            arrival: { iataCode: 'LHR', terminal: '5', at: '2025-06-15T09:30:00' },
            carrierCode: 'BA',
            number: 'BA562',
            aircraft: '320',
            duration: 'PT2H30M',
            numberOfStops: 0,
          },
          {
            departure: { iataCode: 'LHR', terminal: '5', at: '2025-06-15T11:30:00' },
            arrival: { iataCode: 'JFK', terminal: '7', at: '2025-06-15T14:45:00' },
            carrierCode: 'BA',
            number: 'BA117',
            aircraft: '777',
            duration: 'PT8H15M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 1 }, includedCabinBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '689.00',
      base: '580.00',
      fees: [{ amount: '109.00', type: 'SUPPLIER' }],
      grandTotal: '689.00',
    },
    validatingAirlineCodes: ['BA'],
    numberOfBookableSeats: 6,
  },

  // 4. FCO → MAD, Ryanair, sera, low cost
  {
    id: 'mock-004',
    itineraries: [
      {
        duration: 'PT3H10M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T19:45:00' },
            arrival: { iataCode: 'MAD', terminal: '1', at: '2025-06-15T22:55:00' },
            carrierCode: 'FR',
            number: 'FR9842',
            aircraft: '738',
            duration: 'PT3H10M',
            numberOfStops: 0,
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '49.99',
      base: '29.99',
      fees: [{ amount: '20.00', type: 'SUPPLIER' }],
      grandTotal: '49.99',
    },
    validatingAirlineCodes: ['FR'],
    numberOfBookableSeats: 12,
  },

  // 5. FCO → BCN, Vueling, mattina presto
  {
    id: 'mock-005',
    itineraries: [
      {
        duration: 'PT2H25M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T06:05:00' },
            arrival: { iataCode: 'BCN', terminal: '1', at: '2025-06-15T08:30:00' },
            carrierCode: 'VY',
            number: 'VY6210',
            aircraft: '320',
            duration: 'PT2H25M',
            numberOfStops: 0,
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '89.90',
      base: '65.00',
      fees: [{ amount: '24.90', type: 'SUPPLIER' }],
      grandTotal: '89.90',
    },
    validatingAirlineCodes: ['VY'],
    numberOfBookableSeats: 7,
  },

  // 6. MXP → DXB, Emirates, notte, 1 scalo (FCO)
  {
    id: 'mock-006',
    itineraries: [
      {
        duration: 'PT9H30M',
        segments: [
          {
            departure: { iataCode: 'MXP', terminal: '1', at: '2025-06-15T22:00:00' },
            arrival: { iataCode: 'FCO', terminal: '3', at: '2025-06-15T23:10:00' },
            carrierCode: 'AZ',
            number: 'AZ1721',
            aircraft: '319',
            duration: 'PT1H10M',
            numberOfStops: 0,
          },
          {
            departure: { iataCode: 'FCO', terminal: '3', at: '2025-06-16T01:00:00' },
            arrival: { iataCode: 'DXB', terminal: '3', at: '2025-06-16T08:30:00' },
            carrierCode: 'EK',
            number: 'EK98',
            aircraft: '77W',
            duration: 'PT6H30M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 2 }, includedCabinBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '542.00',
      base: '440.00',
      fees: [{ amount: '102.00', type: 'SUPPLIER' }],
      grandTotal: '542.00',
    },
    validatingAirlineCodes: ['EK'],
    numberOfBookableSeats: 3,
  },

  // 7. FCO → AMS, KLM, pomeriggio, diretto
  {
    id: 'mock-007',
    itineraries: [
      {
        duration: 'PT2H50M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T15:20:00' },
            arrival: { iataCode: 'AMS', terminal: '2', at: '2025-06-15T18:10:00' },
            carrierCode: 'KL',
            number: 'KL1607',
            aircraft: '737',
            duration: 'PT2H50M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '198.40',
      base: '160.00',
      fees: [{ amount: '38.40', type: 'SUPPLIER' }],
      grandTotal: '198.40',
    },
    validatingAirlineCodes: ['KL'],
    numberOfBookableSeats: 5,
  },

  // 8. FCO → JFK, Lufthansa, 2+ scali (FRA + MUC), mattina
  {
    id: 'mock-008',
    itineraries: [
      {
        duration: 'PT15H20M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T07:30:00' },
            arrival: { iataCode: 'FRA', terminal: '1', at: '2025-06-15T09:45:00' },
            carrierCode: 'LH',
            number: 'LH241',
            aircraft: '319',
            duration: 'PT2H15M',
            numberOfStops: 0,
          },
          {
            departure: { iataCode: 'FRA', terminal: '1', at: '2025-06-15T11:30:00' },
            arrival: { iataCode: 'MUC', terminal: '2', at: '2025-06-15T12:30:00' },
            carrierCode: 'LH',
            number: 'LH102',
            aircraft: '320',
            duration: 'PT1H00M',
            numberOfStops: 0,
          },
          {
            departure: { iataCode: 'MUC', terminal: '2', at: '2025-06-15T14:00:00' },
            arrival: { iataCode: 'JFK', terminal: '1', at: '2025-06-15T17:50:00' },
            carrierCode: 'LH',
            number: 'LH410',
            aircraft: '747',
            duration: 'PT9H50M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 1 }, includedCabinBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '820.00',
      base: '700.00',
      fees: [{ amount: '120.00', type: 'SUPPLIER' }],
      grandTotal: '820.00',
    },
    validatingAirlineCodes: ['LH'],
    numberOfBookableSeats: 2,
  },

  // 9. FCO → MAD, Iberia, sera, diretto, business
  {
    id: 'mock-009',
    itineraries: [
      {
        duration: 'PT3H05M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T20:10:00' },
            arrival: { iataCode: 'MAD', terminal: '4', at: '2025-06-15T23:15:00' },
            carrierCode: 'IB',
            number: 'IB3254',
            aircraft: '321',
            duration: 'PT3H05M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 2 }, includedCabinBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '1249.00',
      base: '1100.00',
      fees: [{ amount: '149.00', type: 'SUPPLIER' }],
      grandTotal: '1249.00',
    },
    validatingAirlineCodes: ['IB'],
    numberOfBookableSeats: 2,
  },

  // 10. MXP → CDG, easyJet, mattina, low cost
  {
    id: 'mock-010',
    itineraries: [
      {
        duration: 'PT1H45M',
        segments: [
          {
            departure: { iataCode: 'MXP', terminal: '2', at: '2025-06-15T10:00:00' },
            arrival: { iataCode: 'CDG', terminal: '2B', at: '2025-06-15T11:45:00' },
            carrierCode: 'U2',
            number: 'U24521',
            aircraft: '320',
            duration: 'PT1H45M',
            numberOfStops: 0,
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '74.99',
      base: '54.99',
      fees: [{ amount: '20.00', type: 'SUPPLIER' }],
      grandTotal: '74.99',
    },
    validatingAirlineCodes: ['U2'],
    numberOfBookableSeats: 15,
  },

  // 11. FCO → LHR, British Airways, notte, 1 scalo (CDG)
  {
    id: 'mock-011',
    itineraries: [
      {
        duration: 'PT6H10M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '1', at: '2025-06-15T23:30:00' },
            arrival: { iataCode: 'CDG', terminal: '2F', at: '2025-06-16T01:45:00' },
            carrierCode: 'AF',
            number: 'AF1124',
            aircraft: '319',
            duration: 'PT2H15M',
            numberOfStops: 0,
          },
          {
            departure: { iataCode: 'CDG', terminal: '2F', at: '2025-06-16T03:30:00' },
            arrival: { iataCode: 'LHR', terminal: '5', at: '2025-06-16T03:40:00' },
            carrierCode: 'BA',
            number: 'BA303',
            aircraft: '320',
            duration: 'PT1H10M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '312.00',
      base: '260.00',
      fees: [{ amount: '52.00', type: 'SUPPLIER' }],
      grandTotal: '312.00',
    },
    validatingAirlineCodes: ['BA'],
    numberOfBookableSeats: 8,
  },

  // 12. FCO → DXB, Emirates, pomeriggio, diretto, premium
  {
    id: 'mock-012',
    itineraries: [
      {
        duration: 'PT5H45M',
        segments: [
          {
            departure: { iataCode: 'FCO', terminal: '3', at: '2025-06-15T13:00:00' },
            arrival: { iataCode: 'DXB', terminal: '3', at: '2025-06-15T21:45:00' },
            carrierCode: 'EK',
            number: 'EK97',
            aircraft: 'A380',
            duration: 'PT5H45M',
            numberOfStops: 0,
            baggage: { includedCheckedBags: { quantity: 2 }, includedCabinBags: { quantity: 1 } },
          },
        ],
      },
    ],
    price: {
      currency: 'EUR',
      total: '1489.00',
      base: '1300.00',
      fees: [{ amount: '189.00', type: 'SUPPLIER' }],
      grandTotal: '1489.00',
    },
    validatingAirlineCodes: ['EK'],
    numberOfBookableSeats: 1,
  },
];
