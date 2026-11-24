import React from 'react';

interface DashboardAccessToggleProps {
  enabled: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export const DashboardAccessToggle: React.FC<DashboardAccessToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  label,
  size = 'md',
}) => {
  const switchSize = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6';
  const dotSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!enabled);
        }}
        className={`relative inline-flex ${switchSize} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span
          className={`pointer-events-none inline-block ${dotSize} transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            enabled ? translate : 'translate-x-0'
          }`}
        />
      </button>

      {label && (
        <span
          className={`text-xs font-medium cursor-pointer ${
            enabled ? 'text-blue-700' : 'text-slate-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onChange(!enabled);
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default DashboardAccessToggle;
