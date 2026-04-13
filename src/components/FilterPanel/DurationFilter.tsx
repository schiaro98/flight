import React from 'react';

interface DurationFilterProps {
  value: number | null;
  onChange: (hours: number | null) => void;
  max?: number;
}

const DEFAULT_MAX = 24;

export function DurationFilter({ value, onChange, max = DEFAULT_MAX }: DurationFilterProps) {
  const hasLimit = value !== null;
  const sliderValue = value ?? max;

  const handleToggleLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange(null);
    } else {
      onChange(max);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!hasLimit}
          onChange={handleToggleLimit}
          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
        />
        <span className="text-sm text-gray-700">Nessun limite</span>
      </label>

      <div className={hasLimit ? '' : 'opacity-40 pointer-events-none'}>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Max durata</span>
          <span className="font-medium">{sliderValue}h</span>
        </div>
        <input
          type="range"
          min={1}
          max={max}
          value={sliderValue}
          onChange={handleSliderChange}
          disabled={!hasLimit}
          aria-label="Durata massima in ore"
          className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1h</span>
          <span>{max}h</span>
        </div>
      </div>
    </div>
  );
}
