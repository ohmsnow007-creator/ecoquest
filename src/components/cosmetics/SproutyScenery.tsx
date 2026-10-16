import type { ReactNode } from 'react';

/*
 * Sprouty's pots (drawn in Sprouty's 240 × 240 coordinates: the seed body sits on y ≈ 208) and the
 * backgrounds shown behind Sprouty on the care page and in the wardrobe.
 */

const POTS: Record<string, { body: string; rim: string; dark: string; deco?: ReactNode }> = {
  'pot-clay': {
    body: '#C9774A',
    rim: '#D98A5C',
    dark: '#A65B35',
    deco: <path d="M66 216 L174 216" stroke="#A65B35" strokeWidth={3} strokeLinecap="round" opacity={0.6} />,
  },
  'pot-blue': {
    body: '#5BA8D9',
    rim: '#7DBEE6',
    dark: '#3C86B8',
    deco: <path d="M64 220 Q76 212 88 220 T112 220 T136 220 T160 220 T178 218" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />,
  },
  'pot-gold': {
    body: '#F2C23E',
    rim: '#F8D766',
    dark: '#C99A22',
    deco: (
      <g fill="#FFF7D6">
        <path d="M84 214 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3Z" />
        <path d="M150 220 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z" />
      </g>
    ),
  },
  'pot-heart': {
    body: '#F49AB5',
    rim: '#F8B6CA',
    dark: '#D9708F',
    deco: <path d="M120 230 C104 220 106 208 116 210 C118 210 120 213 120 214 C120 213 122 210 124 210 C134 208 136 220 120 230Z" fill="#FFFFFF" opacity={0.9} />,
  },
  'pot-leaf': {
    body: '#7BC46A',
    rim: '#9AD889',
    dark: '#4E9A3A',
    deco: (
      <g fill="#E8F8D8">
        <path d="M84 226 C78 216 86 208 96 210 C96 220 90 226 84 226Z" />
        <path d="M156 226 C162 216 154 208 144 210 C144 220 150 226 156 226Z" />
        <path d="M120 232 C112 222 116 212 120 210 C124 212 128 222 120 232Z" />
      </g>
    ),
  },
};

/** Soil inside the pot's rim, drawn behind Sprouty. */
export function PotBack({ id }: { id: string }) {
  const pot = POTS[id];
  if (!pot) return null;
  return (
    <g>
      <ellipse cx={120} cy={198} rx={76} ry={12} fill={pot.dark} />
      <ellipse cx={120} cy={199} rx={68} ry={8} fill="#5A3B24" />
    </g>
  );
}

/** The pot itself, in front of Sprouty's lower body. */
export function PotFront({ id }: { id: string }) {
  const pot = POTS[id];
  if (!pot) return null;
  return (
    <g>
      <path d="M54 204 L186 204 L172 238 L68 238 Z" fill={pot.body} />
      <path d="M150 206 L176 206 L166 236 L150 236 Z" fill="#000000" opacity={0.08} />
      {pot.deco}
      <rect x={44} y={194} width={152} height={16} rx={8} fill={pot.rim} />
      <rect x={56} y={197} width={44} height={4} rx={2} fill="#FFFFFF" opacity={0.4} />
    </g>
  );
}

/** Square scene behind Sprouty (240 × 240). With no id, a soft mint backdrop. */
export function BackgroundArt({ id, className = '' }: { id?: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <BackgroundShapes id={id} />
    </svg>
  );
}

function BackgroundShapes({ id }: { id?: string }) {
  switch (id) {
    case 'bg-meadow':
      return (
        <>
          <rect width={240} height={240} fill="#CDEFF8" />
          <circle cx={190} cy={52} r={24} fill="#FFD95C" />
          <ellipse cx={60} cy={60} rx={26} ry={9} fill="#FFFFFF" />
          <path d="M0 170 Q60 132 120 160 T240 150 L240 240 L0 240Z" fill="#A6DD7E" />
          <path d="M0 200 Q80 172 160 196 T240 190 L240 240 L0 240Z" fill="#7CC657" />
          {[[30, 206, '#F9A8D4'], [70, 222, '#FDE68A'], [176, 214, '#FFFFFF'], [214, 226, '#F9A8D4']].map(([x, y, c]) => (
            <circle key={`${x}`} cx={x as number} cy={y as number} r={4} fill={c as string} />
          ))}
        </>
      );
    case 'bg-sea':
      return (
        <>
          <rect width={240} height={240} fill="#9EDCF5" />
          <circle cx={54} cy={56} r={22} fill="#FFE07A" />
          <rect y={140} width={240} height={50} fill="#3FA7D6" />
          <path d="M0 150 Q20 144 40 150 T80 150 T120 150 T160 150 T200 150 T240 150" stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.7} />
          <path d="M0 186 Q120 168 240 186 L240 240 L0 240Z" fill="#F4DDA8" />
          <circle cx={200} cy={214} r={5} fill="#F7A6B8" />
        </>
      );
    case 'bg-night':
      return (
        <>
          <rect width={240} height={240} fill="#1B2357" />
          {[[30, 30], [80, 60], [150, 24], [210, 70], [40, 110], [190, 120], [120, 90]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill="#FFF6C8" className="scene-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
          <path d="M196 30 A 20 20 0 1 0 196 70 A 15 15 0 1 1 196 30 Z" fill="#FFF4C8" />
          <path d="M0 196 Q120 170 240 196 L240 240 L0 240Z" fill="#2F6B4F" />
        </>
      );
    case 'bg-rainbow':
      return (
        <>
          <rect width={240} height={240} fill="#E9F7FF" />
          {['#F7A6B8', '#FDBA74', '#FDE68A', '#86EFAC', '#93C5FD', '#C4B5FD'].map((c, i) => (
            <path key={c} d={`M${10 + i * 10} 190 A ${110 - i * 10} ${110 - i * 10} 0 0 1 ${230 - i * 10} 190`} stroke={c} strokeWidth={10} fill="none" />
          ))}
          <ellipse cx={40} cy={186} rx={34} ry={14} fill="#FFFFFF" />
          <ellipse cx={204} cy={186} rx={34} ry={14} fill="#FFFFFF" />
          <path d="M0 206 Q120 192 240 206 L240 240 L0 240Z" fill="#A6DD7E" />
        </>
      );
    case 'bg-rain':
      return (
        <>
          <rect width={240} height={240} fill="#B9D3E3" />
          <ellipse cx={70} cy={44} rx={44} ry={18} fill="#E8F0F6" />
          <ellipse cx={170} cy={36} rx={50} ry={20} fill="#F4F8FB" />
          <g stroke="#5E9CC4" strokeWidth={3} strokeLinecap="round" opacity={0.8}>
            {[[40, 80], [80, 100], [120, 76], [160, 104], [200, 84], [60, 140], [180, 146], [110, 130]].map(([x, y]) => (
              <path key={`${x}-${y}`} d={`M${x} ${y} l-4 12`} />
            ))}
          </g>
          <path d="M0 196 Q120 180 240 196 L240 240 L0 240Z" fill="#7CC657" />
          <ellipse cx={58} cy={218} rx={30} ry={6} fill="#8FCBEA" />
        </>
      );
    case 'bg-forest':
      return (
        <>
          <rect width={240} height={240} fill="#D7F2DC" />
          {[[20, 150, 1], [62, 140, 1.2], [180, 142, 1.1], [222, 152, 0.9], [120, 130, 0.8]].map(([x, y, s]) => (
            <path key={`${x}`} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -70 L26 -20 L14 -20 L32 18 L-32 18 L-14 -20 L-26 -20Z" fill={x === 120 ? '#6FB86A' : '#2F8F55'} />
          ))}
          <path d="M0 186 Q120 168 240 186 L240 240 L0 240Z" fill="#4FA35E" />
        </>
      );
    default:
      return (
        <>
          <rect width={240} height={240} fill="#E9F8EF" />
          <circle cx={190} cy={50} r={40} fill="#FFFFFF" opacity={0.6} />
          <path d="M0 200 Q120 184 240 200 L240 240 L0 240Z" fill="#CDEBD8" />
        </>
      );
  }
}
