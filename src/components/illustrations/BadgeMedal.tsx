import { createElement } from 'react';
import { Lock } from 'lucide-react';
import type { Badge } from '../../types';
import { getBadgeIcon } from '../../data/icons';

// Medal colors per rarity (art only).
const TIERS: Record<Badge['rarity'] | 'locked', { ring: string; face: string; shine: string; icon: string }> = {
  common: { ring: '#1E8E52', face: '#34C77B', shine: '#8BE3B2', icon: '#FFFFFF' },
  uncommon: { ring: '#2F7FD0', face: '#4BA3F2', shine: '#A6D4FF', icon: '#FFFFFF' },
  rare: { ring: '#6D4FD1', face: '#9B7BF0', shine: '#CDBDFF', icon: '#FFFFFF' },
  epic: { ring: '#C9651B', face: '#F28C3B', shine: '#FFC491', icon: '#FFFFFF' },
  legendary: { ring: '#C98E0A', face: '#F5B82E', shine: '#FFE39A', icon: '#5A3B00' },
  locked: { ring: '#A3AAB1', face: '#D5DADF', shine: '#EEF0F2', icon: '#8A939C' },
};

interface BadgeMedalProps {
  badge: Badge;
  unlocked: boolean;
  size?: number;
}

export function BadgeMedal({ badge, unlocked, size = 64 }: BadgeMedalProps) {
  const t = TIERS[unlocked ? badge.rarity : 'locked'];
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <path d="M50 3 L91 26.5 L91 73.5 L50 97 L9 73.5 L9 26.5Z" fill={t.ring} />
        <path d="M50 12 L83 31 L83 69 L50 88 L17 69 L17 31Z" fill={t.face} />
        <path d="M50 12 L83 31 L83 44 C66 38 34 38 17 44 L17 31Z" fill={t.shine} opacity={0.55} />
        {unlocked && <path d="M26 20 l3 -6 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3Z" fill="#FFFFFF" opacity={0.85} />}
      </svg>
      {createElement(getBadgeIcon(badge.icon), { size: Math.round(size * 0.36), color: t.icon, strokeWidth: 2.2, className: 'relative' })}
      {!unlocked && (
        <span
          className="absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full border-2 border-surface bg-text text-white"
          style={{ width: size * 0.34, height: size * 0.34 }}
        >
          <Lock size={Math.round(size * 0.17)} />
        </span>
      )}
    </span>
  );
}
