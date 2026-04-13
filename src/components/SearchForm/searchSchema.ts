import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const searchParamsSchema = z
  .object({
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    departureDate: z
      .string()
      .regex(isoDateRegex, 'Departure date must be a valid ISO date (YYYY-MM-DD)'),
    returnDate: z
      .string()
      .regex(isoDateRegex, 'Return date must be a valid ISO date (YYYY-MM-DD)')
      .optional(),
    tripType: z.enum(['one-way', 'round-trip', 'multi-city']),
    passengers: z.object({
      adults: z.number().int().min(1, 'At least 1 adult is required'),
      children: z.number().int().min(0, 'Children count cannot be negative'),
      infants: z.number().int().min(0, 'Infants count cannot be negative'),
    }),
    cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  })
  .refine((data) => data.origin !== data.destination, {
    message: 'Origin and destination must be different',
    path: ['destination'],
  })
  .refine(
    (data) => {
      if (data.returnDate === undefined) return true;
      return data.returnDate >= data.departureDate;
    },
    {
      message: 'Return date must be on or after departure date',
      path: ['returnDate'],
    }
  )
  .refine((data) => data.passengers.infants <= data.passengers.adults, {
    message: 'Number of infants cannot exceed number of adults',
    path: ['passengers', 'infants'],
  });

export type SearchParamsFormValues = z.infer<typeof searchParamsSchema>;
