import React from 'react';

export function PrimaryButton({ 
  children, 
  onClick, 
  disabled, 
  className = "",
  variant = 'green'
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean, 
  className?: string,
  variant?: 'green' | 'blue'
}) {
  const colorClasses = variant === 'blue' 
    ? "bg-macaw-blue hover:bg-[#178eb8] shadow-[0_2px_0_0_#178eb8] hover:shadow-[0_2px_0_0_#1CB0F6] active:shadow-[0_0_0_0_#178eb8]" 
    : "bg-feather-green hover:bg-mask-green shadow-[0_2px_0_0_#46a302] hover:shadow-[0_2px_0_0_#5c9910] active:shadow-[0_0_0_0_#46a302]";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colorClasses} text-white px-10 py-3.5 text-[17px] rounded-full font-bold transition-all active:scale-95 hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ 
  children, 
  onClick, 
  disabled, 
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean, 
  className?: string 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-10 py-3 text-[17px] rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
