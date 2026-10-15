import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Tone = 'primary' | 'lime' | 'warning';

interface ProgressBarProps {
  value: number;
  label: string;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
  showLabel?: boolean;
  valueText?: string;
}

const FILL: Record<Tone, string> = {
  primary: 'bg-linear-to-r from-primary to-emerald',
  lime: 'bg-lime',
  warning: 'bg-warning',
};

const HEIGHT = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

export function ProgressBar({ value, label, tone = 'primary', size = 'md', onDark = false, showLabel = false, valueText }: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div>
      {showLabel && (
        <div className={`mb-1.5 flex items-center justify-between text-caption ${onDark ? 'text-white/75' : 'text-muted'}`}>
          <span>{label}</span>
          <span className={`font-semibold ${onDark ? 'text-white' : 'text-text'}`}>{valueText ?? `${pct}%`}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={valueText}
        className={`${HEIGHT[size]} w-full overflow-hidden rounded-full ${onDark ? 'bg-white/15' : 'bg-pale-mint'}`}
      >
        <motion.div
          className={`h-full rounded-full ${FILL[tone]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  onDark?: boolean;
  label: string;
  children?: ReactNode;
}

export function ProgressRing({ value, size = 88, stroke = 8, onDark = false, label, children }: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={onDark ? 'stroke-white/15' : 'stroke-pale-mint'} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          className={onDark ? 'stroke-lime' : 'stroke-emerald'}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
