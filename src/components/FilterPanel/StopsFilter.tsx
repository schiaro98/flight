type StopOption = 'direct' | '1-stop' | '2+';

interface StopsFilterProps {
  value: StopOption[];
  onChange: (stops: StopOption[]) => void;
}

const STOP_OPTIONS: { value: StopOption; label: string }[] = [
  { value: 'direct', label: 'Diretto' },
  { value: '1-stop', label: '1 Scalo' },
  { value: '2+', label: '2+ Scali' },
];

export function StopsFilter({ value, onChange }: StopsFilterProps) {
  const toggle = (stop: StopOption) => {
    if (value.includes(stop)) {
      onChange(value.filter((s) => s !== stop));
    } else {
      onChange([...value, stop]);
    }
  };

  return (
    <div className="space-y-2">
      {STOP_OPTIONS.map(({ value: stop, label }) => (
        <label key={stop} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.includes(stop)}
            onChange={() => toggle(stop)}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
        </label>
      ))}
    </div>
  );
}
