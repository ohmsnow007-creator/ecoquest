import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Info } from 'lucide-react';
import { missions } from '../data/missions';
import { useGame } from '../store/GameContext';
import type { MissionCategory } from '../types';
import { CATEGORY_LABELS } from '../types';
import { CATEGORY_ICON, CATEGORY_ORDER } from '../data/icons';
import { PageHeader } from '../components/ui/PageHeader';
import { FilterChips, SegmentedControl, type ChipOption } from '../components/ui/Controls';
import { MissionCard } from '../components/ui/MissionCard';
import { EmptyState } from '../components/ui/States';
import { SecondaryButton } from '../components/ui/Button';

type StatusFilter = 'all' | 'todo' | 'done';

const CATEGORY_CHIPS: ChipOption<MissionCategory | 'all'>[] = [
  { value: 'all', label: 'ทั้งหมด' },
  ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c], icon: CATEGORY_ICON[c] })),
];

export function Missions() {
  const { getMissionStatus } = useGame();
  const [category, setCategory] = useState<MissionCategory | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const withStatus = useMemo(
    () => missions.filter((m) => m.active).map((m) => ({ mission: m, status: getMissionStatus(m.id) })),
    [getMissionStatus],
  );

  const inCategory = withStatus.filter(({ mission }) => {
    if (category !== 'all' && mission.category !== category) return false;
    const q = search.trim().toLowerCase();
    return !q || mission.title.toLowerCase().includes(q) || mission.description.toLowerCase().includes(q);
  });
  const isDone = (s: string) => s === 'completed-today' || s === 'completed-once';
  const todoCount = inCategory.filter((m) => !isDone(m.status)).length;
  const visible = inCategory.filter((m) =>
    status === 'all' ? true : status === 'todo' ? !isDone(m.status) : isDone(m.status),
  );

  const clearFilters = () => {
    setCategory('all');
    setStatus('all');
    setSearch('');
  };

  return (
    <>
      <PageHeader title="ภารกิจ" subtitle="เลือกภารกิจรักษ์โลกที่อยากทำวันนี้" />

      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="ค้นหาภารกิจ"
            placeholder="ค้นหาภารกิจ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-12 w-full rounded-control border border-border bg-surface pr-4 pl-11 text-body shadow-card placeholder:text-muted focus:border-primary focus:outline-none lg:max-w-md"
          />
        </div>
        <FilterChips options={CATEGORY_CHIPS} value={category} onChange={setCategory} ariaLabel="กรองตามหมวดหมู่" />
        <SegmentedControl
          ariaLabel="กรองตามสถานะ"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'ทั้งหมด', count: inCategory.length },
            { value: 'todo', label: 'ยังไม่ทำ', count: todoCount },
            { value: 'done', label: 'ทำแล้ว', count: inCategory.length - todoCount },
          ]}
        />
      </div>

      <p className="mt-4 flex items-start gap-2 text-caption text-muted">
        <Info size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        ภารกิจชีวิตจริงเป็นการรายงานด้วยตนเอง (self-reported) ระบบไม่ได้ตรวจจับการกระทำจริง
      </p>

      {visible.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visible.map(({ mission, status: s }, i) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <MissionCard mission={mission} status={s} to={`/missions/${mission.id}`} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="ไม่พบภารกิจที่ตรงกับเงื่อนไข"
          description="ลองเปลี่ยนหมวดหมู่ สถานะ หรือคำค้นหา"
          action={<SecondaryButton onClick={clearFilters}>ล้างตัวกรอง</SecondaryButton>}
        />
      )}
    </>
  );
}
