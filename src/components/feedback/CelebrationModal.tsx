import { motion } from 'framer-motion';
import { useGame } from '../../store/GameContext';
import { LeafBurst } from './LeafBurst';
import { badges } from '../../data/badges';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/Button';
import { EcoMascot } from '../ui/EcoMascot';
import { LevelBadge } from '../ui/Badges';
import { AchievementBadge } from '../ui/AchievementBadge';
import { getBadgeStatus } from '../../utils/badges';

export function CelebrationModal() {
  const { celebrations, dismissCelebration, progress } = useGame();
  const current = celebrations[0];
  const badge = current?.type === 'badge' ? badges.find((b) => b.id === current.badgeId) : undefined;

  const title = current?.type === 'level' ? `เลเวลอัป! ตอนนี้คุณอยู่เลเวล ${current.level}` : badge ? `ปลดล็อกเหรียญตรา ${badge.name}` : '';

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
          <h2 className="mt-1 text-page font-bold text-forest">ยินดีด้วย</h2>
          <div className="mt-3">
            <LevelBadge level={current.level} size="lg" />
          </div>
          {current.level - current.from > 1 && (
            <p className="mt-2 text-caption font-medium">เลื่อนขึ้น {current.level - current.from} เลเวลรวดเดียว (จากเลเวล {current.from})</p>
          )}
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
            <AchievementBadge status={getBadgeStatus(badge, progress)} size="lg" />
          </motion.div>
        </div>
      )}
    </Modal>
  );
}
