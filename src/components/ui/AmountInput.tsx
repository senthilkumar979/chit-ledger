'use client';

import { forwardRef, useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  formatAmountForEdit,
  formatAmountInputDisplay,
  parseAmountInput,
} from '@/utils/amount-input';

export interface AmountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string;
  error?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ label, error, value, onChange, onBlur, onFocus, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-') ?? generatedId;
    const [display, setDisplay] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (isFocused) return;
      if (value == null || Number.isNaN(value)) {
        setDisplay('');
        return;
      }
      setDisplay(formatAmountInputDisplay(value));
    }, [value, isFocused]);

    function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
      setIsFocused(true);
      if (value != null && !Number.isNaN(value)) {
        setDisplay(formatAmountForEdit(value));
      }
      onFocus?.(event);
    }

    function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
      setIsFocused(false);
      const parsed = parseAmountInput(display);
      if (parsed !== undefined) {
        setDisplay(formatAmountInputDisplay(parsed));
        onChange(parsed);
      } else {
        setDisplay('');
        onChange(undefined);
      }
      onBlur?.(event);
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const next = event.target.value;
      setDisplay(next);
      onChange(parseAmountInput(next));
    }

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-primary">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm tabular-nums',
            'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30',
            'transition-shadow duration-200',
            error && 'border-danger focus:ring-danger/30',
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  },
);

AmountInput.displayName = 'AmountInput';
