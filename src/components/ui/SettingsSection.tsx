import React from 'react';

export function SettingsSection({ 
  title, 
  description, 
  children, 
  titleToggle 
}: { 
  title?: React.ReactNode, 
  description?: string, 
  children: React.ReactNode, 
  titleToggle?: React.ReactNode 
}) {
  return (
    <div className="py-12 border-b border-gray-100 last:border-0 first:pt-4">
      <div className="flex items-center gap-4 mb-3">
         {titleToggle}
         {title && <h3 className="text-[22px] font-bold text-eel tracking-tight">{title}</h3>}
      </div>
      {description && (
        <p className="text-[16px] text-gray-600 font-medium mb-8 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
      <div>
        {children}
      </div>
    </div>
  );
}
