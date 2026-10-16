import type { ReactNode } from 'react';
import { Check, Lock, Ban } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { getAllCosmeticStatuses, type CosmeticSlot } from '../../data/cosmetics';

interface ItemPickerProps {
  slot: CosmeticSlot;
  /** Chosen item id, or undefined for "none". */
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  /** Thumbnail for an item (or for "none" when id is undefined). */
  thumb: (id: string | undefined) => ReactNode;
  label: string;
  /** Show a "none" choice first. */
  allowNone?: boolean;
  noneLabel?: string;
}

/**
 * A finger-friendly row of choices for one cosmetic slot (swipe sideways). Unlocked items can be
 * picked; locked ones stay visible and tapping them says how to unlock.
 */
export function ItemPicker({ slot, value, onChange, thumb, label, allowNone = true, noneLabel = 'ไม่ใช้' }: ItemPickerProps) {
  const { progress, notify } = useGame();
  const items = getAllCosmeticStatuses(progress).filter((s) => s.cosmetic.slot === slot);
  // Unlocked first, locked after: what you can use right now is at your thumb.
  items.sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  const option = (key: string, selected: boolean, locked: boolean, name: string, content: ReactNode, onPick: () => void, hint?: string) => (
    <li key={key} className="shrink-0">
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={locked ? `${name} (ล็อกอยู่: ${hint})` : name}
        onClick={onPick}
        className="flex w-[4.75rem] flex-col items-center gap-1 rounded-2xl p-1 active:scale-95"
      >
        <span
          className={`relative flex h-[4.25rem] w-[4.25rem] items-center justify-center overflow-hidden rounded-2xl bg-pale-mint ring-2 transition ${
            selected ? 'ring-primary shadow-card' : 'ring-transparent'
          } ${locked ? 'opacity-45 grayscale' : ''}`}
        >
          {content}
          {selected && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white" aria-hidden="true">
              <Check size={12} strokeWidth={3} />
            </span>
          )}
          {locked && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface/90 text-muted" aria-hidden="true">
              <Lock size={11} />
            </span>
          )}
        </span>
        <span className={`line-clamp-2 text-center text-[0.6875rem] leading-tight ${selected ? 'font-semibold text-forest' : 'text-muted'}`}>{name}</span>
      </button>
    </li>
  );

  return (
    <div>
      <p className="mb-1.5 text-caption font-semibold">{label}</p>
      <ul role="radiogroup" aria-label={label} className="scrollbar-hide -mx-5 flex gap-1 overflow-x-auto px-4 pb-1" style={{ touchAction: 'pan-x' }}>
        {allowNone &&
          option('none', value === undefined, false, noneLabel, thumb(undefined) ?? <Ban size={22} className="text-muted" aria-hidden="true" />, () => onChange(undefined))}
        {items.map(({ cosmetic, unlocked, condition }) =>
          option(
            cosmetic.id,
            value === cosmetic.id,
            !unlocked,
            cosmetic.name,
            thumb(cosmetic.id),
            () => (unlocked ? onChange(cosmetic.id) : notify(`ยังล็อกอยู่: ${condition}`, 'info')),
            condition,
          ),
        )}
      </ul>
    </div>
  );
}
