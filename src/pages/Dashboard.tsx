import { Link } from 'react-router-dom';
import { Flame, Target, Medal, ChevronRight, Brain, Settings } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getLevelFromXp, getXpInCurrentLevel, getXpToNextLevel, getLevelProgress } from '../utils/xp';
import { calculateStreak } from '../utils/streak';
import { getCurrentStage, getNextStage, getStageProgress } from '../utils/world';
import { badges as allBadges } from '../data/badges';
import { missions } from '../data/missions';
import { quizzes } from '../data/quizzes';
import { getBadgeIcon } from '../data/icons';
import { WorldPreview } from '../components/world/WorldPreview';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { ProgressRing, ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { MissionCard } from '../components/ui/MissionCard';
import { EmptyState } from '../components/ui/States';
import { XPBadge } from '../components/ui/Badges';
import { Avatar } from '../components/ui/AvatarPicker';
import { buttonClasses } from '../components/ui/Button';

export function Dashboard() {
  const { profile, progress, getTodayCompletionCount, getMissionStatus, isQuizCompleted } = useGame();
  if (!profile) return null;

  const level = getLevelFromXp(progress.totalXp);
  const streak = calculateStreak(progress.completions);
  const todayCount = getTodayCompletionCount();
  const stage = getCurrentStage(progress.totalXp);
  const nextStage = getNextStage(progress.totalXp);

  const dailyAvailable = missions.filter((m) => m.active && m.repeatPolicy === 'daily' && getMissionStatus(m.id) === 'available');
  const quizLeft = quizzes.filter((q) => !isQuizCompleted(q.id)).length;

  const recentBadges = progress.unlockedBadges
    .slice()
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3)
    .map((r) => allBadges.find((b) => b.id === r.badgeId))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <>
      <PageHeader
        eyebrow="สวัสดี"
        title={profile.displayName}
        actions={
          <>
            <XPBadge amount={progress.totalXp} variant="solid" />
            <Link to="/settings" aria-label="ตั้งค่าโปรไฟล์" className="lg:hidden">
              <Avatar id={profile.avatarId} size="sm" />
            </Link>
            <Link to="/settings" aria-label="ตั้งค่า" className="hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-card hover:bg-background lg:inline-flex">
              <Settings size={19} aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Level hero */}
        <Card tone="forest" className="lg:col-span-2">
          <div className="flex items-center gap-5">
            <ProgressRing value={getLevelProgress(progress.totalXp)} size={96} stroke={9} onDark label="ความคืบหน้าเลเวล">
              <span className="text-caption text-white/70">เลเวล</span>
              <span className="text-[1.75rem] leading-none font-bold">{level}</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="text-caption text-white/70">ความคืบหน้าสู่เลเวล {level + 1}</p>
              <p className="mt-0.5 text-section font-semibold">
                {getXpInCurrentLevel(progress.totalXp)} / {getXpToNextLevel(progress.totalXp)} XP
              </p>
              <div className="mt-2">
                <ProgressBar value={getLevelProgress(progress.totalXp)} label="XP ในเลเวลนี้" tone="lime" onDark />
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <StatCard onDark icon={Flame} label="Streak" value={`${streak} วัน`} delay={0.05} />
            <StatCard onDark icon={Target} label="ทำวันนี้" value={todayCount} delay={0.1} />
            <StatCard onDark icon={Medal} label="เหรียญ" value={progress.unlockedBadges.length} delay={0.15} />
          </div>
        </Card>

        {/* World */}
        <Link to="/world" className="group block overflow-hidden rounded-card border border-border bg-surface shadow-card transition-colors hover:border-primary/40">
          <div className="h-36 lg:h-40">
            <WorldPreview stage={stage.visualKey} />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-caption text-muted">โลกสีเขียวของฉัน</p>
                <p className="text-card font-semibold">{stage.title}</p>
              </div>
              <ChevronRight size={18} className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
            <div className="mt-3">
              <ProgressBar
                value={getStageProgress(progress.totalXp)}
                label="ความคืบหน้าโลกเสมือน"
                size="sm"
                showLabel
                valueText={nextStage ? `อีก ${nextStage.requiredXp - progress.totalXp} XP` : 'สมบูรณ์'}
              />
            </div>
          </div>
        </Link>

        {/* Today's missions */}
        <section className="lg:col-span-2" aria-labelledby="today-missions">
          <SectionTitle
            id="today-missions"
            title="ภารกิจประจำวัน"
            action={
              <Link to="/missions" className="inline-flex min-h-11 items-center gap-1 text-caption font-semibold text-primary">
                ดูทั้งหมด <ChevronRight size={15} aria-hidden="true" />
              </Link>
            }
          />
          {dailyAvailable.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {dailyAvailable.slice(0, 4).map((m) => (
                <MissionCard key={m.id} mission={m} status="available" to={`/missions/${m.id}`} compact />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState compact title="ทำภารกิจประจำวันครบแล้ว" description="เก่งมาก! กลับมาพรุ่งนี้เพื่อทำภารกิจประจำวันชุดใหม่" />
            </Card>
          )}
        </section>

        <div className="space-y-4">
          {/* Quiz CTA */}
          <Card tone="lime">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-lime" aria-hidden="true">
                <Brain size={20} />
              </span>
              <div>
                <h2 className="text-card font-semibold">ควิซสิ่งแวดล้อม</h2>
                <p className="text-caption text-forest/80">
                  {quizLeft > 0 ? `เหลืออีก ${quizLeft} ข้อที่ยังไม่ได้ทำ` : 'คุณทำควิซครบทุกข้อแล้ว'}
                </p>
              </div>
            </div>
            <Link to="/quiz" className={`${buttonClasses('primary', 'md', true)} mt-4`}>
              {quizLeft > 0 ? 'ทำควิซ' : 'ดูผลควิซ'}
            </Link>
          </Card>

          {/* Recent badges */}
          <Card>
            <SectionTitle
              title="เหรียญตราล่าสุด"
              action={
                <Link to="/achievements" className="inline-flex min-h-11 items-center gap-1 text-caption font-semibold text-primary">
                  ทั้งหมด <ChevronRight size={15} aria-hidden="true" />
                </Link>
              }
            />
            {recentBadges.length > 0 ? (
              <ul className="space-y-2">
                {recentBadges.map((b) => {
                  const Icon = getBadgeIcon(b.icon);
                  return (
                    <li key={b.id} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-forest" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-body font-semibold">{b.title}</p>
                        <p className="truncate text-caption text-muted">{b.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-body text-muted">ทำภารกิจแรกเพื่อปลดล็อกเหรียญตราเหรียญแรก</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
