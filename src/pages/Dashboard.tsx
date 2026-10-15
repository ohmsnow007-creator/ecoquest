import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, Flame, Target, ListChecks, Leaf, ChevronRight, Brain, Medal, TrendingUp, Sparkles, Timer, CheckCircle2, Circle,
  type LucideIcon,
} from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getPlayerStats } from '../utils/playerStats';
import { getWorldState, explainWorld } from '../utils/world';
import { buildActivityFeed, formatRelativeTime, type ActivityEvent } from '../utils/activity';
import { missions } from '../data/missions';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import type { Mission, MissionProgressStatus } from '../types';
import { CATEGORY_ICON } from '../data/icons';
import { interestCategories } from '../data/avatars';
import { GreenWorldScene } from '../components/world/GreenWorldScene';
import { NotificationBell } from '../components/feedback/NotificationBell';
import { Avatar } from '../components/ui/AvatarPicker';
import { LevelBadge, XPBadge } from '../components/ui/Badges';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionTitle } from '../components/ui/Card';
import { EcoMascot } from '../components/ui/EcoMascot';
import { EmptyState } from '../components/ui/States';
import { buttonClasses } from '../components/ui/Button';

const STATUS_META: Record<MissionProgressStatus, { label: string; icon: LucideIcon; className: string }> = {
  available: { label: 'พร้อมทำ', icon: Circle, className: 'bg-pale-mint text-primary' },
  'in-progress': { label: 'กำลังทำ', icon: Timer, className: 'bg-lime text-forest' },
  'completed-today': { label: 'สำเร็จแล้ว', icon: CheckCircle2, className: 'bg-forest text-mint' },
  'completed-once': { label: 'สำเร็จแล้ว', icon: CheckCircle2, className: 'bg-forest text-mint' },
};

const STATUS_ORDER: Record<MissionProgressStatus, number> = { 'in-progress': 0, available: 1, 'completed-today': 2, 'completed-once': 3 };

const QUICK_ACTIONS: { to: string; label: string; aria: string; icon: LucideIcon; tone: string }[] = [
  { to: '/missions', label: 'ภารกิจ', aria: 'ดูภารกิจทั้งหมด', icon: Target, tone: 'bg-mint text-forest' },
  { to: '/quiz', label: 'แบบทดสอบ', aria: 'ทำแบบทดสอบ', icon: Brain, tone: 'bg-tag-sky text-forest' },
  { to: '/achievements', label: 'รางวัล', aria: 'ดูรางวัลและเหรียญตรา', icon: Medal, tone: 'bg-tag-yellow text-forest' },
  { to: '/impact', label: 'ผลกระทบ', aria: 'ดู Green Impact', icon: Leaf, tone: 'bg-tag-lavender text-forest' },
];

function ViewAll({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center gap-0.5 text-caption font-semibold text-primary">
      ดูทั้งหมด <ChevronRight size={15} aria-hidden="true" />
    </Link>
  );
}

function StatLink({ to, icon: Icon, label, value, hint, delay }: { to: string; icon: LucideIcon; label: string; value: string; hint?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link to={to} className="flex h-full flex-col rounded-card border border-border bg-surface p-3 shadow-card transition-colors hover:border-primary/40 hover:bg-pale-mint/40 sm:p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-mint text-primary" aria-hidden="true">
          <Icon size={17} />
        </span>
        <span className="mt-1.5 text-[0.75rem] leading-tight whitespace-nowrap text-muted sm:text-caption">{label}</span>
        <span className="mt-1 text-xl leading-tight font-bold text-forest">{value}</span>
        {hint && <span className="mt-0.5 text-[0.75rem] leading-snug text-muted">{hint}</span>}
      </Link>
    </motion.div>
  );
}

function DailyMissionRow({ mission, status }: { mission: Mission; status: MissionProgressStatus }) {
  const Icon = CATEGORY_ICON[mission.category];
  const meta = STATUS_META[status];
  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card sm:p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-pale-mint text-primary ring-1 ring-mint" aria-hidden="true">
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-card font-semibold text-forest">{mission.title}</p>
        <p className="truncate text-caption text-muted">
          {CATEGORY_LABELS[mission.category]} · {DIFFICULTY_LABELS[mission.difficulty]}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <XPBadge amount={mission.xpReward} />
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold ${meta.className}`}>
            <meta.icon size={12} aria-hidden="true" />
            {meta.label}
          </span>
        </div>
      </div>
      <Link
        to={`/missions/${mission.id}`}
        aria-label={`ดูภารกิจ ${mission.title}`}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary px-4 text-caption font-semibold text-white shadow-[0_4px_12px_rgb(14_127_89/0.25)] hover:bg-forest"
      >
        ดูภารกิจ
      </Link>
    </li>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  let Icon: LucideIcon = Sparkles;
  let text = '';
  let xp = 0;
  let tag: string | null = null;
  if (event.type === 'mission') {
    const m = missions.find((x) => x.id === event.missionId);
    Icon = m ? CATEGORY_ICON[m.category] : Target;
    text = `ทำภารกิจ "${event.title}" สำเร็จ`;
    xp = event.xp;
    if (event.selfReported) tag = 'รายงานเอง';
  } else if (event.type === 'quiz') {
    Icon = Brain;
    text = `ทำ${event.title} ถูก ${event.correctCount}/${event.total} ข้อ`;
    xp = event.xp;
  } else if (event.type === 'badge') {
    Icon = Medal;
    text = `ปลดล็อกเหรียญ "${event.title}"`;
  } else {
    Icon = TrendingUp;
    text = `เลื่อนเป็นเลเวล ${event.level}`;
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale-mint text-primary" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body">{text}</p>
        <p className="text-caption text-muted">
          {xp > 0 && <span className="font-semibold text-primary">+{xp} XP · </span>}
          {formatRelativeTime(event.at)}
          {tag && ` · ${tag}`}
        </p>
      </div>
    </li>
  );
}

export function Dashboard() {
  const { profile, progress, getMissionStatus } = useGame();
  if (!profile) return null;

  const stats = getPlayerStats(progress);
  const world = getWorldState(stats.missionsCompleted);
  const preferred = interestCategories(profile.preferences.selectedGoalIds);
  const feed = buildActivityFeed(progress).slice(0, 5);

  const daily = missions
    .filter((m) => m.active && m.repeatPolicy === 'daily')
    .map((m) => ({ mission: m, status: getMissionStatus(m.id) }))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        Number(preferred.has(b.mission.category)) - Number(preferred.has(a.mission.category)),
    )
    .slice(0, 3);

  return (
    <>
      {/* 1. Header */}
      <header className="safe-top flex items-center gap-3 pt-5 pb-4 lg:pt-10 lg:pb-6">
        <Link to="/profile" aria-label="โปรไฟล์ของฉัน" className="shrink-0 rounded-full ring-2 ring-mint ring-offset-2 ring-offset-background">
          <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="lg" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-section leading-tight font-bold text-forest">สวัสดี {profile.displayName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
            <LevelBadge level={stats.level} />
            <span className="text-muted">
              {stats.xpInLevel}/{stats.xpForNextLevel} XP
            </span>
            {stats.streak > 0 && (
              <span className="inline-flex items-center gap-0.5 font-semibold">
                <Flame size={13} className="text-warning" aria-hidden="true" />
                {stats.streak} วัน
              </span>
            )}
          </div>
          <div className="mt-1.5 max-w-xs">
            <ProgressBar
              value={stats.levelProgress}
              label={`ความคืบหน้าสู่เลเวล ${stats.level + 1}`}
              size="sm"
              valueText={`${stats.xpInLevel} จาก ${stats.xpForNextLevel} XP`}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <Link
            to="/settings"
            aria-label="ตั้งค่า"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-forest shadow-card hover:bg-pale-mint"
          >
            <Settings size={19} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* 2. Virtual world hero */}
        <section aria-labelledby="world-title" className="bg-forest-hero overflow-hidden rounded-hero text-white shadow-raised lg:col-span-2">
          <div className="relative h-60 overflow-hidden rounded-b-[1.5rem] sm:h-72 lg:h-80">
            <GreenWorldScene key={world.current.stage} stage={world.current.stage} />
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 left-1/2 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl bg-surface/95 px-4 py-2 text-center text-caption font-medium text-forest shadow-card"
            >
              {explainWorld(stats.missionsCompleted, stats.byCategory)}
            </motion.p>
            <span className="absolute bottom-3 left-3 rounded-2xl bg-forest/90 px-3 py-1.5 text-white shadow-card ring-1 ring-white/15 backdrop-blur">
              <span className="block text-[0.75rem] leading-tight text-mint">ระดับ {world.current.stage}</span>
              <span id="world-title" className="block text-caption leading-tight font-semibold">{world.current.title}</span>
            </span>
            <span className="absolute right-2 bottom-1">
              <EcoMascot size={64} mood={world.current.stage >= 3 ? 'cheer' : 'happy'} title="" />
            </span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-caption text-white/85">
                {world.next ? (
                  <>
                    อีก <span className="font-semibold">{world.missionsToNext} ภารกิจ</span> ถึง “{world.next.title}”
                  </>
                ) : (
                  'โลกของคุณเติบโตเต็มที่แล้ว'
                )}
              </p>
              <ProgressBar value={world.progress} label="ความคืบหน้าโลกสีเขียว" size="md" tone="lime" onDark />
            </div>
            <Link to="/world" className="inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full bg-lime px-4 text-caption font-semibold text-forest hover:bg-mint">
              ดูโลกของฉัน <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* 4. Quick stats */}
        <section aria-label="สถิติโดยย่อ" className="grid grid-cols-3 content-start gap-2.5 sm:gap-3">
          <StatLink to="/progress" icon={Target} label="ภารกิจสำเร็จ" value={`${stats.missionsCompleted}`} hint={`วันนี้ ${stats.todayMissions}`} delay={0} />
          <StatLink to="/progress" icon={ListChecks} label="บันทึกแล้ว" value={`${stats.activityCount}`} hint="ภารกิจ + ควิซ" delay={0.05} />
          <StatLink
            to="/impact"
            icon={Leaf}
            label="ผลกระทบ"
            value={stats.selfReportedCount > 0 ? `${stats.selfReportedCount} ครั้ง` : '–'}
            hint={stats.selfReportedCount > 0 ? 'กิจกรรมจริงที่รายงาน' : 'เริ่มบันทึกกิจกรรมเพื่อดูผลลัพธ์'}
            delay={0.1}
          />
        </section>

        {/* 5. Daily missions */}
        <section aria-labelledby="daily-title" className="lg:col-span-2 lg:row-span-2">
          <SectionTitle id="daily-title" title="ภารกิจวันนี้" action={<ViewAll to="/missions" />} />
          <ul className="space-y-2.5">
            {daily.map(({ mission, status }) => (
              <DailyMissionRow key={mission.id} mission={mission} status={status} />
            ))}
          </ul>
        </section>

        {/* 6. Quick actions */}
        <section aria-labelledby="quick-title">
          <SectionTitle id="quick-title" title="ทางลัด" />
          <ul className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ to, label, aria, icon: Icon, tone }) => (
              <li key={to}>
                <Link to={to} aria-label={aria} className="group flex flex-col items-center gap-1.5 rounded-2xl p-1 text-center">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-[1.125rem] shadow-card ring-1 ring-forest/5 transition-transform group-hover:-translate-y-0.5 ${tone}`} aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <span className="text-caption font-medium text-forest">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 7. Recent activity */}
        <section aria-labelledby="activity-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
          <SectionTitle id="activity-title" title="กิจกรรมล่าสุด" action={feed.length > 0 ? <ViewAll to="/progress" /> : undefined} className="mb-0" />
          {feed.length === 0 ? (
            <EmptyState
              compact
              title="ยังไม่มีกิจกรรม"
              description="เริ่มภารกิจแรกของคุณ แล้วความคืบหน้าจะแสดงที่นี่"
              action={<Link to="/missions" className={buttonClasses('primary')}>เริ่มภารกิจแรก</Link>}
            />
          ) : (
            <ul className="divide-y divide-border">
              {feed.map((e) => (
                <ActivityRow key={e.id} event={e} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
