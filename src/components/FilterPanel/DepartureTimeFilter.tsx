type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

interface DepartureTimeFilterProps {
  value: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

const TIME_SLOTS: { value: TimeSlot; label: string; range: string }[] = [
  { value: 'morning', label: 'Mattina', range: '06:00 – 12:00' },
  { value: 'afternoon', label: 'Pomeriggio', range: '12:00 – 18:00' },
  { value: 'evening', label: 'Sera', range: '18:00 – 24:00' },
  { value: 'night', label: 'Notte', range: '00:00 – 06:00' },
];

export function DepartureTimeFilter({ value, onChange }: DepartureTimeFilterProps) {
  const toggle = (slot: TimeSlot) => {
    if (value.includes(slot)) {
      onChange(value.filter((s) => s !== slot));
    } else {
      onChange([...value, slot]);
    }
  };

  return (
    <div className="space-y-2">
      {TIME_SLOTS.map(({ value: slot, label, range }) => (
        <label key={slot} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.includes(slot)}
            onChange={() => toggle(slot)}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            {label}
            <span className="ml-1 text-xs text-gray-400">({range})</span>
          </span>
        </label>
      ))}
    </div>
  );
}
