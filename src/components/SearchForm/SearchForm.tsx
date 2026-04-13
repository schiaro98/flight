import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { searchParamsSchema, type SearchParamsFormValues } from './searchSchema';
import { serializeSearchParams } from '../../utils/urlSerializer';
import { useSearchStore } from '../../store/searchStore';
import { AirportInput } from './AirportInput';
import { DatePicker } from './DatePicker';
import { PassengerSelector } from './PassengerSelector';
import { CabinClassSelect } from './CabinClassSelect';

const TRIP_TYPES: { value: SearchParamsFormValues['tripType']; label: string }[] = [
  { value: 'one-way', label: 'One Way' },
  { value: 'round-trip', label: 'Round Trip' },
  { value: 'multi-city', label: 'Multi-City' },
];

const DEFAULT_VALUES: SearchParamsFormValues = {
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: undefined,
  tripType: 'one-way',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'ECONOMY',
};

interface SearchFormProps {
  isLoading?: boolean;
}

export function SearchForm({ isLoading = false }: SearchFormProps) {
  const navigate = useNavigate();
  const swapOriginDestination = useSearchStore((s) => s.swapOriginDestination);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SearchParamsFormValues>({
    resolver: zodResolver(searchParamsSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const tripType = watch('tripType');
  const showReturnDate = tripType === 'round-trip' || tripType === 'multi-city';
  const departureDate = watch('departureDate');

  const handleSwap = () => {
    const origin = watch('origin');
    const destination = watch('destination');
    setValue('origin', destination, { shouldValidate: true });
    setValue('destination', origin, { shouldValidate: true });
    swapOriginDestination();
  };

  const onSubmit = (data: SearchParamsFormValues) => {
    const params = serializeSearchParams(data);
    navigate(`/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      {/* Trip type selector */}
      <div className="flex gap-2">
        <Controller
          name="tripType"
          control={control}
          render={({ field }) => (
            <>
              {TRIP_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => field.onChange(t.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    field.value === t.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}
        />
      </div>

      {/* Origin / Destination row */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Controller
            name="origin"
            control={control}
            render={({ field }) => (
              <AirportInput
                value={field.value}
                onChange={field.onChange}
                label="From"
                placeholder="City or airport"
                error={errors.origin?.message}
              />
            )}
          />
        </div>

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap origin and destination"
          className="mt-6 p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors shrink-0"
        >
          ⇄
        </button>

        <div className="flex-1">
          <Controller
            name="destination"
            control={control}
            render={({ field }) => (
              <AirportInput
                value={field.value}
                onChange={field.onChange}
                label="To"
                placeholder="City or airport"
                error={errors.destination?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Dates row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Controller
            name="departureDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label="Departure"
                min={new Date().toISOString().split('T')[0]}
                error={errors.departureDate?.message}
              />
            )}
          />
        </div>

        {showReturnDate && (
          <div className="flex-1">
            <Controller
              name="returnDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  label="Return"
                  min={departureDate || new Date().toISOString().split('T')[0]}
                  error={errors.returnDate?.message}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* Passengers + Cabin row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="block text-sm font-medium text-gray-700 mb-1">Passengers</p>
          <Controller
            name="passengers"
            control={control}
            render={({ field }) => (
              <PassengerSelector value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.passengers?.adults && (
            <p className="mt-1 text-sm text-red-600">{errors.passengers.adults.message}</p>
          )}
          {errors.passengers?.infants && (
            <p className="mt-1 text-sm text-red-600">{errors.passengers.infants.message}</p>
          )}
        </div>

        <div className="w-48 self-start">
          <Controller
            name="cabinClass"
            control={control}
            render={({ field }) => (
              <CabinClassSelect
                value={field.value}
                onChange={field.onChange}
                label="Cabin class"
              />
            )}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Searching…' : 'Search Flights'}
      </button>
    </form>
  );
}
