import { motion } from 'framer-motion';
import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  const groupId = useId();
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex w-full rounded-full border border-border bg-surface p-1 shadow-card sm:w-auto">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-caption font-semibold transition-colors sm:flex-none ${active ? 'text-white' : 'text-muted hover:text-text'}`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                className="absolute inset-0 rounded-full bg-forest"
                transition={{ type: 'spring', damping: 30, stiffness: 380 }}
              />
            )}
            <span className="relative">{opt.label}</span>
            {opt.count !== undefined && <span className={`relative ${active ? 'text-white/80' : 'text-muted'}`}>{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface FilterChipsProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function FilterChips<T extends string>({ options, value, onChange, ariaLabel }: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-caption font-semibold transition-colors ${
              active ? 'border-forest bg-forest text-white shadow-card' : 'border-border bg-surface text-text hover:border-primary/40 hover:bg-pale-mint'
            }`}
          >
            {Icon && <Icon size={15} aria-hidden="true" className={active ? 'text-lime' : 'text-primary'} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
