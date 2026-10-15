import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Info, Leaf, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { missions } from '../data/missions';
import { useGame } from '../store/GameContext';
import { CATEGORY_LABELS } from '../types';
import { CATEGORY_ICON } from '../data/icons';
import { interestCategories } from '../data/avatars';
import {
  CATEGORY_FILTERS,
  SORT_LABELS,
  STATUS_FILTER_LABELS,
  countStatuses,
  filterMissions,
  statusGroup,
  type CategoryFilter,
  type SortKey,
  type StatusFilter,
} from '../utils/missionFilters';
import { MissionArt, CATEGORY_TONE } from '../components/illustrations/MissionArt';
import { FilterChips, type ChipOption } from '../components/ui/Controls';
import { MissionCard } from '../components/ui/MissionCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { XPBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { SecondaryButton } from '../components/ui/Button';

const CATEGORY_CHIPS: ChipOption<CategoryFilter>[] = CATEGORY_FILTERS.map((f) => ({
  value: f.value,
  label: f.label,
  icon: f.categories.length === 1 ? CATEGORY_ICON[f.categories[0]] : f.value === 'lifestyle' ? Leaf : undefined,
}));

const STATUS_ORDER: StatusFilter[] = ['all', 'new', 'in-progress', 'completed'];

export function Missions() {
  const { profile, getMissionStatus, startMission, getCompletedSteps } = useGame();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [query, setQuery] = useState('');

  const preferred = useMemo(() => interestCategories(profile?.preferences.selectedGoalIds ?? []), [profile]);
  const rows = useMemo(
    () => missions.filter((m) => m.active).map((m) => ({ mission: m, status: getMissionStatus(m.id) })),
    [getMissionStatus],
  );

  const overall = countStatuses(rows);
  const inCategory = filterMissions(rows, { category, status: 'all', sort, query, preferred });
  const statusCounts = countStatuses(inCategory);
  const visible = filterMissions(rows, { category, status, sort, query, preferred });
  const filtersActive = category !== 'all' || status !== 'all' || query.trim() !== '';
  const featured = filterMissions(rows, { category: 'all', status: 'new', sort: 'recommended', preferred })[0];

  const statusChips: ChipOption<StatusFilter>[] = STATUS_ORDER.map((s) => ({
    value: s,
    label: `${STATUS_FILTER_LABELS[s]} ${statusCounts[s]}`,
  }));

  const clearFilters = () => {
    setCategory('all');
    setStatus('all');
    setQuery('');
  };

  return (
    <>
      <header className="safe-top pt-5 pb-4 lg:pt-10 lg:pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest text-lime shadow-card" aria-hidden="true">
            <Leaf size={22} />
          </span>
          <div className="min-w-0">
            <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">Eco Missions</h1>
            <p className="text-body text-muted">ทุกการลงมือทำ คือการช่วยโลก</p>
          </div>
        </div>
        <div className="mt-4 max-w-md">
          <p className="mb-1.5 text-caption">
            <span className="font-semibold">{overall.completed}/{overall.all}</span> ภารกิจสำเร็จ
          </p>
          <ProgressBar value={overall.completed / overall.all} label="ภารกิจที่สำเร็จ" valueText={`${overall.completed} จาก ${overall.all} ภารกิจ`} />
        </div>
      </header>

      <div className="space-y-3">
        <div className="relative lg:max-w-md">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="ค้นหาภารกิจ"
            placeholder="ค้นหาภารกิจ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-12 w-full rounded-full border border-border bg-surface pr-4 pl-11 text-body shadow-card placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
        <FilterChips options={CATEGORY_CHIPS} value={category} onChange={setCategory} ariaLabel="หมวดหมู่ภารกิจ" />
        <FilterChips options={statusChips} value={status} onChange={setStatus} ariaLabel="สถานะภารกิจ" />
      </div>

      {!filtersActive && featured && (
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-forest-hero relative mt-5 overflow-hidden rounded-hero text-white shadow-raised lg:flex"
        >
          <div className={`relative m-2 flex h-40 items-center justify-center overflow-hidden rounded-[1.375rem] lg:h-auto lg:w-72 ${CATEGORY_TONE[featured.mission.category]}`}>
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-caption font-semibold text-forest shadow-card">
              <Sparkles size={13} aria-hidden="true" /> แนะนำ
            </span>
            <span className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-surface/30" aria-hidden="true" />
            <MissionArt category={featured.mission.category} className="relative h-32 w-32" />
          </div>
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <p className="text-caption font-semibold text-mint">{CATEGORY_LABELS[featured.mission.category]}</p>
            <h2 className="text-section leading-snug font-bold text-white">{featured.mission.title}</h2>
            <p className="mt-1 text-body text-white/80">{featured.mission.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <XPBadge amount={featured.mission.xpReward} plus />
              <span className="inline-flex items-center gap-1 text-caption text-white/80">
                <Clock size={13} aria-hidden="true" /> {featured.mission.estimatedMinutes} นาที
              </span>
              <Link
                to={`/missions/${featured.mission.id}`}
                className="ml-auto inline-flex min-h-11 items-center rounded-full bg-lime px-5 text-caption font-semibold text-forest hover:bg-mint"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        </motion.article>
      )}

      <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-section font-bold text-forest" aria-live="polite">
          ภารกิจ{filtersActive ? 'ที่ตรงเงื่อนไข' : 'ทั้งหมด'} ({visible.length})
        </h2>
        <label className="relative inline-flex items-center">
          <span className="sr-only">เรียงลำดับ</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-h-11 appearance-none rounded-full border border-border bg-surface pr-9 pl-4 text-caption font-medium focus:border-primary focus:outline-none"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>เรียง: {SORT_LABELS[k]}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3" aria-hidden="true" />
        </label>
      </div>

      <p className="mb-3 flex items-start gap-2 text-caption text-muted">
        <Info size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        ภารกิจชีวิตจริงเป็นการรายงานด้วยตนเอง (self-reported) ระบบไม่ได้ตรวจจับการกระทำจริง
      </p>

      {visible.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visible.map(({ mission, status: s }, i) => (
            <motion.li key={mission.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <MissionCard
                mission={mission}
                status={s}
                stepsDone={statusGroup(s) === 'in-progress' ? getCompletedSteps(mission.id).length : 0}
                onStart={() => startMission(mission.id)}
              />
            </motion.li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="ไม่พบภารกิจที่ตรงกับตัวกรอง"
          description="ลองเปลี่ยนหมวดหมู่ สถานะ หรือคำค้นหา"
          action={<SecondaryButton onClick={clearFilters}>ล้างตัวกรอง</SecondaryButton>}
        />
      )}
    </>
  );
}
