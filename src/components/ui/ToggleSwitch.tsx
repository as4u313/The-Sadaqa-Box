import React from 'react';

export function ToggleSwitch({ 
  checked, 
  onChange, 
  label, 
  description,
  color = "green"
}: { 
  checked: boolean, 
  onChange: (c: boolean) => void, 
  label?: string, 
  description?: string,
  color?: "green" | "blue"
}) {
  const activeColor = color === "blue" ? "bg-[#1CB0F6] focus-visible:ring-[#178eb8]" : "bg-feather-green focus-visible:ring-mask-green";

  return (
    <div className="flex items-start gap-4 inline-flex">
      <button 
        type="button"
        role="switch" 
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${checked ? activeColor : 'bg-gray-200'}`}
      >
        <span 
          aria-hidden="true"
          className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
      {label && (
        <div className="flex flex-col">
          <span className="text-[17px] font-bold text-eel">{label}</span>
          {description && <span className="text-[15px] text-gray-500 font-medium mt-1">{description}</span>}
        </div>
      )}
    </div>
  );
}
