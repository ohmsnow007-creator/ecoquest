import type { ReactNode } from 'react';

/*
 * Sprouty's pots (drawn in Sprouty's 240 × 240 coordinates: the seed body sits on y ≈ 208) and the
 * backgrounds shown behind Sprouty on the care page and in the wardrobe.
 */

const INK = '#3A2A1E';
/** Two little dot eyes and a smile on a pot's front. */
const potFace = (blush = '#F49AB5') => (
  <g>
    <circle cx={106} cy={219} r={3} fill={INK} />
    <circle cx={134} cy={219} r={3} fill={INK} />
    <path d="M114 225 Q120 230 126 225" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    <ellipse cx={96} cy={225} rx={5} ry={3} fill={blush} opacity={0.7} />
    <ellipse cx={144} cy={225} rx={5} ry={3} fill={blush} opacity={0.7} />
  </g>
);

/** Each pot: body/rim colours, decorations on the body (`deco`) and on top of the rim (`top`). */
const POTS: Record<string, { body: string; rim: string; dark: string; deco?: ReactNode; top?: ReactNode }> = {
  'pot-frog': {
    body: '#7CCB4F',
    rim: '#95D96A',
    dark: '#4E9A3A',
    deco: potFace('#F7A6B8'),
    top: (
      <g>
        {[70, 170].map((x) => (
          <g key={x}>
            <circle cx={x} cy={192} r={11} fill="#95D96A" />
            <circle cx={x} cy={191} r={7.5} fill="#FFFFFF" />
            <circle cx={x + 1} cy={192} r={4} fill={INK} />
            <circle cx={x + 2.4} cy={190.4} r={1.4} fill="#FFFFFF" />
          </g>
        ))}
      </g>
    ),
  },
  'pot-bear': {
    body: '#C08552',
    rim: '#D49A68',
    dark: '#8B5E34',
    deco: (
      <g>
        <ellipse cx={120} cy={226} rx={13} ry={9} fill="#EBCFAE" />
        <circle cx={106} cy={216} r={3} fill={INK} />
        <circle cx={134} cy={216} r={3} fill={INK} />
        <ellipse cx={120} cy={223} rx={4} ry={3} fill={INK} />
        <path d="M116 229 Q120 232 124 229" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
      </g>
    ),
    top: (
      <g>
        {[54, 186].map((x) => (
          <g key={x}>
            <circle cx={x} cy={192} r={11} fill="#C08552" />
            <circle cx={x} cy={192} r={6} fill="#F2B8A2" />
          </g>
        ))}
      </g>
    ),
  },
  'pot-cat': {
    body: '#FFD9A8',
    rim: '#FFE4C2',
    dark: '#E2B27E',
    deco: (
      <g>
        <path d="M101 218 Q106 213 111 218 M129 218 Q134 213 139 218" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <path d="M117 222 L123 222 L120 225 Z" fill="#F49AB5" />
        <path d="M120 225 Q116 230 112 227 M120 225 Q124 230 128 227" stroke={INK} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <path d="M86 222 L100 224 M86 228 L100 227 M154 222 L140 224 M154 228 L140 227" stroke={INK} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      </g>
    ),
    top: (
      <g>
        <path d="M50 198 L58 176 L74 196 Z" fill="#FFD9A8" />
        <path d="M56 194 L60 184 L67 194 Z" fill="#F49AB5" />
        <path d="M190 198 L182 176 L166 196 Z" fill="#FFD9A8" />
        <path d="M184 194 L180 184 L173 194 Z" fill="#F49AB5" />
      </g>
    ),
  },
  'pot-strawberry': {
    body: '#F25C6E',
    rim: '#5DBB4A',
    dark: '#C93A4D',
    deco: (
      <g fill="#FDE68A">
        {[[78, 214], [98, 228], [124, 214], [146, 230], [164, 214], [110, 236], [136, 222], [88, 236]].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={1.8} ry={2.6} />
        ))}
      </g>
    ),
    top: (
      <g fill="#4FAF6A">
        {[56, 80, 104, 128, 152, 176].map((x) => (
          <path key={x} d={`M${x - 10} 196 Q${x} 186 ${x + 10} 196 Q${x} 202 ${x - 10} 196Z`} />
        ))}
      </g>
    ),
  },
  'pot-cloud': {
    body: '#F4F8FD',
    rim: '#FFFFFF',
    dark: '#C9D6E6',
    deco: (
      <g>
        {potFace('#F9B8C8')}
        {[[76, 214], [160, 216], [84, 230]].map(([x, y]) => (
          <path key={`${x}`} d={`M${x} ${y} q3 5 0 7 q-3 -2 0 -7Z`} fill="#7DD3FC" />
        ))}
      </g>
    ),
    top: (
      <g fill="#FFFFFF">
        {[52, 74, 98, 122, 146, 170, 190].map((x, i) => (
          <circle key={x} cx={x} cy={196 - (i % 2) * 3} r={9} />
        ))}
      </g>
    ),
  },
  'pot-recycle': {
    body: '#3FA7A0',
    rim: '#5CC3BB',
    dark: '#2C7F79',
    deco: (
      <g fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M112 226 L106 216 L112 208" />
        <path d="M109 208 L112 208 L113 211" />
        <path d="M122 206 L132 212 L128 222" />
        <path d="M131 220 L128 222 L125 220" />
        <path d="M126 230 L114 230 L108 222" />
        <path d="M110 224 L108 222 L110 220" />
      </g>
    ),
  },
  'pot-clay': {
    body: '#C9774A',
    rim: '#D98A5C',
    dark: '#A65B35',
    deco: (
      <g>
        <path d="M60 231 L180 231" stroke="#A65B35" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
        {potFace('#F6A28C')}
      </g>
    ),
  },
  'pot-blue': {
    body: '#5BA8D9',
    rim: '#7DBEE6',
    dark: '#3C86B8',
    deco: (
      <g>
        <path d="M60 232 Q72 226 84 232 T108 232 T132 232 T156 232 T180 231" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.85} />
        {potFace('#F9A8D4')}
      </g>
    ),
  },
  'pot-gold': {
    body: '#F2C23E',
    rim: '#F8D766',
    dark: '#C99A22',
    deco: (
      <g>
        <g fill="#FFF7D6">
          <path d="M72 214 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5Z" />
          <path d="M166 222 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z" />
        </g>
        {potFace('#F59E0B')}
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
      <g>
        <g fill="#E8F8D8">
          <path d="M72 228 C66 218 74 210 84 212 C84 222 78 228 72 228Z" />
          <path d="M168 228 C174 218 166 210 156 212 C156 222 162 228 168 228Z" />
        </g>
        {potFace('#F9A8D4')}
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
      {/* a round, chubby tub */}
      <path d="M50 202 L190 202 Q190 232 166 238 L74 238 Q50 232 50 202 Z" fill={pot.body} />
      <path d="M158 204 L188 204 Q187 229 166 236 L158 236 Z" fill="#000000" opacity={0.08} />
      <ellipse cx={70} cy={218} rx={4} ry={8} fill="#FFFFFF" opacity={0.28} />
      {pot.deco}
      <rect x={42} y={192} width={156} height={17} rx={8.5} fill={pot.rim} />
      <rect x={54} y={195} width={46} height={4.5} rx={2.25} fill="#FFFFFF" opacity={0.45} />
      <circle cx={108} cy={197.2} r={2} fill="#FFFFFF" opacity={0.45} />
      {pot.top}
    </g>
  );
}

/** Square scene behind Sprouty (240 × 240), anchored at the bottom so the ground always shows. */
export function BackgroundArt({ id, className = '' }: { id?: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <BackgroundShapes id={id} />
    </svg>
  );
}

/*
 * Where Sprouty stands in a scene, in the background's 240-unit space: a 150-unit Sprouty whose soil
 * line (y 214 of its own 240) sits on the ground at y 208. Every scene uses this, so the preview, the
 * thumbnails and the care page always match and Sprouty never floats.
 */
const SPROUTY_SIZE = 150;
const GROUND_Y = 208;
const SPROUTY_TOP = GROUND_Y - (214 * SPROUTY_SIZE) / 240;
const BELOW_SPROUTY = 240 - SPROUTY_TOP - SPROUTY_SIZE;

interface SproutySceneProps {
  background?: string;
  /** Width ÷ height of the scene box (wider than 1 crops a little sky; the ground is kept). */
  aspect?: number;
  className?: string;
  /** Sprouty (render it full width: className="h-auto w-full"). */
  sprouty: ReactNode;
  /** Anything laid over the scene (speech bubble, effects). */
  children?: ReactNode;
}

export function SproutyScene({ background, aspect = 1, className = '', sprouty, children }: SproutySceneProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect }}>
      <BackgroundArt id={background} className="absolute inset-0 h-full w-full" />
      <div
        className="absolute"
        style={{
          left: `${((240 - SPROUTY_SIZE) / 2 / 240) * 100}%`,
          width: `${(SPROUTY_SIZE / 240) * 100}%`,
          // bottom is a share of the box's height; the art scales with its width
          bottom: `${(BELOW_SPROUTY / 240) * aspect * 100}%`,
        }}
      >
        {sprouty}
      </div>
      {children}
    </div>
  );
}

function RoundTreeBg({ x, y, s = 1, c = '#3FA35E' }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={-6} width={6} height={22} rx={2} fill="#9A5B34" />
      <circle cx={0} cy={-18} r={16} fill={c} />
      <circle cx={-11} cy={-10} r={10} fill={c} />
      <circle cx={11} cy={-10} r={10} fill={c} />
      <circle cx={-5} cy={-24} r={5} fill="#FFFFFF" opacity={0.2} />
    </g>
  );
}

function BackgroundShapes({ id }: { id?: string }) {
  switch (id) {
    case 'bg-trees':
      return (
        <>
          <rect width={240} height={240} fill="#D9F3E6" />
          <circle cx={196} cy={46} r={20} fill="#FFE07A" />
          <path d="M0 150 Q120 128 240 150 L240 240 L0 240Z" fill="#B7E4A0" />
          <RoundTreeBg x={34} y={150} s={1.2} c="#4FAF6A" />
          <RoundTreeBg x={204} y={146} s={1.35} />
          <RoundTreeBg x={120} y={128} s={0.8} c="#6BC17E" />
          <path d="M0 196 Q120 178 240 196 L240 240 L0 240Z" fill="#8FD07A" />
          {[[22, 214], [214, 220], [60, 228]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={3.5} fill="#FDE68A" />
          ))}
        </>
      );
    case 'bg-woods':
      return (
        <>
          <rect width={240} height={240} fill="#CFEDE0" />
          <path d="M0 120 L40 70 L80 110 L130 60 L180 108 L240 72 L240 240 L0 240Z" fill="#A9D9C0" />
          {[[16, 172, 1.1, '#2F8F55'], [58, 160, 0.9, '#3FA35E'], [190, 162, 1, '#2F8F55'], [230, 176, 1.2, '#277A49'], [104, 150, 0.7, '#4FAF6A'], [146, 156, 0.8, '#3FA35E']].map(([x, y, s, c]) => (
            <g key={`${x}`} transform={`translate(${x} ${y}) scale(${s})`}>
              <rect x={-3} y={10} width={6} height={12} fill="#7A4A2A" />
              <path d="M0 -50 L20 -14 L10 -14 L26 12 L-26 12 L-10 -14 L-20 -14Z" fill={c as string} />
            </g>
          ))}
          <path d="M0 200 Q120 186 240 200 L240 240 L0 240Z" fill="#5FB06C" />
          <ellipse cx={180} cy={218} rx={12} ry={6} fill="#E8D5B5" />
          <circle cx={176} cy={214} r={4} fill="#EF4444" />
        </>
      );
    case 'bg-city':
      return (
        <>
          <rect width={240} height={240} fill="#D6EEF8" />
          <circle cx={46} cy={40} r={18} fill="#FFE07A" />
          {[[8, 96, 34, '#9FC6D9'], [46, 70, 30, '#B7D7E6'], [80, 110, 26, '#9FC6D9'], [150, 80, 32, '#B7D7E6'], [186, 104, 26, '#9FC6D9'], [212, 64, 28, '#B7D7E6']].map(([x, y, w, c]) => (
            <g key={`${x}`}>
              <rect x={x as number} y={y as number} width={w as number} height={200 - (y as number)} rx={3} fill={c as string} />
              {Array.from({ length: Math.floor((200 - (y as number)) / 18) }, (_, r) => (
                <rect key={r} x={(x as number) + 6} y={(y as number) + 8 + r * 18} width={(w as number) - 12} height={6} rx={1.5} fill="#EAF6FB" />
              ))}
              {/* rooftop gardens and solar panels */}
              <rect x={(x as number) + 3} y={(y as number) - 5} width={(w as number) - 6} height={5} rx={2} fill={(x as number) % 2 ? '#4FAF6A' : '#2B4C7E'} />
            </g>
          ))}
          <path d="M0 196 L240 196 L240 240 L0 240Z" fill="#7FC97A" />
          <rect y={206} width={240} height={12} fill="#CBD5E1" />
          <path d="M10 212 L30 212 M60 212 L80 212 M110 212 L130 212 M160 212 L180 212 M210 212 L230 212" stroke="#FFFFFF" strokeWidth={2} />
          <RoundTreeBg x={124} y={196} s={0.7} />
          <RoundTreeBg x={20} y={198} s={0.6} c="#4FAF6A" />
        </>
      );
    case 'bg-home':
      return (
        <>
          <rect width={240} height={240} fill="#FDF0DC" />
          <circle cx={200} cy={44} r={18} fill="#FFD95C" />
          <path d="M0 176 Q120 160 240 176 L240 240 L0 240Z" fill="#A6DD7E" />
          <g transform="translate(150 178)">
            <rect x={-44} y={-58} width={88} height={60} rx={4} fill="#FFF7ED" />
            <path d="M-54 -56 L0 -96 L54 -56 Z" fill="#E07A5F" />
            <rect x={-10} y={-30} width={20} height={32} rx={3} fill="#9A5B34" />
            <circle cx={6} cy={-14} r={1.6} fill="#FDE68A" />
            <rect x={-36} y={-44} width={18} height={16} rx={2} fill="#BFE8F5" />
            <rect x={18} y={-44} width={18} height={16} rx={2} fill="#BFE8F5" />
            <path d="M-36 -36 L-18 -36 M18 -36 L36 -36" stroke="#FFFFFF" strokeWidth={1.5} />
            <rect x={-38} y={-27} width={22} height={6} rx={3} fill="#4FAF6A" />
            {[-34, -27, -20].map((x) => (
              <circle key={x} cx={x} cy={-28} r={2.4} fill="#F9A8D4" />
            ))}
          </g>
          <RoundTreeBg x={40} y={178} s={1.1} />
          <path d="M140 180 L160 180 L170 240 L130 240 Z" fill="#E8D5B5" />
        </>
      );
    case 'bg-backyard':
      return (
        <>
          <rect width={240} height={240} fill="#DDF3F1" />
          <circle cx={42} cy={44} r={18} fill="#FFE07A" />
          {/* wooden fence */}
          <rect y={150} width={240} height={8} fill="#D6A15E" />
          <rect y={170} width={240} height={8} fill="#D6A15E" />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${6 + i * 20} 196 L${6 + i * 20} 138 L${14 + i * 20} 130 L${22 + i * 20} 138 L${22 + i * 20} 196 Z`} fill="#E8B878" stroke="#C99256" strokeWidth={1} />
          ))}
          <path d="M0 192 L240 192 L240 240 L0 240Z" fill="#8FD07A" />
          {/* vegetable bed and a sunflower */}
          <rect x={18} y={206} width={86} height={20} rx={5} fill="#9A6B45" />
          {[30, 50, 70, 90].map((x, i) => (
            <path key={x} d={`M${x} 208 q-4 -10 0 -14 q4 4 0 14`} fill={i % 2 ? '#22A06B' : '#4ADE80'} />
          ))}
          <path d="M204 230 L204 168" stroke="#4E9A3A" strokeWidth={3} />
          <circle cx={204} cy={164} r={11} fill="#FBBF24" />
          <circle cx={204} cy={164} r={5} fill="#8B5E34" />
          <ellipse cx={164} cy={224} rx={14} ry={6} fill="#7DD3FC" opacity={0.8} />
        </>
      );
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
