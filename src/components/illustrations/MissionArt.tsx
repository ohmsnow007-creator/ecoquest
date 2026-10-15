import type { MissionCategory } from '../../types';

// Object colors for the small mission illustrations (art only).
const C = {
  green: '#2FBF71',
  greenDark: '#1E8E52',
  yellow: '#FFC93C',
  yellowDark: '#E9A800',
  blue: '#4BA3F2',
  blueDark: '#2F7FD0',
  red: '#F26B5E',
  glass: '#FFF6C9',
  metal: '#9AA7B2',
  pot: '#E2875A',
  potDark: '#C66B40',
  soil: '#8A5A3C',
  bag: '#F3E3C3',
  bagDark: '#D9C29A',
  ink: '#1F2D2A',
  cheek: '#F7A6B8',
};

function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-4} cy={0} r={1.4} fill={C.ink} />
      <circle cx={4} cy={0} r={1.4} fill={C.ink} />
      <path d="M-2 2.6 Q0 4.4 2 2.6" stroke={C.ink} strokeWidth={1.1} strokeLinecap="round" fill="none" />
      <ellipse cx={-6.5} cy={2.6} rx={1.8} ry={1.1} fill={C.cheek} />
      <ellipse cx={6.5} cy={2.6} rx={1.8} ry={1.1} fill={C.cheek} />
    </g>
  );
}

function Bin({ x, color, dark }: { x: number; color: string; dark: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-8} y={26} width={16} height={24} rx={2.5} fill={color} />
      <rect x={-9.5} y={22} width={19} height={5} rx={2} fill={dark} />
      <path d="M-3 36 l3 -4 l3 4 M-2 42 h4" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
}

const ART: Record<MissionCategory, () => React.ReactElement> = {
  waste: () => (
    <>
      <Bin x={16} color={C.green} dark={C.greenDark} />
      <Bin x={32} color={C.yellow} dark={C.yellowDark} />
      <Bin x={48} color={C.blue} dark={C.blueDark} />
      <Face x={32} y={44} s={0.8} />
    </>
  ),
  energy: () => (
    <>
      <circle cx={32} cy={26} r={18} fill={C.yellow} opacity={0.25} />
      <path d="M32 9 C21 9 15 17 15 25 C15 32 20 36 23 40 L41 40 C44 36 49 32 49 25 C49 17 43 9 32 9Z" fill={C.glass} stroke={C.yellowDark} strokeWidth={2} />
      <rect x={23} y={40} width={18} height={5} rx={1.5} fill={C.metal} />
      <rect x={24.5} y={45} width={15} height={4} rx={1.5} fill={C.metal} opacity={0.8} />
      <rect x={27} y={49} width={10} height={4} rx={2} fill={C.ink} opacity={0.7} />
      <Face x={32} y={26} />
      <path d="M8 22 h4 M52 22 h4 M14 8 l3 3 M50 8 l-3 3" stroke={C.yellowDark} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  water: () => (
    <>
      <path d="M32 8 C24 20 15 29 15 39 C15 49 23 56 32 56 C41 56 49 49 49 39 C49 29 40 20 32 8Z" fill={C.blue} />
      <path d="M23 36 C23 31 26 27 29 24" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Face x={32} y={42} s={1.1} />
    </>
  ),
  transport: () => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={17} cy={42} r={10} stroke={C.ink} strokeWidth={3} />
      <circle cx={47} cy={42} r={10} stroke={C.ink} strokeWidth={3} />
      <path d="M17 42 L27 26 L41 26 L47 42 M27 26 L33 42 L41 26" stroke={C.green} strokeWidth={3.2} />
      <path d="M33 42 L17 42" stroke={C.green} strokeWidth={3.2} />
      <path d="M25 20 h7 M41 26 l-2 -7 h5" stroke={C.ink} strokeWidth={2.6} />
      <circle cx={33} cy={42} r={2.4} fill={C.ink} stroke="none" />
    </g>
  ),
  consumption: () => (
    <>
      <path d="M10 26 h24 l-2 26 a3 3 0 0 1 -3 3 h-14 a3 3 0 0 1 -3 -3Z" fill={C.bag} stroke={C.bagDark} strokeWidth={1.5} />
      <path d="M16 26 C16 16 28 16 28 26" stroke={C.bagDark} strokeWidth={2.4} fill="none" />
      <path d="M19 40 c0 -4 6 -4 6 0 c0 3 -3 5 -3 5 c0 0 -3 -2 -3 -5Z" fill={C.green} />
      <rect x={38} y={16} width={16} height={38} rx={6} fill={C.blue} />
      <rect x={41} y={10} width={10} height={7} rx={2} fill={C.ink} opacity={0.8} />
      <rect x={38} y={28} width={16} height={8} fill="#FFFFFF" opacity={0.5} />
      <Face x={46} y={44} s={0.75} />
    </>
  ),
  nature: () => (
    <>
      <path d="M32 34 L32 20" stroke={C.greenDark} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M32 26 C24 14 12 16 12 23 C20 30 28 29 32 26Z" fill={C.green} />
      <path d="M32 22 C38 9 52 9 53 17 C46 25 38 25 32 22Z" fill={C.greenDark} />
      <path d="M18 36 h28 l-4 18 a3 3 0 0 1 -3 2.5 h-14 a3 3 0 0 1 -3 -2.5Z" fill={C.pot} />
      <rect x={16} y={33} width={32} height={6} rx={2} fill={C.potDark} />
      <ellipse cx={32} cy={34} rx={14} ry={2.4} fill={C.soil} />
      <Face x={32} y={46} s={0.9} />
    </>
  ),
};

export const CATEGORY_TONE: Record<MissionCategory, string> = {
  waste: 'bg-mint',
  energy: 'bg-tag-yellow',
  water: 'bg-tag-sky',
  transport: 'bg-lime',
  consumption: 'bg-tag-peach',
  nature: 'bg-tag-lavender',
};

interface MissionArtProps {
  category: MissionCategory;
  className?: string;
  muted?: boolean;
}

export function MissionArt({ category, className = '', muted = false }: MissionArtProps) {
  const Draw = ART[category];
  return (
    <svg viewBox="0 0 64 64" className={`${className} ${muted ? 'opacity-55 grayscale' : ''}`} aria-hidden="true">
      <Draw />
    </svg>
  );
}
