import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles, Award, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { useGame, type Toast } from '../../store/GameContext';

const STYLE: Record<Toast['type'], { icon: typeof Info; box: string; iconClass: string }> = {
  xp: { icon: Sparkles, box: 'bg-forest text-white', iconClass: 'text-lime' },
  badge: { icon: Award, box: 'bg-surface text-text border border-border', iconClass: 'text-warning' },
  level: { icon: TrendingUp, box: 'bg-primary text-white', iconClass: 'text-lime' },
  info: { icon: Info, box: 'bg-surface text-text border border-border', iconClass: 'text-primary' },
  error: { icon: AlertCircle, box: 'bg-danger text-white', iconClass: 'text-white' },
};

export function ToastNotification() {
  const { toasts, dismissToast } = useGame();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-3 left-1/2 z-[150] flex w-[calc(100%-32px)] max-w-sm -translate-x-1/2 flex-col gap-2 lg:top-6 lg:right-6 lg:left-auto lg:translate-x-0"
      style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
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
                initial={toast.type === 'xp' ? { scale: 0.4, rotate: -30 } : false}
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
