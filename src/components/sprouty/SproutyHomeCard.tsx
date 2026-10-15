import { useEffect, useState } from 'react';
import type { Outfit } from '../../data/cosmetics';
import { motion, useReducedMotion } from 'framer-motion';
import { SproutySeed } from '../illustrations/SproutySeed';
import { SPROUTY_STAGES, getSproutyGreeting, getSproutyStage } from '../../utils/sprouty';
import { SPROUTY_TIPS } from '../../data/sproutyTips';
import { useTantrum } from './useTantrum';

interface Props {
  name: string;
  level: number;
  todayCount: number;
  streak: number;
  dailyComplete: boolean;
  now?: Date;
  outfit?: Outfit;
}

/** Sprouty on Home: greets by time of day, shows a mood from today's real records, and grows with the level. */
export function SproutyHomeCard({ name, level, todayCount, streak, dailyComplete, now, outfit }: Props) {
  const reduce = useReducedMotion();
  const [hour] = useState(() => (now ?? new Date()).getHours());
  const { mood, hello, line } = getSproutyGreeting({ hour, name, todayCount, streak, dailyComplete });
  const growth = getSproutyStage(level);
  const [hop, setHop] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const [blinking, setBlinking] = useState(false);
  const tantrum = useTantrum();

  useEffect(() => {
    if (mood === 'sleepy') return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlinking(true);
        t = setTimeout(() => {
          setBlinking(false);
          loop();
        }, 130);
      }, 2600 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, [mood]);

  const tap = () => {
    setHop((h) => h + 1);
    if (tantrum.tap() || tantrum.angry) return;
    setTip((i) => (i === null ? Math.floor(Math.random() * SPROUTY_TIPS.length) : (i + 1) % SPROUTY_TIPS.length));
  };
  const said = tantrum.angry ? tantrum.line : tip === null ? line : `${SPROUTY_TIPS[tip].lead} ${SPROUTY_TIPS[tip].hl}${SPROUTY_TIPS[tip].tail ?? ''}`;

  return (
    <section aria-label="Sprouty" className="sprouty-card relative overflow-hidden rounded-hero p-4 shadow-card sm:p-5">
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={tap}
          aria-label="แตะ Sprouty เพื่อฟังเคล็ดลับ"
          className="-mb-2 w-[104px] shrink-0 rounded-full sm:w-[120px]"
        >
          <motion.div
            animate={reduce ? undefined : tantrum.angry ? { x: [0, -7, 7, -6, 6, -3, 3, 0], rotate: [0, -4, 4, -3, 3, 0] } : { y: [0, -4, 0] }}
            transition={tantrum.angry ? { duration: 0.5 } : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SproutySeed size={120} className="h-auto w-full" mood={tantrum.angry ? 'angry' : mood} stage={growth.stage} blinking={blinking} hop={reduce ? 0 : hop} title="" outfit={outfit} />
          </motion.div>
        </button>
        <div className="min-w-0 flex-1 pb-1">
          <div className="sprouty-bubble relative rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 shadow-card">
            <p className="font-display text-body leading-snug font-semibold text-forest">{hello}</p>
            <p className="text-caption leading-snug text-text" aria-live="polite">{said}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-surface/70 px-3 py-2.5 backdrop-blur">
        <div className="flex items-center justify-between gap-2 text-caption">
          <span className="font-semibold text-forest">Sprouty: {growth.name}</span>
          <span className="text-muted">{growth.nextAt ? `โตเป็น${growth.nextName}ที่เลเวล ${growth.nextAt}` : 'โตเต็มที่แล้ว'}</span>
        </div>
        <ol className="mt-2 grid grid-cols-4 gap-1.5" aria-label="ขั้นการเติบโตของ Sprouty">
          {SPROUTY_STAGES.map((s) => {
            const reached = growth.stage >= s.stage;
            return (
              <li key={s.stage} aria-current={growth.stage === s.stage ? 'step' : undefined} className="text-center">
                <span className={`block h-1.5 rounded-full ${reached ? 'bg-primary' : 'bg-border'}`} />
                <span className={`mt-1 block text-[0.6875rem] leading-tight ${growth.stage === s.stage ? 'font-semibold text-forest' : 'text-muted'}`}>
                  Lv.{s.from}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
