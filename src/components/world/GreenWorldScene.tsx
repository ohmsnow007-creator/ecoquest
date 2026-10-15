import { useId } from 'react';
import { motion } from 'framer-motion';
import { ART, Cloud, Face, PineTree, RoundTree, Sprout } from '../illustrations/parts';

// Scene-only colors for terrain and water.
const LAND = {
  dustTop: '#E9E4D8',
  dustLow: '#F6F1E6',
  dryFar: '#CDBB9F',
  dryHill: '#D4B48C',
  dryGround: '#C49A6C',
  crack: '#A87E52',
  rock: '#B8A38A',
  sproutGround: '#B9C77A',
  skyTop: '#BFE8F5',
  skyLow: '#E6F8EF',
  water: '#8FD3F0',
  waterDeep: '#6EC1E8',
  petal: ['#F7A6B8', '#FFC93C', '#FFFFFF', '#C4B5FD'],
  rainbow: ['#F7A6B8', '#FFC93C', '#9AD9F5'],
  fur: '#F3EDE4',
};

function Flower({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 L0 8" className="stroke-primary" strokeWidth={1.5} />
      {[0, 72, 144, 216, 288].map((r) => (
        <circle key={r} cx={0} cy={-3.5} r={2.6} fill={c} transform={`rotate(${r})`} />
      ))}
      <circle r={1.8} fill={ART.sun} />
    </g>
  );
}

function Butterfly({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-3.5} cy={-2} rx={3.5} ry={4.5} fill={c} transform="rotate(-20)" />
      <ellipse cx={3.5} cy={-2} rx={3.5} ry={4.5} fill={c} transform="rotate(20)" />
      <rect x={-0.6} y={-4} width={1.2} height={7} rx={0.6} className="fill-forest" />
    </g>
  );
}

function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-12} cy={-8} r={11} className="fill-primary" />
      <circle cx={0} cy={-13} r={13} className="fill-emerald" />
      <circle cx={13} cy={-8} r={10} className="fill-primary" />
      <circle cx={-4} cy={-17} r={4} className="fill-mint" opacity={0.45} />
    </g>
  );
}

function MiniPine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-1.2} y={-4} width={2.4} height={5} fill={ART.trunkDark} />
      <path d="M0 -22 L7 -11 L4 -11 L9 -3 L-9 -3 L-4 -11 L-7 -11 Z" className="fill-primary" opacity={0.85} />
    </g>
  );
}

function GrassTuft({ x, y, s = 1, dry = false }: { x: number; y: number; s?: number; dry?: boolean }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M-6 0 Q-5 -7 -2 -10 Q-2 -4 -1 0 Q0 -9 2 -12 Q2 -5 3 0 Q5 -6 7 -8 Q5 -3 6 0 Z"
      className={dry ? undefined : 'fill-forest'}
      fill={dry ? LAND.crack : undefined}
      opacity={dry ? 0.6 : 0.55}
    />
  );
}

function DeadTree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={LAND.crack} strokeWidth={3} strokeLinecap="round" fill="none">
      <path d="M0 0 L0 -26" />
      <path d="M0 -14 L-9 -22" strokeWidth={2} />
      <path d="M0 -19 L8 -28" strokeWidth={2} />
    </g>
  );
}

function Rabbit({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={9} ry={7} fill={LAND.fur} />
      <circle cx={8} cy={-6} r={5.5} fill={LAND.fur} />
      <ellipse cx={7} cy={-15} rx={1.8} ry={6} fill={LAND.fur} />
      <ellipse cx={10} cy={-14} rx={1.8} ry={6} fill={LAND.fur} transform="rotate(15 10 -14)" />
      <circle cx={10} cy={-7} r={1} className="fill-forest" />
      <circle cx={-9} cy={-1} r={2.5} fill="#FFFFFF" />
    </g>
  );
}

const pop = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, delay },
});

interface GreenWorldSceneProps {
  stage: number;
  className?: string;
}

export function GreenWorldScene({ stage, className = '' }: GreenWorldSceneProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const dry = stage === 0;
  const skyId = `sky-${uid}`;
  const glowId = `glow-${uid}`;
  const rangeId = `range-${uid}`;

  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={`ภาพโลกสีเขียวของคุณ ระดับ ${stage}`}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dry ? LAND.dustTop : LAND.skyTop} />
          <stop offset="100%" stopColor={dry ? LAND.dustLow : LAND.skyLow} />
        </linearGradient>
        <radialGradient id={glowId} cx="84%" cy="20%" r="45%">
          <stop offset="0%" stopColor={ART.sun} stopOpacity={dry ? 0.35 : 0.45} />
          <stop offset="100%" stopColor={ART.sun} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={rangeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dry ? '#DCCDB2' : '#D6F1E1'} />
          <stop offset="100%" stopColor={dry ? LAND.dryFar : '#A8E2C4'} />
        </linearGradient>
      </defs>
      <rect width={360} height={220} fill={`url(#${skyId})`} />
      <rect width={360} height={220} fill={`url(#${glowId})`} />

      {stage >= 4 && (
        <motion.g {...pop()} fill="none" strokeWidth={7} opacity={0.55}>
          {LAND.rainbow.map((c, i) => (
            <path key={c} d={`M${40 + i * 8} 170 A ${140 - i * 8} ${120 - i * 8} 0 0 1 ${320 - i * 8} 170`} stroke={c} />
          ))}
        </motion.g>
      )}

      <g transform="translate(304 44)">
        <circle r={22} fill={ART.sun} opacity={dry ? 0.75 : 1} />
        {!dry && <Face x={0} y={-1} s={0.6} />}
      </g>

      {stage >= 1 && (
        <motion.g {...pop()}>
          <Cloud x={70} y={42} />
          <Cloud x={190} y={30} s={0.7} />
        </motion.g>
      )}

      {stage >= 2 && (
        <motion.g {...pop(0.2)} className="stroke-forest" strokeWidth={1.8} fill="none" strokeLinecap="round">
          <path d="M112 58 q4 -4 8 0 q4 -4 8 0" />
          <path d="M134 46 q3 -3 6 0 q3 -3 6 0" />
        </motion.g>
      )}

      <path d="M-10 140 L30 104 L74 126 L128 84 L190 118 L246 76 L300 112 L370 92 L370 220 L-10 220Z" fill={`url(#${rangeId})`} opacity={0.8} />
      {!dry && (
        <g fill="#FFFFFF" opacity={0.75}>
          <path d="M128 84 L138 93 L132 92 L128 97 L123 92 L118 93 Z" />
          <path d="M246 76 L256 85 L250 84 L246 89 L241 84 L236 85 Z" />
        </g>
      )}

      <path
        d="M-10 150 L60 92 L110 138 L170 80 L238 140 L300 98 L370 150 L370 220 L-10 220Z"
        fill={dry ? LAND.dryFar : undefined}
        className={dry ? undefined : 'fill-mint'}
      />

      {stage >= 2 && (
        <motion.g {...pop(0.05)}>
          {[[16, 150], [30, 146], [44, 150], [256, 142], [270, 146], [284, 140], [344, 150]].map(([x, y], i) => (
            <MiniPine key={`${x}`} x={x} y={y} s={0.8 + (i % 3) * 0.15} />
          ))}
        </motion.g>
      )}

      {stage >= 4 && (
        <motion.g {...pop(0.1)}>
          <path d="M166 86 L176 86 L180 150 L162 150 Z" fill={LAND.water} />
          <path d="M168 92 L170 140 M174 94 L175 140" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1.5} />
        </motion.g>
      )}

      <path
        d="M-10 160 C60 130 140 135 200 155 C260 135 320 130 370 150 L370 220 L-10 220Z"
        fill={dry ? LAND.dryHill : undefined}
        className={dry ? undefined : 'fill-emerald'}
        opacity={dry ? 1 : 0.75}
      />
      <path d="M-10 166 C50 146 120 146 190 160" fill="none" stroke="#FFFFFF" strokeOpacity={dry ? 0.25 : 0.3} strokeWidth={2} strokeLinecap="round" />

      {stage >= 2 && (
        <motion.g {...pop(0.1)}>
          <RoundTree x={118} y={162} s={0.42} crown="fill-primary" face={false} />
          <RoundTree x={300} y={156} s={0.4} face={false} />
        </motion.g>
      )}
      {stage >= 4 && (
        <motion.g {...pop(0.2)}>
          <PineTree x={40} y={164} s={0.5} />
          <RoundTree x={222} y={158} s={0.38} face={false} />
          <PineTree x={338} y={162} s={0.42} />
        </motion.g>
      )}

      <path
        d="M-10 186 C80 166 170 171 230 183 C290 169 330 169 370 177 L370 220 L-10 220Z"
        fill={stage === 0 ? LAND.dryGround : stage === 1 ? LAND.sproutGround : undefined}
        className={stage >= 2 ? 'fill-primary' : undefined}
      />

      {stage >= 4 && (
        <motion.path
          {...pop(0.15)}
          d="M162 150 C140 172 214 184 186 220 L214 220 C246 184 168 172 180 150Z"
          fill={LAND.waterDeep}
          opacity={0.9}
        />
      )}

      {dry && (
        <g stroke={LAND.crack} strokeWidth={1.6} fill="none" strokeLinecap="round">
          <path d="M60 200 l10 -6 l6 5 l9 -4" />
          <path d="M200 205 l8 -5 l7 4" />
          <path d="M290 198 l-7 -4 l-8 5" />
          <ellipse cx={110} cy={196} rx={8} ry={4} fill={LAND.rock} stroke="none" />
          <ellipse cx={250} cy={202} rx={6} ry={3} fill={LAND.rock} stroke="none" />
        </g>
      )}
      {dry && (
        <g>
          <DeadTree x={318} y={196} />
          {[[28, 206], [160, 210], [222, 200]].map(([x, y]) => (
            <GrassTuft key={`${x}`} x={x} y={y} dry />
          ))}
        </g>
      )}
      {stage >= 1 && (
        <motion.g {...pop(0.05)}>
          {[[12, 212], [70, 216], [132, 214], [178, 218], [210, 212], [276, 216], [352, 214]].map(([x, y], i) => (
            <GrassTuft key={`${x}`} x={x} y={y} s={0.9 + (i % 3) * 0.2} />
          ))}
        </motion.g>
      )}

      {stage >= 3 && (
        <motion.g {...pop(0.1)}>
          <ellipse cx={262} cy={200} rx={34} ry={8} fill={LAND.water} />
          <ellipse cx={252} cy={198} rx={10} ry={2} fill="#FFFFFF" opacity={0.6} />
        </motion.g>
      )}

      {stage >= 2 && (
        <motion.g {...pop(0.15)}>
          <Bush x={60} y={196} s={0.9} />
          <Bush x={330} y={200} s={0.8} />
          <RoundTree x={196} y={192} s={0.5} face={stage >= 3} />
        </motion.g>
      )}

      {stage >= 1 && (
        <motion.g {...pop(0.05)}>
          {[[34, 204, 0.9], [96, 208, 0.8], [150, 200, 0.7], [236, 210, 0.8], [306, 206, 0.9]].map(([x, y, s]) => (
            <Sprout key={`${x}`} x={x} y={y} s={s} />
          ))}
        </motion.g>
      )}

      {stage >= 3 && (
        <motion.g {...pop(0.25)}>
          {[[20, 196], [76, 212], [124, 204], [146, 214], [226, 196], [300, 214], [344, 206]].map(([x, y], i) => (
            <Flower key={`${x}-${y}`} x={x} y={y} c={LAND.petal[i % LAND.petal.length]} />
          ))}
          <Butterfly x={150} y={160} c={LAND.petal[0]} />
          <Butterfly x={232} y={150} c={LAND.petal[3]} />
        </motion.g>
      )}

      {stage >= 4 && (
        <motion.g {...pop(0.3)}>
          <Rabbit x={112} y={206} />
        </motion.g>
      )}
    </svg>
  );
}
