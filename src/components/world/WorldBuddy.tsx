import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EcoMascot } from '../ui/EcoMascot';
import { useBlinking } from '../sprouty/PlayerSprouty';
import { useIdleSleep } from '../sprouty/useIdleSleep';

/**
 * The little green planet on the world card. It wiggles and blinks; tap it and it gives a big smile
 * with a hop and a few hearts. Left alone for a while it dozes off (Zzz) until the next tap.
 */
export function WorldBuddy({ cheerful = false }: { cheerful?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const sleep = useIdleSleep();
  const blinking = useBlinking(!reduce && !sleep.asleep);
  const [taps, setTaps] = useState(0);
  const [smiling, setSmiling] = useState(false);

  const tap = () => {
    sleep.poke();
    setTaps((n) => n + 1);
    setSmiling(true);
    navigator.vibrate?.(12);
    window.setTimeout(() => setSmiling(false), 1600);
  };
  const mood = sleep.asleep ? 'sleepy' : smiling || sleep.waking || cheerful ? 'cheer' : 'happy';

  return (
    <button type="button" onClick={tap} aria-label="แตะ Sprouty ประจำโลก" className="relative block rounded-full">
      <motion.span
        key={taps}
        className="block origin-bottom"
        initial={false}
        animate={taps && !reduce ? { y: [0, -14, 0, -4, 0], scaleY: [1, 1.08, 0.9, 1.03, 1], scaleX: [1, 0.94, 1.1, 0.98, 1] } : undefined}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.span
          className="block origin-bottom"
          animate={reduce ? undefined : sleep.asleep ? { rotate: [4, 7, 4], y: [0, 1, 0] } : { rotate: [-5, 5, -5], y: [0, -2, 0] }}
          transition={{ duration: sleep.asleep ? 4.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <EcoMascot size={64} mood={mood} blinking={blinking} title="" />
        </motion.span>
      </motion.span>

      {/* sleeping: Z's float up */}
      {sleep.asleep &&
        (reduce ? (
          <span className="pointer-events-none absolute -top-1 right-0 font-display text-caption font-extrabold text-[#C7D2FE]">z z</span>
        ) : (
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute top-1 right-1 font-display font-extrabold text-[#C7D2FE] [text-shadow:0_1px_2px_rgba(0,0,0,.35)]"
              style={{ fontSize: 11 + i * 3 }}
              initial={{ opacity: 0 }}
              animate={{ x: [0, 6, 12], y: [0, -14, -30], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: 'easeOut' }}
            >
              Z
            </motion.span>
          ))
        ))}

      {/* tapped: a few hearts and sparkles pop out */}
      <AnimatePresence>
        {smiling && !reduce && (
          <motion.span key={taps} className="pointer-events-none absolute inset-0" exit={{ opacity: 0 }}>
            {['💚', '✨', '💛'].map((c, i) => (
              <motion.span
                key={i}
                className="absolute top-2 left-1/2 text-[0.8rem]"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                animate={{ x: (i - 1) * 22, y: -26 - (i % 2) * 8, opacity: [0, 1, 0], scale: 1 }}
                transition={{ duration: 1.1, delay: i * 0.08 }}
              >
                {c}
              </motion.span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
