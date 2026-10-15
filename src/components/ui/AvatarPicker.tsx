import { Check } from 'lucide-react';
import { AVATAR_CHARACTERS, getCharacter, getProfileColor } from '../../data/avatars';
import { CharacterAvatar } from '../avatar/CharacterAvatar';

interface AvatarProps {
  id: string | undefined;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onDark?: boolean;
}

const AVATAR_SIZE = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-40 w-40',
};

export function Avatar({ id, color, size = 'md', onDark = false }: AvatarProps) {
  const character = getCharacter(id);
  const bg = getProfileColor(color).className;
  return (
    <span
      role="img"
      aria-label={`อวาตาร์ ${character.name}`}
      className={`inline-flex shrink-0 items-end justify-center overflow-hidden rounded-full ${AVATAR_SIZE[size]} ${bg} ${onDark ? 'ring-2 ring-white/30' : ''}`}
    >
      <CharacterAvatar look={character.look} framing="bust" className="h-full w-full" />
    </span>
  );
}

interface AvatarSelectorProps {
  value: string;
  onChange: (id: string) => void;
  color?: string;
  layout?: 'row' | 'grid';
}

export function AvatarSelector({ value, onChange, color, layout = 'row' }: AvatarSelectorProps) {
  const bg = getProfileColor(color).className;
  const container =
    layout === 'row'
      ? 'scrollbar-hide -mx-6 flex gap-3 overflow-x-auto px-6 py-2'
      : 'grid grid-cols-4 gap-3';

  return (
    <div role="radiogroup" aria-label="เลือกอวาตาร์" className={container}>
      {AVATAR_CHARACTERS.map(({ id, name, look }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={name}
            onClick={() => onChange(id)}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <span
              className={`relative flex h-16 w-16 items-end justify-center overflow-visible rounded-full transition-transform ${bg} ${
                active ? 'scale-105 ring-[3px] ring-text ring-offset-2 ring-offset-transparent' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <span className="h-full w-full overflow-hidden rounded-full">
                <CharacterAvatar look={look} framing="bust" className="h-full w-full" />
              </span>
              {active && (
                <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-text text-white" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className={`text-caption ${active ? 'font-semibold text-text' : 'text-muted'}`}>{name}</span>
          </button>
        );
      })}
    </div>
  );
}
