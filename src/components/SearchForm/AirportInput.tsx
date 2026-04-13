import { useState, useRef, useEffect } from 'react';
import { useAirportSearch } from '../../hooks/useAirportSearch';
import type { Airport } from '../../types/flight';

interface AirportInputProps {
  value: string;           // IATA code from the form (e.g. "AOI")
  onChange: (iataCode: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function AirportInput({ value, onChange, placeholder, label, error }: AirportInputProps) {
  // What the user sees in the text box
  const [displayValue, setDisplayValue] = useState('');
  // What we actually search for — only the raw typed text, not the formatted label
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { airports, isLoading } = useAirportSearch(searchQuery);

  // Sync display when the form value changes externally (e.g. swap button)
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      setSearchQuery('');
    }
    // If value changed to a different IATA and display doesn't already show it,
    // just show the IATA code — the user can re-search if they want
    else if (!displayValue.startsWith(value)) {
      setDisplayValue(value);
      setSearchQuery('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDisplayValue(text);
    setSearchQuery(text);   // only raw typed text goes to search
    setIsOpen(true);
    if (!text) onChange(''); // clear form value when input is cleared
  };

  const handleSelect = (airport: Airport) => {
    const label = `${airport.iataCode} — ${airport.city}`;
    setDisplayValue(label);
    setSearchQuery('');     // stop searching after selection
    onChange(airport.iataCode);
    setIsOpen(false);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (searchQuery.length >= 2) setIsOpen(true);
  };

  const showDropdown = isOpen && searchQuery.length >= 2 && (airports.length > 0 || isLoading);

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {showDropdown && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <li className="px-4 py-2 text-sm text-gray-500">Searching...</li>
          )}
          {airports.map((airport) => (
            <li
              key={airport.iataCode}
              onMouseDown={() => handleSelect(airport)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between gap-2"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{airport.name}</span>
                <span className="text-xs text-gray-500">{airport.city}, {airport.country}</span>
              </div>
              <span className="text-sm font-bold text-blue-600 shrink-0">{airport.iataCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
