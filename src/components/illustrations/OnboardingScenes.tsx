import { useId, type ReactNode } from 'react';
import { EcoMascot } from '../ui/EcoMascot';
import { ART, Cloud, Face, Leaf, PineTree, RoundTree, Sprout } from './parts';

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
      {/* distant ridge and forest line */}
      <path d="M-10 170 L40 128 L84 150 L140 112 L200 146 L250 116 L330 150 L330 280 L-10 280 Z" fill="#CFEBDD" />
      <g opacity={0.9}>
        <PineTree x={18} y={186} s={0.42} />
        <RoundTree x={58} y={180} s={0.34} face={false} crown="fill-primary" />
        <PineTree x={254} y={172} s={0.46} />
        <RoundTree x={296} y={172} s={0.36} face={false} />
        <PineTree x={318} y={180} s={0.34} />
      </g>
      <path d="M-10 196 C40 150 100 150 150 186 C190 158 250 140 330 176 L330 280 L-10 280 Z" className="fill-mint" />
      <path d="M-10 232 C60 200 120 208 170 228 C220 206 280 202 330 222 L330 280 L-10 280 Z" className="fill-primary" />
      <g transform="translate(88 64)">
        <EcoMascot size={150} mood="happy" title="Sprouty" />
      </g>
      <Sprout x={52} y={238} s={1.3} />
      <Sprout x={268} y={232} s={1.1} />
      <Sprout x={236} y={252} s={0.9} />
      {[[24, 262, '#FFFFFF'], [96, 256, '#FFD84D'], [190, 262, '#F7A6B8'], [300, 258, '#FFFFFF']].map(([x, y, c]) => (
        <g key={`${x}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((r) => (
            <circle key={r} cx={0} cy={-3.4} r={2.6} fill={c as string} transform={`rotate(${r})`} />
          ))}
          <circle r={1.8} fill={ART.sun} />
        </g>
      ))}
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
