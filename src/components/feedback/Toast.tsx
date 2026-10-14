import { useGame } from '../../store/GameContext';
import { X, Sparkles, Award, TrendingUp, Info, AlertCircle } from 'lucide-react';

const iconMap = {
  xp: Sparkles,
  badge: Award,
  level: TrendingUp,
  info: Info,
  error: AlertCircle,
};

const bgMap = {
  xp: 'bg-green-600',
  badge: 'bg-amber-500',
  level: 'bg-sky-500',
  info: 'bg-green-700',
  error: 'bg-rose-500',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-32px)] max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`${bgMap[toast.type]} text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 pointer-events-auto animate-slide-down`}
          >
            <Icon size={20} />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="ปิด"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
