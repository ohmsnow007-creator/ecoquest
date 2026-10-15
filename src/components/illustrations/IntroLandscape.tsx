import { useId } from 'react';

/*
 * Golden-hour forest behind the intro screen: sun rays, far mountains, a pine ridge, a round-tree
 * forest and a meadow for Sprouty to stand on. Purely decorative; it sits behind the intro content.
 * Colors are scenery-only and blend into the intro's warm sky gradient.
 */
const C = {
  ray: '#FFF4C9',
  mountainFar: '#B9C98A',
  mountainMid: '#8FB067',
  snow: '#F6EFC9',
  pineFar: '#5E9248',
  pineNear: '#3F7A3A',
  treeDark: '#2F6B34',
  treeMid: '#3E8A44',
  treeLight: '#5DA54F',
  highlight: '#B6DB7A',
  trunk: '#6B4A2B',
  meadow: '#5E9E3F',
  meadowLight: '#7DB851',
  meadowDark: '#3E7A2E',
  grass: '#2E6A2A',
  bird: '#3B4A2A',
  petals: ['#FFFFFF', '#FFD84D', '#F7A6B8', '#C9B8FF'],
};

function Pine({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2.5} y={-8} width={5} height={10} fill={C.trunk} />
      <path d="M0 -62 L16 -36 L9 -36 L22 -16 L12 -16 L26 -4 L-26 -4 L-12 -16 L-22 -16 L-9 -36 L-16 -36 Z" fill={fill} />
    </g>
  );
}

function RoundTree({ x, y, s = 1, dark = false }: { x: number; y: number; s?: number; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={-22} width={6} height={24} rx={2} fill={C.trunk} />
      <circle cx={0} cy={-40} r={22} fill={dark ? C.treeDark : C.treeMid} />
      <circle cx={-16} cy={-28} r={14} fill={dark ? C.treeDark : C.treeMid} />
      <circle cx={16} cy={-30} r={15} fill={dark ? C.treeDark : C.treeMid} />
      <circle cx={-7} cy={-50} r={9} fill={dark ? C.treeMid : C.treeLight} opacity={0.75} />
      <circle cx={8} cy={-44} r={5} fill={C.highlight} opacity={0.45} />
    </g>
  );
}

function Flower({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 V9" stroke={C.grass} strokeWidth={1.4} />
      {[0, 72, 144, 216, 288].map((r) => (
        <circle key={r} cx={0} cy={-3.4} r={2.5} fill={c} transform={`rotate(${r})`} />
      ))}
      <circle r={1.7} fill="#F4B63A" />
    </g>
  );
}

function Tuft({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M-8 0 Q-6 -10 -3 -14 Q-3 -6 -1 0 Q0 -12 3 -17 Q3 -7 4 0 Q6 -9 9 -11 Q7 -4 8 0 Z"
      fill={C.grass}
    />
  );
}

export function IntroLandscape({ className = '' }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const haze = `haze-${id}`;
  const meadow = `meadow-${id}`;
  const rays = `rays-${id}`;

  return (
    <svg
      viewBox="0 0 400 860"
      preserveAspectRatio="xMidYMax slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={haze} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6D8" stopOpacity={0} />
          <stop offset="100%" stopColor="#FFF6D8" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={meadow} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.meadowLight} />
          <stop offset="60%" stopColor={C.meadow} />
          <stop offset="100%" stopColor={C.meadowDark} />
        </linearGradient>
        <radialGradient id={rays} cx="78%" cy="14%" r="80%">
          <stop offset="0%" stopColor={C.ray} stopOpacity={0.55} />
          <stop offset="100%" stopColor={C.ray} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Everything is lifted so the meadow shows just above the intro card. */}
      <g transform="translate(0 -90)">
      {/* Sun rays fanning from the upper right */}
      <g fill={`url(#${rays})`}>
        {[-58, -42, -26, -10, 6].map((a) => (
          <path key={a} d="M312 120 L-40 0 L-40 70 Z" transform={`rotate(${a} 312 120)`} opacity={0.5} />
        ))}
      </g>

      {/* Birds */}
      <g stroke={C.bird} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.55}>
        <path d="M70 190 q6 -6 12 0 q6 -6 12 0" />
        <path d="M104 172 q4 -4 8 0 q4 -4 8 0" />
        <path d="M250 236 q5 -5 10 0 q5 -5 10 0" />
      </g>

      {/* Far mountains */}
      <path d="M-20 470 L40 392 L82 430 L140 350 L196 420 L240 380 L300 440 L352 370 L420 446 L420 980 L-20 980 Z" fill={C.mountainFar} opacity={0.75} />
      <path d="M140 350 L156 372 L148 370 L140 380 L131 368 L124 372 Z" fill={C.snow} opacity={0.8} />
      <path d="M352 370 L366 388 L358 386 L352 394 L345 385 L338 388 Z" fill={C.snow} opacity={0.8} />
      <rect x={-20} y={380} width={440} height={140} fill={`url(#${haze})`} />

      {/* Mid ridge with a pine line */}
      <path d="M-20 520 C40 470 110 480 170 505 C230 470 320 468 420 500 L420 980 L-20 980 Z" fill={C.mountainMid} />
      {[10, 34, 58, 82, 106, 300, 324, 348, 372, 396].map((x, i) => (
        <Pine key={x} x={x} y={i < 5 ? 512 - (i % 2) * 6 : 500 + (i % 2) * 6} s={0.55 + (i % 3) * 0.08} fill={C.pineFar} />
      ))}

      {/* Near forest */}
      <path d="M-20 590 C60 548 140 560 200 580 C260 556 340 552 420 576 L420 980 L-20 980 Z" fill={C.treeDark} />
      {[
        [-6, 590, 1.05, true], [36, 584, 0.9, false], [78, 598, 1.1, true],
        [322, 592, 1.1, true], [362, 584, 0.95, false], [404, 596, 1.05, true],
      ].map(([x, y, s, dark]) => (
        <RoundTree key={`${x}`} x={x as number} y={y as number} s={s as number} dark={dark as boolean} />
      ))}
      <Pine x={112} y={600} s={1.05} fill={C.pineNear} />
      <Pine x={292} y={596} s={1.15} fill={C.pineNear} />

      {/* Meadow Sprouty stands on */}
      <path d="M-20 640 C70 606 150 612 200 624 C260 608 330 606 420 630 L420 980 L-20 980 Z" fill={`url(#${meadow})`} />
      <path d="M-20 660 C80 636 160 640 210 650" stroke={C.highlight} strokeWidth={3} fill="none" opacity={0.45} strokeLinecap="round" />

      {[[24, 652], [62, 664], [334, 650], [372, 662], [140, 660], [262, 658]].map(([x, y], i) => (
        <Tuft key={`${x}-${y}`} x={x} y={y} s={0.9 + (i % 2) * 0.25} />
      ))}
      {[[44, 646], [96, 656], [118, 642], [286, 646], [316, 660], [356, 640], [12, 668], [388, 670]].map(([x, y], i) => (
        <Flower key={`${x}-${y}`} x={x} y={y} c={C.petals[i % C.petals.length]} />
      ))}
      </g>
    </svg>
  );
}
