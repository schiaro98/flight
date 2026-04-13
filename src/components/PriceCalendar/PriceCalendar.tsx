import React, { useMemo } from 'react';
import { PriceCalendarEntry } from '../../types/flight';
import { computeIsLowest } from '../../utils/priceCalendarUtils';

interface PriceCalendarProps {
  entries: PriceCalendarEntry[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/** Returns ISO date string "YYYY-MM-DD" for a local Date */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns 0=Mon … 6=Sun offset for the first day of the month */
function firstDayOffset(year: number, month: number): number {
  const jsDay = getMonthStart(year, month).getDay(); // 0=Sun
  return (jsDay + 6) % 7; // convert to Mon=0
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface MonthGridProps {
  year: number;
  month: number;
  entryMap: Map<string, PriceCalendarEntry>;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function MonthGrid({ year, month, entryMap, selectedDate, onDateSelect }: MonthGridProps) {
  const offset = firstDayOffset(year, month);
  const days = daysInMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex-1 min-w-[280px]">
      <h3 className="text-center font-semibold text-gray-700 mb-2">
        {MONTH_NAMES[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-px text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = toISODate(new Date(year, month, day));
          const entry = entryMap.get(dateStr);
          const isSelected = dateStr === selectedDate;
          const isUnavailable = !entry || entry.minPrice === null;
          const isLowest = entry?.isLowest ?? false;

          let cellClass =
            'flex flex-col items-center justify-center rounded p-1 cursor-pointer transition-colors min-h-[48px] ';

          if (isSelected) {
            cellClass += 'bg-blue-600 text-white ';
          } else if (isUnavailable) {
            cellClass += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
          } else if (isLowest) {
            cellClass += 'bg-green-100 text-green-800 hover:bg-green-200 ';
          } else {
            cellClass += 'bg-white text-gray-700 hover:bg-blue-50 ';
          }

          return (
            <button
              key={dateStr}
              className={cellClass}
              disabled={isUnavailable}
              onClick={() => !isUnavailable && onDateSelect(dateStr)}
              aria-label={`${dateStr}${entry?.minPrice != null ? `, ${entry.currency} ${entry.minPrice}` : ', unavailable'}${isLowest ? ', lowest price' : ''}`}
              aria-pressed={isSelected}
            >
              <span className="font-medium">{day}</span>
              {entry?.minPrice != null ? (
                <span className="text-[10px] leading-tight">
                  {entry.currency} {entry.minPrice}
                </span>
              ) : (
                <span className="text-[10px] leading-tight text-gray-400">N/A</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PriceCalendar({ entries, selectedDate, onDateSelect }: PriceCalendarProps) {
  const enriched = useMemo(() => computeIsLowest(entries), [entries]);

  const entryMap = useMemo(() => {
    const map = new Map<string, PriceCalendarEntry>();
    for (const e of enriched) map.set(e.date, e);
    return map;
  }, [enriched]);

  // Derive the two months to show from selectedDate
  const base = useMemo(() => {
    const d = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [selectedDate]);

  const secondMonth = useMemo(() => {
    const m = base.month + 1;
    return m > 11
      ? { year: base.year + 1, month: 0 }
      : { year: base.year, month: m };
  }, [base]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap gap-6">
        <MonthGrid
          year={base.year}
          month={base.month}
          entryMap={entryMap}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
        <MonthGrid
          year={secondMonth.year}
          month={secondMonth.month}
          entryMap={entryMap}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
        />
      </div>
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-300" />
          Lowest price
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          Unavailable
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-blue-600" />
          Selected
        </span>
      </div>
    </div>
  );
}

export default PriceCalendar;
