import { motion } from 'framer-motion';

export type MascotMood = 'happy' | 'cheer' | 'calm' | 'sleepy';

interface EcoMascotProps {
  size?: number;
  mood?: MascotMood;
  float?: boolean;
  className?: string;
  title?: string;
  /** Eyes shut for a moment (a blink). */
  blinking?: boolean;
}

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -9 C1.5 -2 2 -1.5 9 0 C2 1.5 1.5 2 0 9 C-1.5 2 -2 1.5 -9 0 C-2 -1.5 -1.5 -2 0 -9Z"
      className="fill-lime stroke-primary"
      strokeWidth={1.2}
    />
  );
}

export function EcoMascot({ size = 160, mood = 'happy', float = false, className = '', title = 'Sprouty มาสคอตของ EcoQuest', blinking = false }: EcoMascotProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      animate={float ? { y: [0, -6, 0] } : undefined}
      transition={float ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <ellipse cx="100" cy="186" rx="46" ry="7" className="fill-forest" opacity={0.12} />

      {/* sprout */}
      <path d="M100 62 C100 52 100 46 101 38" className="stroke-primary" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M100 46 C86 22 58 22 52 34 C64 50 86 54 100 46Z" className="fill-emerald" />
      <path d="M100 46 C86 36 70 32 58 33" className="stroke-forest" strokeWidth={1.5} fill="none" opacity={0.25} />
      <path d="M101 40 C114 16 144 14 150 28 C138 44 116 48 101 40Z" className="fill-primary" />
      <path d="M101 40 C116 30 132 26 144 27" className="stroke-forest" strokeWidth={1.5} fill="none" opacity={0.25} />

      {/* planet */}
      <circle cx="100" cy="118" r="62" className="fill-emerald" />
      <path d="M58 98 C66 86 86 88 90 100 C93 110 84 118 74 116 C62 114 52 108 58 98Z" className="fill-primary" opacity={0.6} />
      <path d="M118 150 C128 142 148 144 150 154 C151 162 138 168 128 166 C116 164 110 156 118 150Z" className="fill-primary" opacity={0.6} />
      <path d="M128 82 C134 77 146 79 147 86 C148 92 140 95 134 93 C127 91 123 86 128 82Z" className="fill-primary" opacity={0.6} />
      <ellipse cx="78" cy="88" rx="22" ry="14" className="fill-mint" opacity={0.45} transform="rotate(-25 78 88)" />
      <circle cx="100" cy="118" r="60" fill="none" className="stroke-white" strokeWidth={3} opacity={0.25} />

      {/* cheeks */}
      <ellipse cx="68" cy="134" rx="9" ry="5.5" className="fill-warning" opacity={0.35} />
      <ellipse cx="132" cy="134" rx="9" ry="5.5" className="fill-warning" opacity={0.35} />

      {/* eyes */}
      {mood === 'sleepy' ? (
        <>
          <path d="M74 118 Q82 125 90 118" className="stroke-forest" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M110 118 Q118 125 126 118" className="stroke-forest" strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'calm' || (blinking && mood !== 'cheer') ? (
        <>
          <path d="M74 120 Q82 112 90 120" className="stroke-forest" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M110 120 Q118 112 126 120" className="stroke-forest" strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="82" cy="119" rx={mood === 'cheer' ? 8 : 7} ry={mood === 'cheer' ? 9 : 8} className="fill-forest" />
          <ellipse cx="118" cy="119" rx={mood === 'cheer' ? 8 : 7} ry={mood === 'cheer' ? 9 : 8} className="fill-forest" />
          <circle cx="85" cy="115" r="2.6" className="fill-white" />
          <circle cx="121" cy="115" r="2.6" className="fill-white" />
        </>
      )}

      {/* mouth */}
      {mood === 'cheer' ? (
        <path d="M86 134 Q100 154 114 134 Z" className="fill-forest stroke-forest" strokeWidth={3} strokeLinejoin="round" />
      ) : mood === 'sleepy' ? (
        <ellipse cx="100" cy="140" rx="5" ry="4" className="fill-forest" />
      ) : mood === 'calm' ? (
        <path d="M92 138 Q100 144 108 138" className="stroke-forest" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      ) : (
        <path d="M88 134 Q100 146 112 134" className="stroke-forest" strokeWidth={4} strokeLinecap="round" fill="none" />
      )}

      {mood === 'cheer' && (
        <>
          <Sparkle x={36} y={78} />
          <Sparkle x={168} y={84} s={0.8} />
          <Sparkle x={160} y={160} s={0.6} />
        </>
      )}
    </motion.svg>
  );
}
