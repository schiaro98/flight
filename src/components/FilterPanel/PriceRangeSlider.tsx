import React from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [minVal, maxVal] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal - 1);
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal + 1);
    onChange([minVal, newMax]);
  };

  const minPercent = max > min ? ((minVal - min) / (max - min)) * 100 : 0;
  const maxPercent = max > min ? ((maxVal - min) / (max - min)) * 100 : 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{minVal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
        <span>{maxVal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full">
        {/* Track background */}
        <div className="absolute inset-0 rounded-full bg-gray-200" />
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-blue-500"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          aria-label="Prezzo minimo"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />
        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          aria-label="Prezzo massimo"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Thumb indicators — outside the overflow-hidden wrapper */}
      <div className="relative h-0">
        <div
          className="absolute -top-3 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow pointer-events-none"
          style={{ left: `calc(${minPercent}% - 8px)` }}
        />
        <div
          className="absolute -top-3 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow pointer-events-none"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>{min.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
        <span>{max.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}
