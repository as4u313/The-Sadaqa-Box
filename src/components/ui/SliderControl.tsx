import React from 'react';

export function SliderControl({ 
  steps, 
  value, 
  onChange,
  color = "green"
}: { 
  steps: string[], 
  value: number, 
  onChange: (idx: number) => void,
  color?: "green" | "blue"
}) {
  const activeBg = color === "blue" ? "bg-[#1CB0F6]" : "bg-feather-green";
  const activeBorder = color === "blue" ? "border-[#1CB0F6]" : "border-feather-green";

  return (
    <div className="relative pt-6 pb-12 sm:pb-6 px-1">
      <div className="absolute top-8 left-[10px] right-[10px] h-1.5 bg-gray-200 rounded-full"></div>
      <div 
        className={`absolute top-8 left-[10px] h-1.5 ${activeBg} rounded-full transition-all duration-300`}
        style={{ width: `calc(${(value / (steps.length - 1)) * 100}% - ${(value / (steps.length - 1)) * 20}px)` }}
      ></div>
      
      <div className="flex justify-between relative z-10 w-full">
        {steps.map((step, idx) => {
          const isSelected = value === idx;
          const isPast = value > idx;
          return (
            <div key={idx} className="flex flex-col items-center cursor-pointer group" onClick={() => onChange(idx)}>
              <div className={`w-5 h-5 rounded-full border-4 mb-4 transition-colors relative z-10 shadow-sm ${
                isSelected 
                  ? `bg-white ${activeBorder} w-6 h-6 -mt-0.5` 
                  : isPast 
                    ? `${activeBg} ${activeBorder}` 
                    : 'bg-gray-300 border-gray-300 group-hover:bg-gray-400 group-hover:border-gray-400'
              }`}>
              </div>
              <div className="relative">
                <span className={`text-[15px] font-bold ${isSelected ? 'opacity-0' : 'text-gray-400'}`}>{step}</span>
                {isSelected && (
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${activeBg} text-white text-[15px] font-bold px-4 py-1.5 rounded-xl whitespace-nowrap z-20 shadow-md`}>
                    {step}
                    <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 ${activeBg} rotate-45 -z-10 rounded-sm`}></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
