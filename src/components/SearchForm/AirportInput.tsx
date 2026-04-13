import { useState, useRef } from 'react';
import { useAirportSearch } from '../../hooks/useAirportSearch';
import type { Airport } from '../../types/flight';

interface AirportInputProps {
  value: string;
  onChange: (iataCode: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function AirportInput({ value, onChange, placeholder, label, error }: AirportInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { airports, isLoading } = useAirportSearch(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (airport: Airport) => {
    setInputValue(`${airport.iataCode} — ${airport.city}`);
    onChange(airport.iataCode);
    setIsOpen(false);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (inputValue.length >= 2) setIsOpen(true);
  };

  const showDropdown = isOpen && (airports.length > 0 || isLoading);

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
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
