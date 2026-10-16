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
    case 'hat-frog':
      return (
        <g>
          <path d="M54 78 C54 40 146 40 146 78 Z" fill="#7CCB4F" />
          <path d="M50 76 Q100 88 150 76 L150 84 Q100 96 50 84 Z" fill="#5DAA43" />
          {[74, 126].map((x) => (
            <g key={x}>
              <circle cx={x} cy={42} r={14} fill="#7CCB4F" />
              <circle cx={x} cy={41} r={9.5} fill="#FFFFFF" />
              <circle cx={x + 1} cy={42} r={5} fill="#2E2A25" />
              <circle cx={x + 3} cy={40} r={1.8} fill="#FFFFFF" />
            </g>
          ))}
          <path d="M88 66 Q100 74 112 66" stroke="#2F7A3E" strokeWidth={3} strokeLinecap="round" fill="none" />
          <ellipse cx={70} cy={66} rx={6} ry={3.5} fill="#F7A6B8" opacity={0.8} />
          <ellipse cx={130} cy={66} rx={6} ry={3.5} fill="#F7A6B8" opacity={0.8} />
        </g>
      );
    case 'hat-bee':
      return (
        <g>
          <path d="M54 80 Q100 56 146 80" stroke="#FBBF24" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M54 80 Q100 56 146 80" stroke="#3A2A1E" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="6 10" />
          <path d="M86 64 Q80 44 72 34" stroke="#3A2A1E" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M114 64 Q120 44 128 34" stroke="#3A2A1E" strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle cx={71} cy={32} r={7} fill="#FBBF24" stroke="#3A2A1E" strokeWidth={2} />
          <circle cx={129} cy={32} r={7} fill="#FBBF24" stroke="#3A2A1E" strokeWidth={2} />
          <ellipse cx={142} cy={58} rx={8} ry={5} fill="#E0F2FE" opacity={0.9} transform="rotate(-30 142 58)" />
        </g>
      );
    case 'hat-acorn':
      return (
        <g>
          <path d="M56 80 C52 44 148 44 144 80 Q100 92 56 80 Z" fill="#A4693A" />
          <path d="M62 62 L138 62 M58 72 L142 72 M80 52 L120 52" stroke="#7A4A26" strokeWidth={2} opacity={0.6} />
          <path d="M70 54 L76 74 M90 48 L94 76 M110 48 L106 76 M130 54 L124 74" stroke="#C88B55" strokeWidth={2} opacity={0.5} />
          <path d="M100 46 C100 36 104 30 110 28" stroke="#6B4423" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M110 30 C118 22 128 26 126 32 C120 36 114 34 110 30 Z" fill="#7CCB4F" />
        </g>
      );
    case 'hat-earth':
      return (
        <g>
          <path d="M56 76 C56 32 144 32 144 76 Z" fill="#4FB3E8" />
          <path d="M70 52 C80 44 94 50 92 60 C88 68 74 66 70 52 Z M110 44 C122 38 136 48 130 58 C122 62 112 56 110 44 Z M98 66 C108 62 116 70 110 74 C102 76 96 72 98 66 Z" fill="#5DBB4A" />
          <path d="M50 74 Q100 86 150 74 L150 82 Q100 94 50 82 Z" fill="#2E8B57" />
          <circle cx={100} cy={34} r={5} fill="#FFFFFF" />
        </g>
      );
    case 'hat-chef':
      return (
        <g>
          <path d="M64 78 L64 56 C50 52 48 32 64 30 C66 16 86 12 96 22 C104 10 126 12 128 28 C146 28 150 50 136 56 L136 78 Z" fill="#FFFFFF" stroke="#D6DDE3" strokeWidth={2} />
          <rect x={62} y={70} width={76} height={12} rx={4} fill="#F1F5F9" stroke="#D6DDE3" strokeWidth={2} />
          <path d="M120 70 C116 58 124 50 132 52 C132 62 126 68 120 70 Z" fill="#5DBB4A" />
          <circle cx={84} cy={74} r={4} fill="#EF4444" />
        </g>
      );
    case 'hat-beanie':
      return (
        <g>
          <path d="M56 76 C56 34 144 34 144 76 Z" fill="#7CCB4F" />
          <path d="M70 46 L70 74 M85 38 L85 74 M100 36 L100 74 M115 38 L115 74 M130 46 L130 74" stroke="#5DAA43" strokeWidth={3} opacity={0.6} />
          <rect x="50" y="70" width="100" height="14" rx="7" fill="#3F8A35" />
          <path d="M100 36 L100 22" stroke="#3F8A35" strokeWidth={3} strokeLinecap="round" />
          <path d="M100 26 C90 12 76 14 74 22 C84 30 94 30 100 26 Z" fill="#A3E06F" />
          <path d="M100 26 C110 12 124 14 126 22 C116 30 106 30 100 26 Z" fill="#8BD46A" />
        </g>
      );
    case 'hat-raindrop':
      return (
        <g>
          <path d="M100 18 C112 36 140 54 140 72 Q100 84 60 72 C60 54 88 36 100 18 Z" fill="#7DD3FC" stroke="#0284C7" strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M84 50 C88 42 94 36 98 32" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.75} />
          <path d="M52 74 Q100 88 148 74 L148 80 Q100 94 52 80 Z" fill="#0EA5E9" />
          <circle cx="122" cy="58" r="4" fill="#FFFFFF" opacity={0.6} />
        </g>
      );
    case 'hat-sun-cap':
      return (
        <g>
          <path d="M58 76 C58 40 142 40 142 76 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth={2} />
          <path d="M126 72 Q160 70 176 80 Q150 86 126 80 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth={2} />
          <circle cx="100" cy="58" r="10" fill="#FB923C" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
            <path key={r} d="M100 44 L100 40" stroke="#FB923C" strokeWidth={3} strokeLinecap="round" transform={`rotate(${r} 100 58)`} />
          ))}
        </g>
      );
    case 'hat-mushroom':
      return (
        <g>
          <path d="M42 76 C42 26 158 26 158 76 Q100 86 42 76 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth={2.5} />
          <circle cx="76" cy="50" r="8" fill="#FFF7ED" />
          <circle cx="104" cy="38" r="6" fill="#FFF7ED" />
          <circle cx="128" cy="54" r="9" fill="#FFF7ED" />
          <circle cx="58" cy="68" r="5" fill="#FFF7ED" />
          <circle cx="146" cy="70" r="4" fill="#FFF7ED" />
          <path d="M50 76 Q100 88 150 76" stroke="#FDE2C8" strokeWidth={4} fill="none" strokeLinecap="round" />
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
    case 'eyes-leaf':
      return (
        <g>
          {[82, 118].map((x) => (
            <g key={x}>
              <path d={`M${x - 14} 106 C${x - 10} 92 ${x + 10} 92 ${x + 14} 106 C${x + 10} 118 ${x - 10} 118 ${x - 14} 106 Z`} fill="#BBF7D0" fillOpacity={0.35} stroke="#3F8A35" strokeWidth={3} />
              <path d={`M${x - 10} 106 L${x + 10} 106`} stroke="#3F8A35" strokeWidth={1.2} opacity={0.6} />
            </g>
          ))}
          <path d="M96 104 Q100 100 104 104" stroke="#3F8A35" strokeWidth={3} fill="none" />
        </g>
      );
    case 'eyes-heart':
      return (
        <g>
          {[82, 118].map((x) => (
            <path key={x} d={`M${x} 116 C${x - 18} 104 ${x - 14} 90 ${x} 98 C${x + 14} 90 ${x + 18} 104 ${x} 116 Z`} fill="#F472B6" fillOpacity={0.85} stroke="#BE185D" strokeWidth={2.5} strokeLinejoin="round" />
          ))}
          <path d="M94 102 Q100 98 106 102" stroke="#BE185D" strokeWidth={3} fill="none" />
          <circle cx="76" cy="101" r="2.5" fill="#FFFFFF" opacity={0.8} />
          <circle cx="112" cy="101" r="2.5" fill="#FFFFFF" opacity={0.8} />
        </g>
      );
    case 'eyes-goggles':
      return (
        <g>
          <path d="M60 104 L140 104" stroke="#334155" strokeWidth={5} strokeLinecap="round" />
          <rect x="66" y="93" width="32" height="24" rx="11" fill="#67E8F9" fillOpacity={0.55} stroke="#F97316" strokeWidth={4} />
          <rect x="102" y="93" width="32" height="24" rx="11" fill="#67E8F9" fillOpacity={0.55} stroke="#F97316" strokeWidth={4} />
          <path d="M73 100 L82 98" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
          <path d="M109 100 L118 98" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
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
    case 'bag-watering':
      return (
        <g>
          <path d="M76 150 L126 186" stroke="#0EA5E9" strokeWidth={3} strokeLinecap="round" />
          <rect x={120} y={180} width={26} height={22} rx={6} fill="#7DD3FC" stroke="#0284C7" strokeWidth={1.6} />
          <path d="M122 186 L108 176" stroke="#7DD3FC" strokeWidth={4.5} strokeLinecap="round" />
          <ellipse cx={107} cy={175} rx={3.5} ry={2.2} fill="#0284C7" transform="rotate(-35 107 175)" />
          <path d="M144 184 C154 182 154 198 144 196" stroke="#0284C7" strokeWidth={2.4} fill="none" />
          <circle cx={128} cy={186} r={2} fill="#FFFFFF" opacity={0.8} />
        </g>
      );
    case 'bag-bottle':
      return (
        <g>
          <path d="M76 150 L130 186" stroke="#0F766E" strokeWidth={3.5} strokeLinecap="round" />
          <rect x="122" y="176" width="20" height="34" rx="8" fill="#5EEAD4" stroke="#0F766E" strokeWidth={2} />
          <rect x="125" y="170" width="14" height="8" rx="3" fill="#0F766E" />
          <path d="M126 190 L138 190" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.7} />
        </g>
      );
    case 'bag-basket':
      return (
        <g>
          <path d="M120 186 Q134 160 148 186" stroke="#92400E" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d="M114 186 L154 186 L148 210 L120 210 Z" fill="#D6A15E" stroke="#92400E" strokeWidth={2} strokeLinejoin="round" />
          <path d="M118 194 L150 194 M120 202 L148 202" stroke="#92400E" strokeWidth={1.5} opacity={0.6} />
          <circle cx="126" cy="184" r="5" fill="#EF4444" />
          <path d="M136 186 C134 176 140 172 144 174 C144 180 140 184 136 186 Z" fill="#4ADE80" />
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
    case 'bag-watering':
      return (
        <g>
          <path d="M156 104 Q184 136 176 166" stroke="#0EA5E9" strokeWidth={4} strokeLinecap="round" fill="none" />
          <rect x={164} y={162} width={30} height={26} rx={7} fill="#7DD3FC" stroke="#0284C7" strokeWidth={2} />
          <path d="M166 170 L150 158" stroke="#7DD3FC" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={149} cy={157} rx={4} ry={2.5} fill="#0284C7" transform="rotate(-35 149 157)" />
          <path d="M192 166 C204 164 204 184 192 182" stroke="#0284C7" strokeWidth={2.6} fill="none" />
          <circle cx={172} cy={169} r={2.4} fill="#FFFFFF" opacity={0.8} />
        </g>
      );
    case 'bag-bottle':
      return (
        <g>
          <path d="M156 104 Q184 136 178 168" stroke="#0F766E" strokeWidth={4} strokeLinecap="round" fill="none" />
          <rect x="168" y="164" width="22" height="38" rx="9" fill="#5EEAD4" stroke="#0F766E" strokeWidth={2.5} />
          <rect x="172" y="157" width="14" height="9" rx="3" fill="#0F766E" />
          <path d="M172 180 L186 180" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.7} />
        </g>
      );
    case 'bag-basket':
      return (
        <g>
          <path d="M162 178 Q178 150 194 178" stroke="#92400E" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M156 178 L200 178 L194 204 L162 204 Z" fill="#D6A15E" stroke="#92400E" strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M160 187 L196 187 M162 196 L194 196" stroke="#92400E" strokeWidth={1.5} opacity={0.6} />
          <circle cx="170" cy="176" r="6" fill="#EF4444" />
          <path d="M182 178 C180 166 188 162 192 165 C192 172 188 176 182 178 Z" fill="#4ADE80" />
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
