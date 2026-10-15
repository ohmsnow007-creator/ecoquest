import { Sparkles } from 'lucide-react';

interface XPBadgeProps {
  amount: number;
  plus?: boolean;
  variant?: 'soft' | 'onDark' | 'solid';
  className?: string;
}

const XP_VARIANT = {
  soft: 'bg-lime text-forest',
  onDark: 'bg-white/15 text-white',
  solid: 'bg-forest text-lime',
};

export function XPBadge({ amount, plus = false, variant = 'soft', className = '' }: XPBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-semibold whitespace-nowrap ${XP_VARIANT[variant]} ${className}`}>
      <Sparkles size={13} aria-hidden="true" />
      {plus ? '+' : ''}
      {amount.toLocaleString('th-TH')} XP
    </span>
  );
}

interface LevelBadgeProps {
  level: number;
  variant?: 'soft' | 'onDark';
  size?: 'sm' | 'lg';
}

export function LevelBadge({ level, variant = 'soft', size = 'sm' }: LevelBadgeProps) {
  const color = variant === 'soft' ? 'bg-primary/10 text-primary' : 'bg-lime text-forest';
  const dims = size === 'lg' ? 'px-4 py-1.5 text-section' : 'px-2.5 py-0.5 text-caption';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${color} ${dims}`}>
      เลเวล {level}
    </span>
  );
}
