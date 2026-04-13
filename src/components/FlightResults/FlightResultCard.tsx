import React from 'react';
import type { FlightResult } from '../../types/flight';

interface FlightResultCardProps {
  result: FlightResult;
  onSelect: () => void;
  isSelected?: boolean;
}

/** Formats an ISO 8601 datetime string as "HH:MM" */
function formatTime(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Formats an ISO 8601 duration (e.g. "PT2H30M") as "2h 30m" */
export function formatDuration(isoDuration: string): string {
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Returns a human-readable stops label */
function formatStops(count: number): string {
  if (count === 0) return 'Direct';
  if (count === 1) return '1 stop';
  return `${count} stops`;
}

export const FlightResultCard: React.FC<FlightResultCardProps> = ({
  result,
  onSelect,
  isSelected = false,
}) => {
  const itinerary = result.itineraries[0];
  const segments = itinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stopCount = segments.length - 1;

  const airline = result.validatingAirlineCodes.join(', ');
  const departureTime = formatTime(firstSegment.departure.at);
  const arrivalTime = formatTime(lastSegment.arrival.at);
  const duration = formatDuration(itinerary.duration);
  const stops = formatStops(stopCount);
  const price = `${result.price.grandTotal} ${result.price.currency}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Airline */}
        <div className="w-16 text-sm font-semibold text-gray-700">{airline}</div>

        {/* Times and route */}
        <div className="flex flex-1 items-center gap-2 text-center">
          <span className="text-lg font-bold text-gray-900">{departureTime}</span>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-gray-500">{duration}</span>
            <div className="my-1 h-px w-full bg-gray-300" />
            <span className="text-xs text-gray-500">{stops}</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{arrivalTime}</span>
        </div>

        {/* Price */}
        <div className="text-right">
          <span className="text-xl font-bold text-blue-600">{price}</span>
        </div>
      </div>
    </button>
  );
};

export default FlightResultCard;
