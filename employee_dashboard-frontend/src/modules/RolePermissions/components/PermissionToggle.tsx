/**
 * PermissionToggle Component
 * Accessible checkbox control with locked/disabled state support.
 */

import React from 'react';

interface PermissionToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  isLocked?: boolean;
  indeterminate?: boolean;
  label?: string;
  size?: 'sm' | 'md';
  title?: string;
}

export const PermissionToggle: React.FC<PermissionToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  isLocked = false,
  indeterminate = false,
  label,
  title,
}) => {
  return (
    <div className="inline-flex items-center gap-2 select-none" title={title}>
      <input
        type="checkbox"
        checked={checked}
        aria-label={title}
        ref={(element) => {
          if (element) element.indeterminate = indeterminate;
        }}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled || isLocked}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {label && (
        <span
          className={`text-xs font-medium ${
            disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default PermissionToggle;
