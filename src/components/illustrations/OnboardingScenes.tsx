import { useId, type ReactNode } from 'react';
import { EcoMascot } from '../ui/EcoMascot';

// Illustration-only colors (scenery that has no UI role). UI colors come from theme tokens.
const ART = {
  sky: '#DDF4F0',
  skyTop: '#C9EDF6',
  sun: '#FFC93C',
  sunRay: '#FFB020',
  cloud: '#FFFFFF',
  trunk: '#B5562F',
  trunkDark: '#8E3F22',
  cheek: '#F7A6B8',
  sunsetTop: '#E9552B',
  sunsetMid: '#F49A3B',
  sunsetLow: '#FCD27D',
  space: '#082F2A',
  star: '#FFE58A',
};

const BLOB =
  'M44 16 C96 2 150 16 204 8 C254 1 302 8 312 52 C321 96 306 142 313 188 C320 236 298 270 252 274 C200 279 150 266 98 274 C54 280 12 270 7 226 C2 180 16 132 8 86 C2 44 12 24 44 16 Z';

function Frame({ label, children }: { label: string; children: ReactNode }) {
  const id = `blob-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 320 280" role="img" aria-label={label} className="h-auto w-full">
      <defs>
        <clipPath id={id}>
          <path d={BLOB} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-9} cy={0} rx={2.6} ry={3.2} className="fill-forest" />
      <ellipse cx={9} cy={0} rx={2.6} ry={3.2} className="fill-forest" />
      <path d="M-5 6 Q0 11 5 6" className="stroke-forest" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <ellipse cx={-15} cy={6} rx={4.5} ry={3} fill={ART.cheek} opacity={0.8} />
      <ellipse cx={15} cy={6} rx={4.5} ry={3} fill={ART.cheek} opacity={0.8} />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={ART.cloud}>
      <ellipse cx={0} cy={6} rx={22} ry={8} />
      <circle cx={-8} cy={0} r={9} />
      <circle cx={6} cy={-3} r={11} />
    </g>
  );
}

function RoundTree({ x, y, s = 1, crown = 'fill-emerald', face = true }: { x: number; y: number; s?: number; crown?: string; face?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-7 0 L-5 -46 Q0 -52 5 -46 L7 0 Z" fill={ART.trunk} />
      <path d="M-3 -30 L-16 -44" stroke={ART.trunk} strokeWidth={5} strokeLinecap="round" />
      <path d="M3 -24 L15 -38" stroke={ART.trunk} strokeWidth={5} strokeLinecap="round" />
      <g className={crown}>
        <circle cx={0} cy={-70} r={30} />
        <circle cx={-26} cy={-56} r={20} />
        <circle cx={26} cy={-56} r={20} />
        <circle cx={-14} cy={-92} r={18} />
        <circle cx={16} cy={-90} r={19} />
      </g>
      <g className="fill-mint" opacity={0.35}>
        <circle cx={-12} cy={-84} r={8} />
        <circle cx={-30} cy={-60} r={6} />
      </g>
      {face && <Face x={0} y={-64} />}
    </g>
  );
}

function PineTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-5} y={-14} width={10} height={16} fill={ART.trunkDark} />
      <path d="M0 -110 L34 -56 L20 -56 L42 -14 L-42 -14 L-20 -56 L-34 -56 Z" className="fill-primary" />
      <path d="M0 -110 L12 -90 L-4 -84 Z" className="fill-mint" opacity={0.4} />
      <Face x={0} y={-44} s={0.9} />
    </g>
  );
}

function Sprout({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L0 -16" className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M0 -12 C-10 -22 -20 -18 -20 -12 C-12 -6 -4 -8 0 -12Z" className="fill-emerald" />
      <path d="M0 -14 C8 -26 20 -22 20 -16 C12 -10 4 -10 0 -14Z" className="fill-primary" />
    </g>
  );
}

function Leaf({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
      d="M0 0 C6 -10 18 -10 22 0 C18 10 6 10 0 0Z"
      className="fill-emerald"
    />
  );
}

export function WelcomeScene() {
  return (
    <Frame label="Sprouty มาสคอตดาวเคราะห์สีเขียว ยืนอยู่บนเนินเขาใต้ดวงอาทิตย์">
      <rect width={320} height={280} fill={ART.sky} />
      <rect width={320} height={120} fill={ART.skyTop} opacity={0.6} />
      <g transform="translate(262 58)">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={0} y1={-30} x2={0} y2={-40} stroke={ART.sunRay} strokeWidth={4} strokeLinecap="round" transform={`rotate(${i * 36})`} />
        ))}
        <circle r={24} fill={ART.sun} />
        <Face x={0} y={-2} s={0.75} />
      </g>
      <Cloud x={60} y={44} />
      <Cloud x={170} y={30} s={0.7} />
      <path d="M-10 196 C40 150 100 150 150 186 C190 158 250 140 330 176 L330 280 L-10 280 Z" className="fill-mint" />
      <path d="M-10 232 C60 200 120 208 170 228 C220 206 280 202 330 222 L330 280 L-10 280 Z" className="fill-primary" />
      <g transform="translate(88 64)">
        <EcoMascot size={150} mood="happy" title="Sprouty" />
      </g>
      <Sprout x={52} y={238} s={1.3} />
      <Sprout x={268} y={232} s={1.1} />
      <Sprout x={236} y={252} s={0.9} />
      <Leaf x={34} y={110} r={-30} />
      <Leaf x={282} y={130} r={20} s={0.8} />
      <Leaf x={226} y={98} r={160} s={0.6} />
    </Frame>
  );
}

export function GardenScene() {
  const id = `sunset-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Frame label="สวนต้นไม้ยิ้มแย้มเติบโตใต้ท้องฟ้ายามเย็น">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ART.sunsetTop} />
          <stop offset="55%" stopColor={ART.sunsetMid} />
          <stop offset="100%" stopColor={ART.sunsetLow} />
        </linearGradient>
      </defs>
      <rect width={320} height={280} fill={`url(#${id})`} />
      <g fill="none" strokeWidth={22} opacity={0.35}>
        <circle cx={230} cy={250} r={150} stroke={ART.sunsetLow} />
        <circle cx={230} cy={250} r={118} stroke="#FFFFFF" opacity={0.5} />
        <circle cx={230} cy={250} r={86} stroke={ART.sunsetLow} />
      </g>
      <circle cx={232} cy={210} r={34} fill={ART.sun} opacity={0.9} />
      <path d="M-10 236 C60 210 140 214 200 232 C250 220 300 218 330 226 L330 280 L-10 280 Z" className="fill-primary" />
      <path d="M-10 256 C80 240 200 246 330 252 L330 280 L-10 280 Z" className="fill-forest" opacity={0.35} />
      <RoundTree x={92} y={246} s={1.15} />
      <RoundTree x={186} y={250} s={0.85} crown="fill-primary" />
      <PineTree x={262} y={250} s={1.05} />
      <Sprout x={30} y={252} s={1.2} />
      <Sprout x={146} y={258} s={0.9} />
    </Frame>
  );
}

export function SpaceScene() {
  const trees = Array.from({ length: 9 }, (_, i) => 36 + i * 36);
  return (
    <Frame label="Sprouty ลอยอยู่ในอวกาศ ล้อมรอบด้วยต้นไม้เล็ก ๆ">
      <rect width={320} height={280} fill={ART.space} />
      <circle cx={160} cy={140} r={128} className="fill-emerald" opacity={0.08} />
      <circle cx={160} cy={140} r={100} className="fill-emerald" opacity={0.12} />
      {[
        [34, 40, 1], [78, 236, 0.7], [290, 52, 0.9], [270, 228, 0.6], [24, 150, 0.5], [300, 150, 0.7], [140, 20, 0.5], [200, 262, 0.6],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          transform={`translate(${x} ${y}) scale(${s})`}
          d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8Z"
          fill={ART.star}
        />
      ))}
      {[[60, 90], [250, 96], [110, 250], [228, 30], [16, 210]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.8} fill="#FFFFFF" opacity={0.8} />
      ))}
      {trees.map((deg) => (
        <g key={deg} transform={`translate(160 146) rotate(${deg}) translate(0 -66)`}>
          <rect x={-2.5} y={0} width={5} height={14} fill={ART.trunk} />
          <circle cx={0} cy={-8} r={12} className="fill-emerald" />
          <circle cx={-4} cy={-12} r={4} className="fill-mint" opacity={0.4} />
        </g>
      ))}
      <g transform="translate(75 46)">
        <EcoMascot size={170} mood="cheer" title="Sprouty" />
      </g>
    </Frame>
  );
}
