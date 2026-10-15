import { useState } from 'react';
import { SproutyTalk } from '../components/sprouty/PlayerSprouty';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, CalendarCheck, BookOpen, Globe2, Info, type LucideIcon } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { badges, BADGE_GROUP_LABELS } from '../data/badges';
import { getAllBadgeStatuses, type BadgeStatus } from '../utils/badges';
import { getPlayerStats } from '../utils/playerStats';
import { getRecentActivity } from '../utils/activity';
import { getLevelConfig } from '../utils/xp';
import { LEVELS, MAX_LEVEL } from '../config/levels';
import type { BadgeGroup } from '../types';
import { BadgeMedal } from '../components/illustrations/BadgeMedal';
import { AchievementBadge } from '../components/ui/AchievementBadge';
import { FilterChips, type ChipOption } from '../components/ui/Controls';
import { ProgressBar, ProgressRing } from '../components/ui/ProgressBar';
import { LevelBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';

type GroupFilter = 'all' | BadgeGroup;
const GROUPS: BadgeGroup[] = ['missions', 'consistency', 'learning', 'world'];
const GROUP_ICON: Record<BadgeGroup, LucideIcon> = { missions: Target, consistency: CalendarCheck, learning: BookOpen, world: Globe2 };

const CHIPS: ChipOption<GroupFilter>[] = [{ value: 'all', label: 'ทั้งหมด' }, ...GROUPS.map((g) => ({ value: g, label: BADGE_GROUP_LABELS[g], icon: GROUP_ICON[g] }))];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-section font-bold text-forest">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function BadgeRow({ status }: { status: BadgeStatus }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <BadgeMedal badge={status.badge} unlocked={status.unlocked} size={56} />
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold">{status.badge.name}</p>
        <p className="text-caption text-muted">{status.unlockCondition}</p>
        {status.unlocked ? (
          <p className="text-caption font-medium text-success">ปลดล็อกเมื่อ {status.unlockedAt ? formatDate(status.unlockedAt) : '-'}</p>
        ) : (
          <div className="mt-1.5">
            <ProgressBar value={status.progress} size="sm" label={`ความคืบหน้า ${status.badge.name}`} showLabel valueText={`${status.current}/${status.target}`} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Achievements() {
  const { progress } = useGame();
  const [group, setGroup] = useState<GroupFilter>('all');

  const statuses = getAllBadgeStatuses(progress);
  const stats = getPlayerStats(progress);
  const level = getLevelConfig(stats.xp);
  const nextLevel = level.level < MAX_LEVEL ? LEVELS[level.level] : null;
  const week = getRecentActivity(progress);

  const unlockedCount = statuses.filter((s) => s.unlocked).length;
  const recent = statuses
    .filter((s) => s.unlocked)
    .sort((a, b) => new Date(b.unlockedAt ?? 0).getTime() - new Date(a.unlockedAt ?? 0).getTime())
    .slice(0, 3);
  const closest = statuses.filter((s) => !s.unlocked).sort((a, b) => b.progress - a.progress)[0];
  const shown = statuses.filter((s) => group === 'all' || s.badge.group === group);
  const shownUnlocked = shown.filter((s) => s.unlocked);
  const shownLocked = shown.filter((s) => !s.unlocked);

  // Sprouty points at the locked badge that is closest to unlocking.
  const sproutyLine: { text: string; mood: 'happy' | 'cheer' } = !closest
    ? { text: 'ปลดล็อกครบทุกเหรียญแล้ว! สุดยอดไปเลย', mood: 'cheer' }
    : closest.progress >= 1
      ? { text: `ทำครบเงื่อนไข “${closest.badge.name}” แล้ว เหรียญจะปลดล็อกเมื่อทำภารกิจหรือควิซครั้งถัดไป`, mood: 'cheer' }
      : closest.progress >= 0.5
      ? { text: `อีกนิดเดียวจะได้ “${closest.badge.name}” แล้ว (${closest.current}/${closest.target})`, mood: 'cheer' }
      : { text: `ได้แล้ว ${unlockedCount} เหรียญ เหรียญถัดไป: “${closest.badge.name}” ${closest.unlockCondition}`, mood: 'happy' };

  return (
    <>
      <header className="safe-top flex items-center gap-3 pt-5 pb-4 lg:pt-10 lg:pb-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-card bg-tag-yellow text-forest" aria-hidden="true">
          <Trophy size={22} />
        </span>
        <div>
          <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">Achievements</h1>
          <p className="text-body text-muted">ทุกความพยายามมีความหมาย</p>
        </div>
      </header>
      <SproutyTalk className="-mt-1 mb-4 max-w-md" text={sproutyLine.text} mood={sproutyLine.mood} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-5 lg:col-span-2">
          {/* Summary */}
          <motion.section
            aria-label="สรุปเหรียญและเลเวล"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-forest-hero flex items-center gap-4 rounded-hero p-4 text-white shadow-raised sm:p-5"
          >
            <BadgeMedal badge={{ ...badges[0], icon: 'Trophy', rarity: 'legendary' }} unlocked size={76} />
            <div className="min-w-0 flex-1">
              <p className="text-caption text-mint">เหรียญที่ได้รับ</p>
              <p className="text-[1.75rem] leading-tight font-bold text-white">
                {unlockedCount} <span className="text-section text-white/70">/ {badges.length}</span>
              </p>
              <div className="mt-1.5">
                <ProgressBar value={unlockedCount / badges.length} label="เหรียญที่ปลดล็อก" valueText={`${unlockedCount} จาก ${badges.length}`} tone="lime" onDark />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-caption">
                <LevelBadge level={level.level} variant="onDark" />
                <span className="text-white/80">{level.title}</span>
                <span className="text-white/80">· {stats.xpInLevel}/{stats.xpForNextLevel || stats.xpInLevel} XP</span>
              </div>
            </div>
          </motion.section>

          <FilterChips options={CHIPS} value={group} onChange={setGroup} ariaLabel="หมวดหมู่เหรียญ" />

          {/* Featured: closest to unlock */}
          {closest ? (
            <Section title="ใกล้ปลดล็อกที่สุด">
              <BadgeRow status={closest} />
            </Section>
          ) : (
            <p className="rounded-card bg-pale-mint p-4 text-body font-semibold text-forest ring-1 ring-mint">ยอดเยี่ยม! คุณปลดล็อกเหรียญครบทุกเหรียญแล้ว</p>
          )}

          {/* Recently unlocked */}
          <Section title="เหรียญล่าสุด">
            {recent.length === 0 ? (
              <div className="rounded-card border border-border bg-surface">
                <EmptyState compact title="ยังไม่มีเหรียญ" description='ทำภารกิจแรกให้สำเร็จเพื่อรับเหรียญ "First Step"' />
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((s) => (
                  <li key={s.badge.id}>
                    <BadgeRow status={s} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* All, split into unlocked and locked */}
          <Section title={`เหรียญทั้งหมด (${shown.length})`}>
            {shownUnlocked.length > 0 && (
              <>
                <h3 className="mb-2 text-caption font-semibold text-success">ปลดล็อกแล้ว ({shownUnlocked.length})</h3>
                <ul className="mb-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
                  {shownUnlocked.map((s) => (
                    <li key={s.badge.id}>
                      <AchievementBadge status={s} />
                    </li>
                  ))}
                </ul>
              </>
            )}
            {shownLocked.length > 0 && (
              <>
                <h3 className="mb-2 text-caption font-semibold text-muted">ยังล็อกอยู่ ({shownLocked.length})</h3>
                <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
                  {shownLocked.map((s) => (
                    <li key={s.badge.id}>
                      <AchievementBadge status={s} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          {/* Groups */}
          <Section title="หมวดหมู่">
            <ul className="grid grid-cols-4 gap-2">
              {GROUPS.map((g) => {
                const inGroup = statuses.filter((s) => s.badge.group === g);
                const done = inGroup.filter((s) => s.unlocked).length;
                const Icon = GROUP_ICON[g];
                return (
                  <li key={g}>
                    <button
                      type="button"
                      onClick={() => setGroup(g)}
                      aria-pressed={group === g}
                      aria-label={`${BADGE_GROUP_LABELS[g]} ปลดล็อก ${done} จาก ${inGroup.length}`}
                      className={`flex w-full flex-col items-center gap-1 rounded-2xl p-1.5 text-center ${group === g ? 'bg-pale-mint' : ''}`}
                    >
                      <ProgressRing value={done / inGroup.length} size={56} stroke={5} label={BADGE_GROUP_LABELS[g]}>
                        <Icon size={20} className="text-primary" aria-hidden="true" />
                      </ProgressRing>
                      <span className="text-[0.75rem] leading-tight font-medium">{BADGE_GROUP_LABELS[g]}</span>
                      <span className="text-[0.75rem] text-muted">
                        {done}/{inGroup.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Level */}
          <section aria-label="ระดับเลเวล" className="rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-section font-bold text-forest">เลเวล {level.level}</h2>
              <span className="rounded-full bg-lime px-2.5 py-0.5 text-caption font-semibold text-forest">{level.title}</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={stats.levelProgress}
                label={`ความคืบหน้าสู่เลเวล ${level.level + 1}`}
                showLabel
                valueText={nextLevel ? `${stats.xpInLevel}/${stats.xpForNextLevel} XP` : 'เลเวลสูงสุด'}
              />
            </div>
            <p className="mt-2 text-caption text-muted">
              {nextLevel
                ? `อีก ${nextLevel.minXp - stats.xp} XP ถึงเลเวล ${nextLevel.level}${nextLevel.title !== level.title ? ` (${nextLevel.title})` : ''}`
                : 'คุณถึงเลเวลสูงสุดแล้ว'}
            </p>
            <p className="mt-1 text-caption text-muted">XP สะสมทั้งหมด {stats.xp.toLocaleString('th-TH')} XP</p>
          </section>

          {/* Streak */}
          <section aria-label="ความต่อเนื่อง" className="rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warning/15 text-warning" aria-hidden="true">
                <Flame size={22} />
              </span>
              <div>
                <p className="text-caption text-muted">Streak ปัจจุบัน</p>
                <p className="text-section leading-tight font-bold">{stats.streak} วัน</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-caption text-muted">สูงสุด</p>
                <p className="text-body font-semibold">{stats.longestStreak} วัน</p>
              </div>
            </div>
            <ol className="mt-4 grid grid-cols-7 gap-1 text-center" aria-label="ภารกิจ 7 วันล่าสุด">
              {week.map((d) => (
                <li key={d.date} className="flex flex-col items-center gap-1">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.75rem] font-semibold ${d.missions > 0 ? 'bg-primary text-white' : 'bg-background text-muted'}`}
                    aria-label={`${d.label} ${d.missions > 0 ? `ทำภารกิจ ${d.missions} ครั้ง` : 'ไม่มีภารกิจ'}`}
                  >
                    {d.missions > 0 ? d.missions : '–'}
                  </span>
                  <span className="text-[0.75rem] text-muted">{d.label}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-start gap-1.5 text-caption text-muted">
              <Info size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              นับเฉพาะวันที่ทำภารกิจสำเร็จอย่างน้อย 1 ภารกิจ ตามวันที่ในเขตเวลาของอุปกรณ์ การทำควิซหรือการเปิดแอปไม่นับเป็น Streak และ Streak ยังนับต่อถ้าวันนี้ยังไม่ได้ทำแต่ทำเมื่อวาน
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
