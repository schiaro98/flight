import type { PassengerCount } from '../../types/flight';

interface PassengerSelectorProps {
  value: PassengerCount;
  onChange: (passengers: PassengerCount) => void;
}

interface CounterRowProps {
  label: string;
  subLabel?: string;
  count: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

function CounterRow({ label, subLabel, count, min, max, onDecrement, onIncrement }: CounterRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={count <= min}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-medium text-gray-900">{count}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={count >= max}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
  const { adults, children, infants } = value;

  const update = (patch: Partial<PassengerCount>) => {
    const next = { ...value, ...patch };
    // Ensure infants never exceed adults after a change
    if (next.infants > next.adults) next.infants = next.adults;
    onChange(next);
  };

  return (
    <div className="w-full divide-y divide-gray-100">
      <CounterRow
        label="Adults"
        subLabel="Age 12+"
        count={adults}
        min={1}
        max={9}
        onDecrement={() => update({ adults: adults - 1 })}
        onIncrement={() => update({ adults: adults + 1 })}
      />
      <CounterRow
        label="Children"
        subLabel="Age 2–11"
        count={children}
        min={0}
        max={9}
        onDecrement={() => update({ children: children - 1 })}
        onIncrement={() => update({ children: children + 1 })}
      />
      <CounterRow
        label="Infants"
        subLabel="Under 2"
        count={infants}
        min={0}
        max={adults}
        onDecrement={() => update({ infants: infants - 1 })}
        onIncrement={() => update({ infants: infants + 1 })}
      />
    </div>
  );
}
