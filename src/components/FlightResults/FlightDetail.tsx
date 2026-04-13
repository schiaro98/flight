import React from 'react';
import type { FlightResult, Segment } from '../../types/flight';
import { formatDuration } from './FlightResultCard';

interface FlightDetailProps {
  result: FlightResult;
}

function formatDateTime(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function SegmentRow({ segment }: { segment: Segment }) {
  const flightNumber = `${segment.carrierCode}${segment.number}`;
  const depTime = formatDateTime(segment.departure.at);
  const arrTime = formatDateTime(segment.arrival.at);
  const duration = formatDuration(segment.duration);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 p-3">
      {/* Flight number and duration */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-800">{flightNumber}</span>
        <span className="text-gray-500">{duration}</span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{depTime}</p>
          <p className="text-sm font-medium text-gray-700">{segment.departure.iataCode}</p>
          {segment.departure.terminal && (
            <p className="text-xs text-gray-400">Terminal {segment.departure.terminal}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center">
          <div className="h-px w-full bg-gray-300" />
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{arrTime}</p>
          <p className="text-sm font-medium text-gray-700">{segment.arrival.iataCode}</p>
          {segment.arrival.terminal && (
            <p className="text-xs text-gray-400">Terminal {segment.arrival.terminal}</p>
          )}
        </div>
      </div>

      {/* Baggage info */}
      {segment.baggage && (
        <div className="flex gap-4 text-xs text-gray-500">
          {segment.baggage.includedCheckedBags && (
            <span>
              ✓ {segment.baggage.includedCheckedBags.quantity} checked bag
              {segment.baggage.includedCheckedBags.quantity !== 1 ? 's' : ''} included
            </span>
          )}
          {segment.baggage.includedCabinBags && (
            <span>
              ✓ {segment.baggage.includedCabinBags.quantity} cabin bag
              {segment.baggage.includedCabinBags.quantity !== 1 ? 's' : ''} included
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const FlightDetail: React.FC<FlightDetailProps> = ({ result }) => {
  return (
    <div className="mt-2 space-y-4 rounded-lg border border-blue-100 bg-white p-4">
      {result.itineraries.map((itinerary, iIdx) => (
        <div key={iIdx}>
          {result.itineraries.length > 1 && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {iIdx === 0 ? 'Outbound' : 'Return'} · {formatDuration(itinerary.duration)}
            </p>
          )}
          <div className="space-y-2">
            {itinerary.segments.map((segment, sIdx) => (
              <SegmentRow key={sIdx} segment={segment} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightDetail;
