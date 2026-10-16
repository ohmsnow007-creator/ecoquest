import { useEffect, useId, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ART, Cloud, Face, PineTree, RoundTree, Sprout } from '../illustrations/parts';
import { getTimeOfDay, type TimeOfDay } from '../../utils/timeOfDay';

/** Sky colours for each part of the day (top → horizon), plus a tint laid over the land. */
const SKY: Record<TimeOfDay, { top: string; low: string; tint: string; tintOpacity: number }> = {
  morning: { top: '#9ED8F5', low: '#FFE3C2', tint: '#FFB57A', tintOpacity: 0.08 },
  day: { top: '#7CCBF2', low: '#D8F6EC', tint: '#FFFFFF', tintOpacity: 0 },
  evening: { top: '#F08A5D', low: '#FFD48A', tint: '#FF7A45', tintOpacity: 0.16 },
  night: { top: '#0E1B44', low: '#3B3F7A', tint: '#0B1640', tintOpacity: 0.42 },
};
/** Where the sun (or moon) sits, and its colour, through the day. */
const SUN: Record<TimeOfDay, { x: number; y: number; color: string }> = {
  morning: { x: 64, y: 62, color: '#FFD15C' },
  day: { x: 304, y: 42, color: ART.sun },
  evening: { x: 300, y: 70, color: '#FF9F43' },
  night: { x: 300, y: 44, color: '#FFF4C8' },
};
const STARS: [number, number, number][] = [
  [24, 20, 1.4], [58, 46, 1], [96, 16, 1.6], [140, 34, 1.1], [178, 12, 1.3], [214, 40, 1], [246, 18, 1.5], [342, 26, 1.2], [120, 62, 0.9], [262, 60, 1],
];
const TIME_LABEL: Record<TimeOfDay, string> = { morning: 'ยามเช้า', day: 'ยามกลางวัน', evening: 'ยามเย็น', night: 'ยามค่ำคืน' };

/** The local hour, refreshed every minute so the scene follows the real clock. */
function useHour(fixed?: number) {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    if (fixed !== undefined) return;
    const t = window.setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => window.clearInterval(t);
  }, [fixed]);
  return fixed ?? hour;
}

/** How long the sun grins / the moon yawns after a tap. */
const POKE_MS = 1800;

/**
 * Sun with spinning rays and a blinking face, or a sleepy crescent moon at night. Tap it: the sun
 * bounces with a big grin, the moon gives a long yawn.
 */
function SkyBody({ time, dry }: { time: TimeOfDay; dry: boolean }) {
  const { x, y, color } = SUN[time];
  const night = time === 'night';
  const [poke, setPoke] = useState(0);
  const poked = poke > 0;
  useEffect(() => {
    if (!poke) return;
    const t = window.setTimeout(() => setPoke(0), POKE_MS);
    return () => window.clearTimeout(t);
  }, [poke]);
  const tap = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    navigator.vibrate?.(12);
    setPoke((n) => n + 1);
  };

  return (
    <g
      transform={`translate(${x} ${y})`}
      data-testid={night ? 'moon' : 'sun'}
      data-poked={poked || undefined}
      role="button"
      tabIndex={0}
      aria-label={night ? 'จิ้มพระจันทร์' : 'จิ้มพระอาทิตย์'}
      onClick={tap}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tap(e))}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {/* bigger invisible hit area for fingers */}
      <circle r={38} fill="transparent" />
      {night ? (
        <motion.g
          key={poke}
          animate={poked ? { rotate: [0, -8, 6, -4, 0], scale: [1, 1.08, 1.08, 1] } : undefined}
          transition={{ duration: 1.4 }}
        >
          <g className="scene-bob">
            <circle r={26} fill="#FFF4C8" opacity={0.18} />
            <path d="M8 -20 A 21 21 0 1 0 8 20 A 16 16 0 1 1 8 -20 Z" fill={color} />
            <circle cx={-10} cy={-9} r={2.4} fill="#E8DCA8" />
            <circle cx={-3} cy={12} r={1.8} fill="#E8DCA8" />
            {poked ? (
              // a big yawn: eyes squeezed shut, mouth wide open, little Zs float up
              <>
                <path d="M-13 -1 Q-10 1.5 -7 -1" className="stroke-forest" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                <motion.ellipse cx={-10} cy={7} rx={2.6} initial={{ ry: 1 }} animate={{ ry: [1, 4, 4, 1.5] }} transition={{ duration: 1.6 }} className="fill-forest" />
                <motion.g initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -18 }} transition={{ duration: 1.6 }} fill="#FFF8D6" fontFamily="sans-serif" fontWeight={700}>
                  <text x={-34} y={-6} fontSize={9}>z</text>
                  <text x={-42} y={-14} fontSize={7}>z</text>
                </motion.g>
              </>
            ) : (
              <>
                <g className="scene-blink" style={{ animationDelay: '1.3s' }}>
                  <ellipse cx={-10} cy={0} rx={1.6} ry={2} className="fill-forest" />
                </g>
                <path d="M-13 6 Q-10 8.5 -7 6" className="stroke-forest" strokeWidth={1.5} strokeLinecap="round" fill="none" />
              </>
            )}
            <ellipse cx={-15} cy={4} rx={2.4} ry={1.5} fill={ART.cheek} opacity={0.8} />
          </g>
        </motion.g>
      ) : (
        <>
          <g className="scene-spin">
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d="M0 -27 L3.5 -34 L-3.5 -34 Z" fill={ART.sunRay} opacity={dry ? 0.5 : 0.85} transform={`rotate(${i * 36})`} />
            ))}
          </g>
          <motion.g key={poke} animate={poked ? { scale: [1, 1.25, 0.95, 1.08, 1], rotate: [0, -10, 10, 0] } : undefined} transition={{ duration: 0.9 }}>
            <g className="scene-bob">
              <circle r={22} fill={color} opacity={dry ? 0.8 : 1} />
              <circle cx={-7} cy={-8} r={6} fill="#FFFFFF" opacity={0.35} />
              {poked ? (
                // a big beaming grin with happy ^ ^ eyes
                <g transform="translate(0 -1) scale(0.6)">
                  <path d="M-13 1 Q-9 -6 -5 1" className="stroke-forest" strokeWidth={3} strokeLinecap="round" fill="none" />
                  <path d="M5 1 Q9 -6 13 1" className="stroke-forest" strokeWidth={3} strokeLinecap="round" fill="none" />
                  <path d="M-10 7 Q0 22 10 7 Z" className="fill-forest" />
                  <path d="M-5 13 Q0 17 5 13" fill="#F47C8A" />
                  <ellipse cx={-16} cy={7} rx={5} ry={3.4} fill={ART.cheek} />
                  <ellipse cx={16} cy={7} rx={5} ry={3.4} fill={ART.cheek} />
                </g>
              ) : (
                <Face x={0} y={-1} s={0.6} blink={0.4} />
              )}
            </g>
          </motion.g>
        </>
      )}
    </g>
  );
}

/** A tree that sways gently in the wind from its base. */
function Sway({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  return (
    <g className="scene-sway" style={{ animationDelay: `${delay}s` }}>
      {children}
    </g>
  );
}

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
      <g className="scene-flutter">
        <ellipse cx={-3.5} cy={-2} rx={3.5} ry={4.5} fill={c} transform="rotate(-20)" />
        <ellipse cx={3.5} cy={-2} rx={3.5} ry={4.5} fill={c} transform="rotate(20)" />
      </g>
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
  /** Fix the hour (tests, previews); otherwise the scene follows the device clock. */
  hour?: number;
}

export function GreenWorldScene({ stage, className = '', hour: fixedHour }: GreenWorldSceneProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const dry = stage === 0;
  const time = getTimeOfDay(useHour(fixedHour));
  const sky = SKY[time];
  const night = time === 'night';
  const skyId = `sky-${uid}`;
  const glowId = `glow-${uid}`;
  const rangeId = `range-${uid}`;
  const tintId = `tint-${uid}`;

  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={`ภาพโลกสีเขียวของคุณ ระดับ ${stage} ${TIME_LABEL[time]}`}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          {/* A barren world keeps a dusty haze by day; the clock still sets the colour at night. */}
          <stop offset="0%" stopColor={dry && !night ? LAND.dustTop : sky.top} />
          <stop offset="100%" stopColor={dry && !night ? LAND.dustLow : sky.low} />
        </linearGradient>
        <radialGradient id={glowId} cx={`${(SUN[time].x / 360) * 100}%`} cy={`${(SUN[time].y / 220) * 100}%`} r="45%">
          <stop offset="0%" stopColor={SUN[time].color} stopOpacity={night ? 0.2 : dry ? 0.35 : 0.5} />
          <stop offset="100%" stopColor={SUN[time].color} stopOpacity={0} />
        </radialGradient>
        {/* At night the tint fades in below the sky so the moon and stars stay bright, with no hard edge. */}
        <linearGradient id={tintId} x1="0" y1="0" x2="0" y2="1">
          <stop offset={night ? '28%' : '0%'} stopColor={sky.tint} stopOpacity={night ? 0 : sky.tintOpacity} />
          <stop offset={night ? '55%' : '100%'} stopColor={sky.tint} stopOpacity={sky.tintOpacity} />
        </linearGradient>
        <linearGradient id={rangeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dry ? '#DCCDB2' : '#D6F1E1'} />
          <stop offset="100%" stopColor={dry ? LAND.dryFar : '#A8E2C4'} />
        </linearGradient>
      </defs>
      <rect width={360} height={220} fill={`url(#${skyId})`} />
      <rect width={360} height={220} fill={`url(#${glowId})`} />

      {stage >= 4 && !night && (
        <motion.g {...pop()} fill="none" strokeWidth={7} opacity={0.55}>
          {LAND.rainbow.map((c, i) => (
            <path key={c} d={`M${40 + i * 8} 170 A ${140 - i * 8} ${120 - i * 8} 0 0 1 ${320 - i * 8} 170`} stroke={c} />
          ))}
        </motion.g>
      )}

      {night && (
        <g fill="#FFF8D6">
          {STARS.map(([x, y, r], i) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} className="scene-twinkle" style={{ animationDelay: `${(i % 5) * 0.5}s` }} />
          ))}
        </g>
      )}

      <SkyBody time={time} dry={dry} />

      {stage >= 1 && (
        <motion.g {...pop()}>
          {/* Dim clouds at night. The opacity sits on an inner group because the pop-in animates the outer one. */}
          <g opacity={night ? 0.3 : 1}>
            <g className="scene-drift">
              <Cloud x={time === 'morning' ? 150 : 70} y={42} />
            </g>
            <g className="scene-drift" style={{ animationDelay: '-9s' }}>
              <Cloud x={200} y={30} s={0.7} />
            </g>
          </g>
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
          <Sway delay={0.6}>
            <RoundTree x={118} y={162} s={0.42} crown="fill-primary" blink={1.1} />
          </Sway>
          <Sway delay={1.8}>
            <RoundTree x={300} y={156} s={0.4} blink={2.7} />
          </Sway>
        </motion.g>
      )}
      {stage >= 4 && (
        <motion.g {...pop(0.2)}>
          <Sway delay={0.2}>
            <PineTree x={40} y={164} s={0.5} blink={0.3} />
          </Sway>
          <Sway delay={1.2}>
            <RoundTree x={222} y={158} s={0.38} crown="fill-primary" blink={3.4} />
          </Sway>
          <Sway delay={2.4}>
            <PineTree x={338} y={162} s={0.42} blink={1.9} />
          </Sway>
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
          <Sway delay={0.9}>
            <RoundTree x={196} y={192} s={0.5} blink={2.1} />
          </Sway>
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

      {stage >= 5 && (
        <motion.g {...pop(0.2)}>
          {/* wind turbines on the far hills */}
          {[
            [92, 128, 1],
            [276, 118, 0.85],
          ].map(([x, y, s], i) => (
            <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
              <path d="M-1.5 0 L-0.8 -38 L0.8 -38 L1.5 0 Z" fill="#F8FAFC" />
              <g transform="translate(0 -38)">
                <g className="scene-spin" style={{ animationDuration: `${5 + i * 2}s` }}>
                  {[0, 120, 240].map((r) => (
                    <path key={r} d="M0 0 L2 -3 L1 -20 L-1 -20 Z" fill="#FFFFFF" transform={`rotate(${r})`} />
                  ))}
                </g>
                <circle r={2.2} fill="#CBD5E1" />
              </g>
            </g>
          ))}
          {/* a little solar house with a vegetable patch */}
          <g transform="translate(250 176)">
            <rect x={-14} y={-14} width={28} height={16} fill="#FFF7ED" />
            <path d="M-17 -14 L0 -27 L17 -14 Z" fill="#B5562F" />
            <path d="M-12 -16.5 L-2 -24.5 L6 -18.5 L-4 -10.5 Z" fill="#1E3A8A" opacity={0.9} transform="translate(2 -1)" />
            <path d="M-8 -17 L-3 -21 M-5 -14 L0 -18" stroke="#93C5FD" strokeWidth={0.8} />
            <rect x={-4} y={-7} width={7} height={9} fill="#8E3F22" />
            <rect x={6} y={-10} width={5} height={5} fill="#BFE8F5" />
            {[0, 6, 12].map((dx) => (
              <path key={dx} d={`M${20 + dx} 2 q-2 -5 0 -8 q2 3 0 8`} fill="#4ADE80" />
            ))}
          </g>
        </motion.g>
      )}

      {stage >= 6 && (
        <motion.g {...pop(0.25)}>
          {/* the pond becomes a lake with lily pads, ducks and a jumping fish */}
          <ellipse cx={262} cy={203} rx={58} ry={12} fill={LAND.water} />
          <ellipse cx={244} cy={200} rx={18} ry={2.5} fill="#FFFFFF" opacity={0.55} />
          {[[230, 206], [292, 208], [276, 199]].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <ellipse rx={5} ry={2} fill="#22A06B" />
              <circle cx={1} cy={-1.5} r={1.4} fill="#F9A8D4" />
            </g>
          ))}
          {[[252, 201], [266, 205]].map(([x, y], i) => (
            <g key={x} transform={`translate(${x} ${y}) scale(${i ? 0.8 : 1})`} className="scene-bob" style={{ animationDuration: '3s', animationDelay: `${i}s` }}>
              <ellipse cx={0} cy={0} rx={6} ry={3.5} fill="#FFFFFF" />
              <circle cx={5} cy={-4} r={2.8} fill="#FFFFFF" />
              <path d="M7.5 -4 L10 -3.4 L7.5 -2.8 Z" fill="#F59E0B" />
              <circle cx={5.8} cy={-4.6} r={0.6} className="fill-forest" />
            </g>
          ))}
          <path d="M296 196 q6 -12 12 0" stroke="#7DD3FC" strokeWidth={1.2} fill="none" strokeDasharray="2 2" />
          <path d="M300 190 c3 -2 6 -1 7 1 c-2 2 -5 2 -7 -1 Z" fill="#FB923C" />
          {/* a flock passing by */}
          <g className="scene-drift stroke-forest" style={{ animationDuration: '18s' }} strokeWidth={1.4} fill="none" strokeLinecap="round">
            {[[176, 62], [186, 56], [196, 64], [206, 58]].map(([x, y]) => (
              <path key={x} d={`M${x} ${y} q3 -3 6 0 q3 -3 6 0`} />
            ))}
          </g>
        </motion.g>
      )}

      {stage >= 7 && (
        <motion.g {...pop(0.3)}>
          {!night && (
            <g fill="none" strokeWidth={4} opacity={0.45}>
              {['#C4B5FD', '#93C5FD', '#86EFAC'].map((c, i) => (
                <path key={c} d={`M${20 + i * 6} 176 A ${158 - i * 6} ${136 - i * 6} 0 0 1 ${340 - i * 6} 176`} stroke={c} />
              ))}
            </g>
          )}
          {/* a giant old tree */}
          <Sway delay={0.4}>
            <g transform="translate(78 196)">
              <path d="M-9 0 C-8 -20 -12 -34 -6 -48 L6 -48 C12 -34 8 -20 9 0 Z" fill={ART.trunkDark} />
              <path d="M-9 0 C-14 2 -18 4 -20 6 M9 0 C14 2 18 4 20 6" stroke={ART.trunkDark} strokeWidth={4} strokeLinecap="round" />
              <circle cx={0} cy={-62} r={26} className="fill-primary" />
              <circle cx={-22} cy={-50} r={17} className="fill-emerald" />
              <circle cx={22} cy={-52} r={18} className="fill-emerald" />
              <circle cx={-10} cy={-80} r={15} className="fill-emerald" />
              <circle cx={12} cy={-78} r={16} className="fill-primary" />
              <circle cx={-8} cy={-70} r={5} className="fill-mint" opacity={0.5} />
              <Face x={0} y={-56} s={0.8} blink={1.6} />
            </g>
          </Sway>
          {/* a deer grazing */}
          <g transform="translate(300 204)">
            <ellipse cx={0} cy={-8} rx={11} ry={6} fill="#C08552" />
            <path d="M-8 -4 L-8 4 M-4 -3 L-4 4 M5 -3 L5 4 M9 -4 L9 4" stroke="#8B5E34" strokeWidth={2} strokeLinecap="round" />
            <path d="M8 -11 L13 -18" stroke="#C08552" strokeWidth={4} strokeLinecap="round" />
            <ellipse cx={15} cy={-19} rx={4} ry={3} fill="#C08552" />
            <path d="M14 -22 L12 -28 M12 -26 L9 -28 M16 -22 L18 -28 M18 -26 L21 -28" stroke="#8B5E34" strokeWidth={1.2} strokeLinecap="round" />
            <circle cx={16.5} cy={-19.5} r={0.7} className="fill-forest" />
            {[[-5, -10], [2, -8], [-1, -12]].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={1} fill="#FFFFFF" opacity={0.8} />
            ))}
          </g>
          {/* magic sparkles drifting over the forest */}
          <g fill="#FDE68A">
            {[[40, 120], [150, 104], [210, 132], [330, 110], [110, 150]].map(([x, y], i) => (
              <path key={x} d={`M${x} ${y} l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z`} className="scene-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
            ))}
          </g>
        </motion.g>
      )}

      {/* Light of the hour over the land; the moon and stars stay bright above it. */}
      {sky.tintOpacity > 0 && <rect width={360} height={220} fill={`url(#${tintId})`} pointerEvents="none" />}
      {night && stage >= 2 && (
        <g fill="#FDF59A">
          {[[70, 170], [140, 186], [208, 168], [262, 182], [320, 172], [36, 190]].map(([x, y], i) => (
            <circle key={`${x}`} cx={x} cy={y} r={1.8} className="scene-firefly" style={{ animationDelay: `${i * 0.55}s` }} />
          ))}
        </g>
      )}
    </svg>
  );
}
