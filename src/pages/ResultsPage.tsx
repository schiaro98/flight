import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deserializeSearchParams } from '../utils/urlSerializer';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { useFilteredResults } from '../hooks/useFilteredResults';
import { SearchForm } from '../components/SearchForm/SearchForm';
import { FilterPanel } from '../components/FilterPanel/FilterPanel';
import { FlightResultList } from '../components/FlightResults/FlightResultList';

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const parsedParams = deserializeSearchParams(searchParams);

  const { data: results = [], isLoading, isError, error } = useFlightSearch();
  const filteredResults = useFilteredResults(results);

  const [filterOpen, setFilterOpen] = useState(false);

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : 'An error occurred while fetching flights.'
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact search bar at top */}
      <header className="bg-blue-700 px-4 py-4">
        <div className="mx-auto max-w-5xl">
          <SearchForm isLoading={isLoading} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Mobile: filter toggle button */}
        <div className="mb-4 md:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            {filterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Filter sidebar */}
          <aside
            className={`w-full md:w-72 md:shrink-0 ${filterOpen ? 'block' : 'hidden'} md:block`}
          >
            <FilterPanel results={results} />
          </aside>

          {/* Results area */}
          <section className="min-w-0 flex-1">
            {parsedParams === null && !isLoading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-lg font-semibold text-gray-700">Invalid search parameters</p>
                <p className="mt-2 text-sm text-gray-500">
                  Please go back and fill in the search form.
                </p>
              </div>
            ) : (
              <FlightResultList
                results={filteredResults}
                isLoading={isLoading}
                error={errorMessage}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ResultsPage;
