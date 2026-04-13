interface AirlineFilterProps {
  airlines: string[];
  value: string[];
  onChange: (airlines: string[]) => void;
}

export function AirlineFilter({ airlines, value, onChange }: AirlineFilterProps) {
  const toggle = (airline: string) => {
    if (value.includes(airline)) {
      onChange(value.filter((a) => a !== airline));
    } else {
      onChange([...value, airline]);
    }
  };

  if (airlines.length === 0) {
    return <p className="text-sm text-gray-400 italic">Nessuna compagnia disponibile</p>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {airlines.map((airline) => (
        <label key={airline} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.includes(airline)}
            onChange={() => toggle(airline)}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{airline}</span>
        </label>
      ))}
    </div>
  );
}
