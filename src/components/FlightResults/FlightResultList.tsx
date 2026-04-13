import React, { useState } from 'react';
import type { FlightResult } from '../../types/flight';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { FlightResultCard } from './FlightResultCard';
import { FlightDetail } from './FlightDetail';

interface FlightResultListProps {
  results: FlightResult[];
  isLoading?: boolean;
  error?: string;
}

export const FlightResultList: React.FC<FlightResultListProps> = ({
  results,
  isLoading = false,
  error,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <ErrorMessage title="Search failed" message={error} />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-gray-700">No flights found</p>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search — different dates, nearby airports, or a flexible cabin class
          might reveal more options.
        </p>
      </div>
    );
  }

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const isSelected = selectedId === result.id;
        return (
          <div key={result.id}>
            <FlightResultCard
              result={result}
              onSelect={() => handleSelect(result.id)}
              isSelected={isSelected}
            />
            {isSelected && <FlightDetail result={result} />}
          </div>
        );
      })}
    </div>
  );
};

export default FlightResultList;
