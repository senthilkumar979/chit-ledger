'use client';

import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';

const CUSTOM_SENTINEL = '__custom__';

export interface SelectWithCustomOption {
  value: string;
  label: string;
}

export interface SelectWithCustomProps {
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  options: SelectWithCustomOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  customOptionLabel?: string;
  customInputPlaceholder?: string;
}

export function SelectWithCustom({
  label,
  error,
  id,
  name,
  options,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'Select…',
  customOptionLabel = 'Enter custom…',
  customInputPlaceholder = 'Type a name',
}: SelectWithCustomProps) {
  const generatedId = useId();
  const fieldId = id ?? label?.toLowerCase().replace(/\s/g, '-') ?? generatedId;
  const selectId = `${fieldId}-select`;
  const customInputId = `${fieldId}-custom`;

  const optionValues = new Set(options.map((o) => o.value));
  const isPresetValue = value !== '' && optionValues.has(value);

  const [isCustomMode, setIsCustomMode] = useState(() => value !== '' && !optionValues.has(value));

  useEffect(() => {
    if (!value) return;
    setIsCustomMode(!optionValues.has(value));
  }, [value, options]);

  const selectValue = isCustomMode ? CUSTOM_SENTINEL : value;

  function handleSelectChange(next: string) {
    if (next === CUSTOM_SENTINEL) {
      setIsCustomMode(true);
      if (isPresetValue) onChange('');
      return;
    }
    setIsCustomMode(false);
    onChange(next);
  }

  const fieldClassName = cn(
    'flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm',
    'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30',
    'transition-shadow duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    error && 'border-danger focus:ring-danger/30',
  );

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-primary">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        disabled={disabled}
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        onBlur={onBlur}
        className={fieldClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        <option value={CUSTOM_SENTINEL}>{customOptionLabel}</option>
      </select>
      {isCustomMode ? (
        <input
          id={customInputId}
          name={name}
          type="text"
          disabled={disabled}
          value={value}
          placeholder={customInputPlaceholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={fieldClassName}
          aria-label={label ? `${label} (custom)` : 'Custom value'}
          aria-invalid={Boolean(error)}
        />
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
