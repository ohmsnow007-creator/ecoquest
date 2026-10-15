import type { CharacterLook, HairStyle } from '../../data/avatars';

const INK = '#2B1B17';
const CHEEK = '#F7A6B8';
const MOUTH = '#8A3A33';
const SHOE = '#1F2328';

const CAP = 'M48 100 C46 54 74 36 100 36 C126 36 154 54 152 100 C146 84 132 70 112 68 C104 76 90 78 80 72 C68 78 56 88 48 100Z';
const SHORT_CAP = 'M50 96 C48 58 74 40 100 40 C126 40 152 58 150 96 C142 80 124 70 100 70 C76 70 58 80 50 96Z';

function HairBack({ style, hair, accent }: { style: HairStyle; hair: string; accent: string }) {
  switch (style) {
    case 'long':
      return <path d="M46 100 C40 50 72 30 100 30 C128 30 160 50 154 100 L162 176 C146 188 54 188 38 176 Z" fill={hair} />;
    case 'bob':
      return <path d="M46 100 C40 50 72 30 100 30 C128 30 160 50 154 100 L158 136 C150 146 134 146 128 140 L72 140 C66 146 50 146 42 136 Z" fill={hair} />;
    case 'pigtails':
      return (
        <>
          <circle cx={38} cy={130} r={19} fill={hair} />
          <circle cx={162} cy={130} r={19} fill={hair} />
          <circle cx={50} cy={116} r={5} fill={accent} />
          <circle cx={150} cy={116} r={5} fill={accent} />
        </>
      );
    case 'bun':
      return (
        <>
          <circle cx={100} cy={30} r={20} fill={hair} />
          <rect x={88} y={44} width={24} height={6} rx={3} fill={accent} />
        </>
      );
    default:
      return null;
  }
}

function HairFront({ style, hair, accent }: { style: HairStyle; hair: string; accent: string }) {
  switch (style) {
    case 'sprout':
      return (
        <>
          <path d={SHORT_CAP} fill={hair} />
          <path d="M100 42 L100 22" stroke="#15803D" strokeWidth={3} strokeLinecap="round" />
          <path d="M100 28 C88 14 74 18 74 26 C84 34 94 32 100 28Z" fill="#34C77B" />
          <path d="M100 24 C110 8 126 10 128 18 C118 28 106 28 100 24Z" fill={accent} />
        </>
      );
    case 'curly':
      return (
        <>
          <path d={SHORT_CAP} fill={hair} />
          {[54, 68, 84, 100, 116, 132, 146].map((x, i) => (
            <circle key={x} cx={x} cy={i === 0 || i === 6 ? 74 : i === 3 ? 44 : 54 - (i % 2) * 4} r={15} fill={hair} />
          ))}
          <circle cx={50} cy={92} r={11} fill={hair} />
          <circle cx={150} cy={92} r={11} fill={hair} />
        </>
      );
    case 'cap':
      return (
        <>
          <path d={SHORT_CAP} fill={hair} />
          <path d="M52 80 C54 46 78 32 100 32 C122 32 146 46 148 80 Z" fill={accent} />
          <path d="M98 78 L166 78 C174 78 174 88 166 88 L98 86 Z" fill={accent} />
          <path d="M98 78 L166 78" stroke="#000" strokeOpacity={0.12} strokeWidth={3} />
          <circle cx={100} cy={34} r={4} fill={accent} stroke="#000" strokeOpacity={0.15} />
        </>
      );
    case 'spiky':
      return <path d="M50 98 C46 58 72 38 100 38 C128 38 154 58 150 98 L142 78 L132 88 L122 72 L110 84 L100 68 L90 84 L78 72 L68 88 L58 78 Z" fill={hair} />;
    default:
      return <path d={CAP} fill={hair} />;
  }
}

interface CharacterAvatarProps {
  look: CharacterLook;
  framing?: 'full' | 'bust';
  className?: string;
  title?: string;
}

export function CharacterAvatar({ look, framing = 'full', className = '', title }: CharacterAvatarProps) {
  const { skin, hair, hairStyle, shirt, pants, accent } = look;
  const lashes = hairStyle === 'long' || hairStyle === 'pigtails' || hairStyle === 'bun' || hairStyle === 'bob';
  const viewBox = framing === 'bust' ? '26 8 148 156' : '0 0 200 250';

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <HairBack style={hairStyle} hair={hair} accent={accent} />

      {framing === 'full' && (
        <>
          <rect x={70} y={194} width={60} height={14} rx={4} fill={pants} />
          <rect x={70} y={196} width={26} height={36} rx={7} fill={pants} />
          <rect x={104} y={196} width={26} height={36} rx={7} fill={pants} />
          <rect x={70} y={222} width={26} height={5} fill="#FFFFFF" opacity={0.35} />
          <rect x={104} y={222} width={26} height={5} fill="#FFFFFF" opacity={0.35} />
          <ellipse cx={82} cy={236} rx={15} ry={6.5} fill={SHOE} />
          <ellipse cx={118} cy={236} rx={15} ry={6.5} fill={SHOE} />
          <path d="M68 158 C58 168 54 184 56 196" stroke={shirt} strokeWidth={15} strokeLinecap="round" fill="none" />
          <circle cx={56} cy={200} r={7.5} fill={skin} />
          <path d="M132 160 C150 160 162 150 170 136" stroke={shirt} strokeWidth={15} strokeLinecap="round" fill="none" />
          <circle cx={173} cy={129} r={8.5} fill={skin} />
          <path d="M186 118 q5 4 4 10 M183 109 q8 4 9 14" stroke={INK} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" fill="none" />
        </>
      )}

      <path d="M64 156 C64 148 76 145 100 145 C124 145 136 148 136 156 L140 200 L60 200 Z" fill={shirt} />
      {shirt.toUpperCase() === '#FFFFFF' && (
        <path d="M64 156 C64 148 76 145 100 145 C124 145 136 148 136 156 L140 200 L60 200 Z" fill="none" stroke="#000" strokeOpacity={0.1} strokeWidth={2} />
      )}
      <path d="M100 164 C88 172 88 188 100 194 C112 188 112 172 100 164Z" fill={accent} opacity={0.85} />
      <path d="M100 168 L100 192" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.5} />
      <rect x={92} y={136} width={16} height={14} rx={4} fill={skin} />
      <path d="M88 146 Q100 156 112 146" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={3} fill="none" strokeLinecap="round" />

      <circle cx={52} cy={104} r={9} fill={skin} />
      <circle cx={148} cy={104} r={9} fill={skin} />
      <ellipse cx={100} cy={100} rx={50} ry={46} fill={skin} />

      <HairFront style={hairStyle} hair={hair} accent={accent} />

      <path d="M75 92 q7 -5 14 0" stroke={hair} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M111 92 q7 -5 14 0" stroke={hair} strokeWidth={3} strokeLinecap="round" fill="none" />
      <ellipse cx={82} cy={105} rx={5.5} ry={6.5} fill={INK} />
      <ellipse cx={118} cy={105} rx={5.5} ry={6.5} fill={INK} />
      <circle cx={84} cy={102} r={2} fill="#FFFFFF" />
      <circle cx={120} cy={102} r={2} fill="#FFFFFF" />
      {lashes && (
        <>
          <path d="M76 100 l-4 -3 M122 100 l4 -3" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={70} cy={117} rx={8} ry={5} fill={CHEEK} opacity={0.85} />
      <ellipse cx={130} cy={117} rx={8} ry={5} fill={CHEEK} opacity={0.85} />
      <path d="M94 118 q6 7 12 0" stroke={MOUTH} strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  );
}
