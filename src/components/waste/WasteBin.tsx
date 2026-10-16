import type { BinId } from '../../data/wasteItems';
import { BINS } from '../../data/wasteItems';

/** Symbol on each bin's front: leaf (organic), recycle arrows, trash bag (general), hazard. */
function Symbol({ id }: { id: BinId }) {
  switch (id) {
    case 'green':
      return <path d="M60 104 C44 92 48 72 66 66 C72 84 70 98 60 104 Z M60 104 L62 80" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />;
    case 'yellow':
      return (
        <g fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M52 96 L46 86 L54 74" />
          <path d="M50 74 L54 74 L55 78" />
          <path d="M64 70 L74 78 L70 90" />
          <path d="M73 88 L70 90 L67 88" />
          <path d="M68 100 L56 100 L52 92" />
          <path d="M54 94 L52 92 L54 90" />
        </g>
      );
    case 'blue':
      return (
        <g fill="#FFFFFF">
          <path d="M46 78 L74 78 L71 104 L49 104 Z" opacity={0.95} />
          <rect x={44} y={73} width={32} height={5} rx={2} />
          <rect x={55} y={69} width={10} height={4} rx={1.5} />
        </g>
      );
    case 'red':
      return (
        <g>
          <path d="M60 68 L80 102 L40 102 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
          <rect x={58} y={80} width={4} height={12} rx={2} fill="#E04848" />
          <circle cx={60} cy={96} r={2.4} fill="#E04848" />
        </g>
      );
  }
}

/** A cute colour-coded bin (lid can pop open when it's the answer). */
export function WasteBin({ id, open = false, className = '' }: { id: BinId; open?: boolean; className?: string }) {
  const b = BINS[id];
  return (
    <svg viewBox="0 0 120 140" className={className} role="img" aria-label={`${b.name} ${b.kind}`}>
      <ellipse cx={60} cy={134} rx={40} ry={5} fill="#000000" opacity={0.08} />
      <path d="M24 46 L96 46 L88 130 Q87 134 82 134 L38 134 Q33 134 32 130 Z" fill={b.color} />
      <path d="M78 50 L94 50 L86 128 L74 128 Z" fill="#000000" opacity={0.08} />
      <path d="M30 56 L36 124" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.35} />
      <Symbol id={id} />
      {/* lid */}
      <g style={{ transformBox: 'fill-box', transformOrigin: '0% 100%', transform: open ? 'rotate(-28deg)' : 'none', transition: 'transform 0.4s cubic-bezier(.3,1.6,.5,1)' }}>
        <rect x={18} y={34} width={84} height={13} rx={6} fill={b.dark} />
        <rect x={48} y={26} width={24} height={9} rx={4} fill={b.dark} />
      </g>
    </svg>
  );
}
