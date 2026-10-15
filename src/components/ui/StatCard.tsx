import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  onDark?: boolean;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, hint, onDark = false, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={
        onDark
          ? 'rounded-control bg-white/10 p-3'
          : 'rounded-card border border-border bg-surface p-4 shadow-card'
      }
    >
      <div className={`mb-2 flex gap-2 ${onDark ? 'flex-col items-start gap-1.5 sm:flex-row sm:items-center' : 'items-center'}`}>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${onDark ? 'bg-white/10 text-lime' : 'bg-primary/10 text-primary'}`}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>
        <span className={`text-caption ${onDark ? 'text-white/75' : 'text-muted'}`}>{label}</span>
      </div>
      <p className={`font-bold leading-tight whitespace-nowrap ${onDark ? 'text-lg text-white' : 'text-xl text-text'}`}>{value}</p>
      {hint && <p className={`mt-1 text-caption ${onDark ? 'text-white/60' : 'text-muted'}`}>{hint}</p>}
    </motion.div>
  );
}
