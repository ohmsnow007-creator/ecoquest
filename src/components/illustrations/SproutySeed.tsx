import { useId } from 'react';
import { motion } from 'framer-motion';

export type SproutyMood = 'happy' | 'cheer' | 'sleepy' | 'worried';
/** 1 seed with two leaves · 2 four leaves · 3 flowering · 4 small tree. */
export type SproutyStage = 1 | 2 | 3 | 4;

interface SproutySeedProps {
  size?: number;
  className?: string;
  /** Where Sprouty is looking, each from -1 (left/up) to 1 (right/down). */
  look?: { x: number; y: number };
  blinking?: boolean;
  /** Changes on every tap; Sprouty does a small happy hop. */
  hop?: number;
  mood?: SproutyMood;
  stage?: SproutyStage;
  /** Accessible name; pass '' when a nearby text already describes Sprouty. */
  title?: string;
}

const SPRING = { type: 'spring', stiffness: 160, damping: 14 } as const;
const fill = { transformBox: 'fill-box', transformOrigin: 'center' } as const;
const INK = '#3A2A1E';

const STAGE_LABEL: Record<SproutyStage, string> = { 1: 'เมล็ดพันธุ์', 2: 'ต้นอ่อน 4 ใบ', 3: 'ต้นผลิดอก', 4: 'ต้นไม้น้อย' };

function Leaves({ id, stage }: { id: string; stage: SproutyStage }) {
  if (stage === 4) {
    // A small leafy crown on a sturdier trunk.
    return (
      <>
        <path d="M118 94 C118 80 120 66 122 52" stroke="#7A5636" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M121 70 C112 64 104 62 98 64" stroke="#7A5636" strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx="96" cy="44" r="24" fill={`url(#${id}-leafL)`} />
        <circle cx="150" cy="44" r="24" fill={`url(#${id}-leafR)`} />
        <circle cx="122" cy="28" r="28" fill={`url(#${id}-leafR)`} />
        <circle cx="122" cy="54" r="22" fill={`url(#${id}-leafL)`} />
        <ellipse cx="112" cy="16" rx="12" ry="6" fill="#FFFFFF" opacity={0.3} transform="rotate(-20 112 16)" />
        <circle cx="100" cy="36" r="4" fill="#F87171" />
        <circle cx="146" cy="50" r="4" fill="#F87171" />
        <circle cx="132" cy="18" r="4" fill="#FBBF24" />
      </>
    );
  }
  return (
    <>
      <path d="M120 92 C121 78 122 70 124 60" stroke="#6FB64E" strokeWidth={6} strokeLinecap="round" fill="none" />
      {stage >= 2 && (
        <>
          <path d="M121 80 C104 60 74 58 66 74 C84 92 110 92 121 80Z" fill={`url(#${id}-leafL)`} />
          <path d="M121 80 C104 72 86 70 72 73" stroke="#3E7F2E" strokeWidth={1.8} fill="none" opacity={0.3} />
          <path d="M122 76 C138 56 170 56 176 70 C160 88 134 88 122 76Z" fill={`url(#${id}-leafR)`} />
          <path d="M122 76 C140 68 158 66 170 69" stroke="#3E7F2E" strokeWidth={1.8} fill="none" opacity={0.3} />
        </>
      )}
      <path d="M123 66 C104 32 66 34 58 52 C74 74 106 78 123 66Z" fill={`url(#${id}-leafL)`} />
      <path d="M123 66 C104 54 84 50 66 52" stroke="#3E7F2E" strokeWidth={2} fill="none" opacity={0.35} />
      <path d="M125 60 C140 22 182 16 192 34 C178 60 146 70 125 60Z" fill={`url(#${id}-leafR)`} />
      <path d="M125 60 C146 46 166 38 186 36" stroke="#3E7F2E" strokeWidth={2} fill="none" opacity={0.35} />
      <ellipse cx="160" cy="34" rx="12" ry="5" fill="#FFFFFF" opacity={0.35} transform="rotate(-20 160 34)" />
      {stage === 3 && (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="124" cy="40" rx="7" ry="11" fill="#F9A8D4" transform={`rotate(${deg} 124 52)`} />
          ))}
          <circle cx="124" cy="52" r="6.5" fill="#FBBF24" />
          <circle cx="122" cy="50" r="2" fill="#FFFFFF" opacity={0.7} />
        </g>
      )}
    </>
  );
}

function Face({ mood, blinking, lx, ly }: { mood: SproutyMood; blinking: boolean; lx: number; ly: number }) {
  const closed = mood === 'sleepy' || (mood === 'cheer' && !blinking);
  return (
    <>
      {mood === 'worried' && (
        <>
          <path d="M88 141 L104 134" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d="M152 141 L136 134" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {closed ? (
        mood === 'cheer' ? (
          <>
            <path d="M90 154 Q98 144 106 154" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
            <path d="M134 154 Q142 144 150 154" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M90 152 Q98 158 106 152" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
            <path d="M134 152 Q142 158 150 152" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          </>
        )
      ) : (
        <motion.g style={fill} animate={{ scaleY: blinking ? 0.1 : 1 }} transition={{ duration: 0.08 }}>
          <ellipse cx="98" cy="152" rx="7.5" ry="9" fill={INK} />
          <ellipse cx="142" cy="152" rx="7.5" ry="9" fill={INK} />
          <motion.g animate={{ x: lx * 2.5, y: ly * 2 }} transition={SPRING}>
            <circle cx="101" cy="148" r="2.6" fill="#FFFFFF" />
            <circle cx="145" cy="148" r="2.6" fill="#FFFFFF" />
          </motion.g>
        </motion.g>
      )}
      <ellipse cx="84" cy="168" rx="10" ry="6" fill="#F6A6A0" opacity={mood === 'worried' ? 0.3 : 0.6} />
      <ellipse cx="156" cy="168" rx="10" ry="6" fill="#F6A6A0" opacity={mood === 'worried' ? 0.3 : 0.6} />
      {mood === 'cheer' ? (
        <path d="M108 168 Q120 186 132 168 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      ) : mood === 'worried' ? (
        <path d="M112 176 Q120 168 128 176" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      ) : mood === 'sleepy' ? (
        <ellipse cx="120" cy="174" rx="4" ry="3" fill={INK} />
      ) : (
        <path d="M110 170 Q120 180 130 170" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      )}
    </>
  );
}

/** Sprouty: a glossy seed in soil that grows with the player's level and shows a mood. */
export function SproutySeed({
  size = 220,
  className = '',
  look = { x: 0, y: 0 },
  blinking = false,
  hop = 0,
  mood = 'happy',
  stage = 1,
  title,
}: SproutySeedProps) {
  const id = useId().replace(/:/g, '');
  const lx = Math.max(-1, Math.min(1, look.x));
  const ly = Math.max(-1, Math.min(1, look.y));
  const label = title ?? `Sprouty ${STAGE_LABEL[stage]}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FBFBD6" />
          <stop offset="45%" stopColor="#E9EE9A" />
          <stop offset="100%" stopColor="#B9C95A" />
        </radialGradient>
        <linearGradient id={`${id}-leafL`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9BD86A" />
          <stop offset="100%" stopColor="#4E9A3A" />
        </linearGradient>
        <linearGradient id={`${id}-leafR`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B4E77C" />
          <stop offset="100%" stopColor="#5DAA43" />
        </linearGradient>
        <radialGradient id={`${id}-soil`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#7A5636" />
          <stop offset="100%" stopColor="#3E2A1B" />
        </radialGradient>
      </defs>

      {/* soil */}
      <ellipse cx="120" cy="214" rx="114" ry="25" fill={`url(#${id}-soil)`} />
      <ellipse cx="120" cy="206" rx="66" ry="10" fill="#2B1C12" opacity={0.35} />

      {/* Whole seed tilts toward where Sprouty looks and hops on tap; it pivots at the soil. */}
      <motion.g style={{ transformOrigin: '120px 206px' }} animate={{ rotate: lx * 9 }} transition={SPRING}>
        <motion.g
          key={hop}
          style={{ transformOrigin: '120px 206px' }}
          initial={hop ? { y: 0, scaleY: 1 } : false}
          animate={hop ? { y: [0, -14, 0, -4, 0], scaleY: [1, 1.04, 0.94, 1.01, 1] } : undefined}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* stem + leaves sway a little the other way */}
          <motion.g style={{ transformOrigin: '122px 92px' }} animate={{ rotate: -lx * 6 }} transition={SPRING}>
            <Leaves id={id} stage={stage} />
          </motion.g>

          {/* seed body */}
          <path d="M120 88 C164 88 186 128 184 160 C182 192 154 208 120 208 C86 208 58 192 56 160 C54 128 76 88 120 88Z" fill={`url(#${id}-body)`} />
          <ellipse cx="92" cy="118" rx="20" ry="12" fill="#FFFFFF" opacity={0.55} transform="rotate(-30 92 118)" />

          {/* face slides toward the look direction */}
          <motion.g animate={{ x: lx * 9, y: ly * 6 }} transition={SPRING}>
            <Face mood={mood} blinking={blinking} lx={lx} ly={ly} />
          </motion.g>

          {mood === 'sleepy' && (
            <g fill={INK} opacity={0.55} fontFamily="sans-serif" fontWeight={700}>
              <text x="176" y="112" fontSize="18">z</text>
              <text x="190" y="94" fontSize="13">z</text>
            </g>
          )}
          {mood === 'cheer' && (
            <g fill="#FBBF24">
              <path d="M44 118 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4Z" />
              <path d="M196 132 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3Z" />
            </g>
          )}
          {mood === 'worried' && <path d="M176 120 q6 10 0 14 q-6 -4 0 -14Z" fill="#7DD3FC" />}
        </motion.g>
      </motion.g>
    </svg>
  );
}
