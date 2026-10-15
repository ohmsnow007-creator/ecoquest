import { AnimatePresence, motion } from 'framer-motion';
import { useOutfit } from '../cosmetics/useOutfit';
import { X, Sparkles, Award, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { useGame, type Toast } from '../../store/GameContext';
import { SproutySeed } from '../illustrations/SproutySeed';
import { getSproutyStage } from '../../utils/sprouty';
import { getLevelFromXp } from '../../utils/xp';

const CHEERS = ['เยี่ยมไปเลย!', 'สุดยอด!', 'โลกขอบคุณนะ!', 'เก่งมาก!', 'อีกก้าวแล้ว!'];

/** XP rewards: Sprouty pops up, hops and cheers instead of a plain notice. */
function SproutyCheer({ toast, stage, onClose }: { toast: Toast; stage: ReturnType<typeof getSproutyStage>['stage']; onClose: () => void }) {
  const outfit = useOutfit();
  const cheer = CHEERS[[...toast.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % CHEERS.length];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', damping: 16, stiffness: 280 }}
      className="sprouty-card pointer-events-auto flex items-end gap-2 rounded-2xl py-2 pr-2 pl-1 shadow-raised"
    >
      <motion.span
        className="-mb-1 block w-16 shrink-0"
        initial={{ y: 20, rotate: -8 }}
        animate={{ y: [20, -10, 0, -4, 0], rotate: [-8, 6, 0] }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <SproutySeed size={64} className="h-auto w-full" mood="cheer" stage={stage} title="" outfit={outfit} />
      </motion.span>
      <span className="min-w-0 flex-1 pb-1.5">
        <span className="block font-display text-body leading-tight font-bold text-forest">{cheer}</span>
        <span className="block text-caption font-semibold text-primary">{toast.message}</span>
      </span>
      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full text-forest opacity-60 hover:opacity-100"
        aria-label="ปิดการแจ้งเตือน"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

const STYLE: Record<Toast['type'], { icon: typeof Info; box: string; iconClass: string }> = {
  xp: { icon: Sparkles, box: 'bg-forest text-white', iconClass: 'text-lime' },
  badge: { icon: Award, box: 'bg-surface text-text border border-border', iconClass: 'text-warning' },
  level: { icon: TrendingUp, box: 'bg-primary text-white', iconClass: 'text-lime' },
  info: { icon: Info, box: 'bg-surface text-text border border-border', iconClass: 'text-primary' },
  error: { icon: AlertCircle, box: 'bg-danger text-white', iconClass: 'text-white' },
};

export function ToastNotification() {
  const { toasts, dismissToast, progress } = useGame();
  const stage = getSproutyStage(getLevelFromXp(progress.totalXp)).stage;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-3 left-1/2 z-[250] flex w-[calc(100%-32px)] max-w-sm -translate-x-1/2 flex-col gap-2 lg:top-6 lg:right-6 lg:left-auto lg:translate-x-0"
      style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          if (toast.type === 'xp') return <SproutyCheer key={toast.id} toast={toast} stage={stage} onClose={() => dismissToast(toast.id)} />;
          const s = STYLE[toast.type];
          const Icon = s.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-control px-4 py-3 shadow-raised ${s.box}`}
            >
              <motion.span
                className={s.iconClass}
                initial={false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 260 }}
                aria-hidden="true"
              >
                <Icon size={20} />
              </motion.span>
              <span className="flex-1 text-body font-semibold">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full opacity-70 hover:opacity-100"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
