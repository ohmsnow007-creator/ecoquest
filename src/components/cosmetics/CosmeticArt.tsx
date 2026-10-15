import type { Outfit } from '../../data/cosmetics';

/*
 * Cosmetic artwork, drawn once in the avatar's coordinates (200 × 250: head centre 100,100, eyes at
 * 82/118,105, shoulders around y 150). Sprouty reuses the same drawings through a transform.
 */

const FLOWER_COLORS = ['#F9A8D4', '#FDE68A', '#FFFFFF', '#FDBA74', '#F9A8D4'];

export function HatArt({ id }: { id: string }) {
  switch (id) {
    case 'hat-leaf-cap':
      return (
        <g>
          <path d="M54 74 C56 38 144 38 146 74 Z" fill="#5DAA43" />
          <path d="M60 64 C80 54 120 54 140 64" stroke="#3F8A35" strokeWidth={3} fill="none" opacity={0.6} />
          <path d="M48 74 Q100 86 152 74 L152 81 Q100 93 48 81 Z" fill="#3F8A35" />
          <path d="M100 42 L100 28" stroke="#3F8A35" strokeWidth={3} strokeLinecap="round" />
          <path d="M100 32 C110 16 128 16 130 24 C120 34 108 36 100 32 Z" fill="#8BD46A" />
        </g>
      );
    case 'hat-straw':
      return (
        <g>
          <ellipse cx="100" cy="72" rx="76" ry="14" fill="#EBC77F" stroke="#C99A48" strokeWidth={2} />
          <path d="M62 72 C62 38 138 38 138 72 Z" fill="#F3D695" stroke="#C99A48" strokeWidth={2} />
          <path d="M63 62 L137 62 L138 70 L62 70 Z" fill="#4E9A3A" />
          <path d="M120 62 C126 52 136 52 138 58 C132 64 126 64 120 62 Z" fill="#8BD46A" />
        </g>
      );
    case 'hat-flower-crown':
      return (
        <g>
          <path d="M54 72 Q100 44 146 72" stroke="#5DAA43" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[
            [58, 68],
            [77, 57],
            [100, 52],
            [123, 57],
            [142, 68],
          ].map(([x, y], i) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx={0} cy={-6} rx={4} ry={6} fill={FLOWER_COLORS[i]} stroke="#E07AA8" strokeWidth={0.8} transform={`rotate(${r})`} />
              ))}
              <circle r={3.4} fill="#F59E0B" />
            </g>
          ))}
        </g>
      );
    case 'hat-headband':
      return (
        <g>
          <path d="M50 78 Q100 60 150 78 L150 90 Q100 72 50 90 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2} />
          <path d="M96 66 L88 80 L98 80 L92 94 L110 74 L100 74 L106 66 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M150 84 C160 80 168 86 172 94 C164 92 158 92 150 90 Z" fill="#22C55E" stroke="#15803D" strokeWidth={1.5} />
        </g>
      );
    case 'hat-golden-leaf':
      return (
        <g>
          <path d="M58 66 L68 36 L84 54 L100 28 L116 54 L132 36 L142 66 Z" fill="#F5C542" stroke="#C9962A" strokeWidth={2.5} strokeLinejoin="round" />
          <rect x="58" y="62" width="84" height="10" rx="4" fill="#E9B530" stroke="#C9962A" strokeWidth={2} />
          <path d="M100 58 C92 50 94 42 100 38 C106 42 108 50 100 58 Z" fill="#4ADE80" stroke="#15803D" strokeWidth={1.5} />
          <circle cx="68" cy="38" r="3" fill="#FFF7D6" />
          <circle cx="132" cy="38" r="3" fill="#FFF7D6" />
        </g>
      );
    default:
      return null;
  }
}

export function EyesArt({ id }: { id: string }) {
  switch (id) {
    case 'eyes-round':
      return (
        <g>
          <circle cx="82" cy="105" r="12" fill="#FFFFFF" fillOpacity={0.18} stroke="#6B4423" strokeWidth={3} />
          <circle cx="118" cy="105" r="12" fill="#FFFFFF" fillOpacity={0.18} stroke="#6B4423" strokeWidth={3} />
          <path d="M94 104 Q100 99 106 104" stroke="#6B4423" strokeWidth={3} fill="none" />
        </g>
      );
    case 'eyes-sun':
      return (
        <g>
          <rect x="68" y="96" width="28" height="18" rx="8" fill="#1F2937" fillOpacity={0.92} />
          <rect x="104" y="96" width="28" height="18" rx="8" fill="#1F2937" fillOpacity={0.92} />
          <path d="M96 102 Q100 98 104 102" stroke="#1F2937" strokeWidth={3} fill="none" />
          <path d="M73 101 L80 99" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <path d="M109 101 L116 99" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        </g>
      );
    default:
      return null;
  }
}

/** Parts of a bag drawn behind the body (a backpack peeking out at the sides). */
export function BagBackArt({ id }: { id: string }) {
  if (id !== 'bag-backpack') return null;
  return <rect x="50" y="150" width="100" height="52" rx="12" fill="#B07A45" stroke="#8B5E34" strokeWidth={2} />;
}

export function BagFrontArt({ id }: { id: string }) {
  switch (id) {
    case 'bag-tote':
      return (
        <g>
          <path d="M74 150 L128 192" stroke="#C8A97E" strokeWidth={4} strokeLinecap="round" />
          <rect x="116" y="178" width="32" height="30" rx="5" fill="#EFE2CA" stroke="#C8A97E" strokeWidth={2} />
          <path d="M132 202 C124 196 124 188 132 184 C140 188 140 196 132 202 Z" fill="#5DAA43" />
        </g>
      );
    case 'bag-backpack':
      return (
        <g stroke="#8B5E34" strokeWidth={6} strokeLinecap="round">
          <path d="M76 150 L80 196" />
          <path d="M124 150 L120 196" />
        </g>
      );
    default:
      return null;
  }
}

/** Avatar layers: `back` goes before the body, `front` after the face. */
export function AvatarCosmetics({ outfit, layer }: { outfit?: Outfit; layer: 'back' | 'front' }) {
  if (!outfit) return null;
  if (layer === 'back') return outfit.bag ? <BagBackArt id={outfit.bag} /> : null;
  return (
    <>
      {outfit.bag && <BagFrontArt id={outfit.bag} />}
      {outfit.eyes && <EyesArt id={outfit.eyes} />}
      {outfit.hat && <HatArt id={outfit.hat} />}
    </>
  );
}

/*
 * Sprouty (240 × 240: body top 120,88; eyes 98/142,152). The hat sits tilted on the left of the stem so
 * the leaves stay visible; glasses scale to Sprouty's wider eyes; bags hang from the right side.
 */
const SPROUTY_HAT = 'translate(90 100) rotate(-16) scale(0.62) translate(-100 -62)';
const SPROUTY_EYES = 'translate(120 152) scale(1.22) translate(-100 -105)';

/** Sprouty's own bags: the strap hangs from the right "shoulder", away from the face. */
function SproutyBagBack({ id }: { id: string }) {
  if (id !== 'bag-backpack') return null;
  return <rect x="44" y="126" width="152" height="74" rx="22" fill="#B07A45" stroke="#8B5E34" strokeWidth={2.5} />;
}

function SproutyBagFront({ id }: { id: string }) {
  switch (id) {
    case 'bag-tote':
      return (
        <g>
          <path d="M156 104 Q184 136 176 174" stroke="#C8A97E" strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <rect x="160" y="166" width="34" height="32" rx="6" fill="#EFE2CA" stroke="#C8A97E" strokeWidth={2.5} />
          <path d="M177 192 C169 186 169 178 177 174 C185 178 185 186 177 192 Z" fill="#5DAA43" />
        </g>
      );
    case 'bag-backpack':
      return (
        <g stroke="#8B5E34" strokeWidth={7} strokeLinecap="round" fill="none">
          <path d="M70 116 Q62 150 70 190" />
          <path d="M170 116 Q178 150 170 190" />
        </g>
      );
    default:
      return null;
  }
}

export function SproutyCosmetics({ outfit, part }: { outfit?: Outfit; part: 'back' | 'body' | 'face' }) {
  if (!outfit) return null;
  if (part === 'back') return outfit.bag ? <SproutyBagBack id={outfit.bag} /> : null;
  if (part === 'face') return outfit.eyes ? <g transform={SPROUTY_EYES}><EyesArt id={outfit.eyes} /></g> : null;
  return (
    <>
      {outfit.bag && <SproutyBagFront id={outfit.bag} />}
      {outfit.hat && (
        <g transform={SPROUTY_HAT}>
          <HatArt id={outfit.hat} />
        </g>
      )}
    </>
  );
}
