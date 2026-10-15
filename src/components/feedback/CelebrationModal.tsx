import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { badges } from '../../data/badges';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/Button';
import { EcoMascot } from '../ui/EcoMascot';
import { LevelBadge } from '../ui/Badges';
import { AchievementBadge } from '../ui/AchievementBadge';

const LEAVES = [
  { x: -120, y: -90, r: -40 },
  { x: 120, y: -80, r: 35 },
  { x: -90, y: 40, r: -70 },
  { x: 100, y: 50, r: 80 },
  { x: -30, y: -120, r: 10 },
  { x: 40, y: -110, r: -20 },
];

function LeafBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {LEAVES.map((l, i) => (
        <motion.span
          key={i}
          className="absolute text-emerald"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ x: l.x, y: l.y, opacity: [0, 1, 0], scale: 1, rotate: l.r }}
          transition={{ duration: 1.1, delay: 0.1 + i * 0.03, ease: 'easeOut' }}
        >
          <Leaf size={18} />
        </motion.span>
      ))}
    </div>
  );
}

export function CelebrationModal() {
  const { celebrations, dismissCelebration } = useGame();
  const current = celebrations[0];
  const badge = current?.type === 'badge' ? badges.find((b) => b.id === current.badgeId) : undefined;

  const title = current?.type === 'level' ? `เลเวลอัป! ตอนนี้คุณอยู่เลเวล ${current.level}` : badge ? `ปลดล็อกเหรียญตรา ${badge.title}` : '';

  return (
    <Modal
      open={Boolean(current)}
      onClose={dismissCelebration}
      title={title}
      hideTitle
      footer={<PrimaryButton fullWidth onClick={dismissCelebration}>เยี่ยมเลย</PrimaryButton>}
    >
      {current?.type === 'level' && (
        <div key={current.id} className="relative flex flex-col items-center pt-2 text-center">
          <LeafBurst />
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }}>
            <EcoMascot size={132} mood="cheer" title="Sprouty ดีใจกับเลเวลใหม่ของคุณ" />
          </motion.div>
          <p className="mt-2 text-caption font-semibold text-primary">เลเวลอัป!</p>
          <h2 className="mt-1 text-page font-bold">ยินดีด้วย</h2>
          <div className="mt-3">
            <LevelBadge level={current.level} size="lg" />
          </div>
          <p className="mt-3 text-body text-muted">สะสม XP จากภารกิจและควิซต่อไปเพื่อปลดล็อกระดับถัดไป</p>
        </div>
      )}

      {current?.type === 'badge' && badge && (
        <div key={current.id} className="relative pt-2">
          <LeafBurst />
          <p className="mb-4 text-center text-caption font-semibold text-primary">ปลดล็อกเหรียญตราใหม่</p>
          <motion.div
            initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 11, stiffness: 180 }}
          >
            <AchievementBadge badge={badge} unlocked size="lg" />
          </motion.div>
        </div>
      )}
    </Modal>
  );
}
