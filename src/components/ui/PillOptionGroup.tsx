import React from 'react';

export function PillOptionGroup({ 
  options, 
  selected, 
  onChange 
}: { 
  options: {label: string, value: string}[], 
  selected: string, 
  onChange: (val: string) => void 
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map(opt => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-12 py-3.5 rounded-full text-[17px] font-bold transition-all ${
              isSelected 
                ? 'bg-feather-green text-white border border-feather-green shadow-sm' 
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  );
}
