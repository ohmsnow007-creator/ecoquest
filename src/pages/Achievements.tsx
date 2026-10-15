import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/GameContext';
import { badges as allBadges } from '../data/badges';
import { getBadgeProgress } from '../utils/badges';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/Controls';
import { AchievementBadge } from '../components/ui/AchievementBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/States';

type Filter = 'all' | 'unlocked' | 'locked';

export function Achievements() {
  const { progress } = useGame();
  const [filter, setFilter] = useState<Filter>('all');
  const records = new Map(progress.unlockedBadges.map((r) => [r.badgeId, r]));
  const unlockedCount = allBadges.filter((b) => records.has(b.id)).length;

  const visible = allBadges
    .filter((b) => (filter === 'all' ? true : filter === 'unlocked' ? records.has(b.id) : !records.has(b.id)))
    .sort((a, b) => Number(records.has(b.id)) - Number(records.has(a.id)));

  return (
    <>
      <PageHeader title="เหรียญตรา" subtitle="ปลดล็อกเหรียญตราจากภารกิจ ควิซ และความต่อเนื่อง" />

      <div className="mb-4 max-w-md">
        <ProgressBar value={unlockedCount / allBadges.length} label="เหรียญตราที่ปลดล็อก" showLabel valueText={`${unlockedCount}/${allBadges.length}`} />
      </div>

      <SegmentedControl
        ariaLabel="กรองเหรียญตรา"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'ทั้งหมด', count: allBadges.length },
          { value: 'unlocked', label: 'ปลดล็อกแล้ว', count: unlockedCount },
          { value: 'locked', label: 'ยังล็อก', count: allBadges.length - unlockedCount },
        ]}
      />

      {visible.length === 0 ? (
        <EmptyState title="ยังไม่มีเหรียญตราที่ปลดล็อก" description="ทำภารกิจแรกเพื่อรับเหรียญตราเหรียญแรกของคุณ" />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((badge, i) => {
            const record = records.get(badge.id);
            return (
              <motion.div key={badge.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <AchievementBadge
                  badge={badge}
                  unlocked={Boolean(record)}
                  unlockedAt={record?.unlockedAt}
                  progress={record ? 1 : getBadgeProgress(badge, progress)}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
