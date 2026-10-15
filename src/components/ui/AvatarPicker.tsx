import { AVATARS, getAvatar } from '../../data/icons';

interface AvatarProps {
  id: string | undefined;
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
}

const AVATAR_SIZE = {
  sm: { box: 'h-9 w-9', icon: 18 },
  md: { box: 'h-12 w-12', icon: 22 },
  lg: { box: 'h-16 w-16', icon: 30 },
};

export function Avatar({ id, size = 'md', onDark = false }: AvatarProps) {
  const { icon: Icon, label } = getAvatar(id);
  const s = AVATAR_SIZE[size];
  return (
    <span
      role="img"
      aria-label={`อวาตาร์ ${label}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${s.box} ${onDark ? 'bg-lime text-forest' : 'bg-mint text-forest'}`}
    >
      <Icon size={s.icon} aria-hidden="true" />
    </span>
  );
}

interface AvatarPickerProps {
  value: string;
  onChange: (id: string) => void;
  onDark?: boolean;
}

export function AvatarPicker({ value, onChange, onDark = false }: AvatarPickerProps) {
  return (
    <div role="radiogroup" aria-label="เลือกอวาตาร์" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {AVATARS.map(({ id, label, icon: Icon }) => {
        const active = id === value;
        const base = onDark
          ? active ? 'border-lime bg-white/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
          : active ? 'border-primary bg-primary/10 text-text' : 'border-border bg-surface text-muted hover:border-primary/40';
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`flex min-h-11 flex-col items-center gap-1.5 rounded-control border-2 p-3 transition-colors ${base}`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${onDark ? 'bg-lime text-forest' : 'bg-mint text-forest'}`} aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className="text-caption font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
