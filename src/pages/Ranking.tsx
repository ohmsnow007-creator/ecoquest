import { motion } from 'framer-motion';
import { Sprout, Leaf, Shield, Trophy, Crown, Star, TrendingUp, Flame, Brain, Target, Info, CheckCircle2, Lock, type LucideIcon } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getLevelFromXp } from '../utils/xp';
import { calculateStreak } from '../utils/streak';
import { quizzes } from '../data/quizzes';
import { missions } from '../data/missions';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';

interface RankTier {
  name: string;
  icon: LucideIcon;
  minXp: number;
}

const RANK_TIERS: RankTier[] = [
  { name: 'นักสำรวจ', icon: Sprout, minXp: 0 },
  { name: 'นักอนุรักษ์', icon: Leaf, minXp: 100 },
  { name: 'ผู้พิทักษ์โลก', icon: Shield, minXp: 300 },
  { name: 'แชมเปี้ยนสีเขียว', icon: Trophy, minXp: 600 },
  { name: 'ตำนานรักษ์โลก', icon: Crown, minXp: 1000 },
];

export function Ranking() {
  const { progress, profile } = useGame();
  const xp = progress.totalXp;
  const level = getLevelFromXp(xp);
  const streak = calculateStreak(progress.completions);
  const currentIdx = RANK_TIERS.reduce((acc, t, i) => (xp >= t.minXp ? i : acc), 0);
  const current = RANK_TIERS[currentIdx];
  const next = RANK_TIERS[currentIdx + 1];
  const CurrentIcon = current.icon;

  const quizCorrect = (progress.quizCompletions ?? []).filter((q) => q.correct).length;
  const activeMissions = missions.filter((m) => m.active);
  const triedMissions = new Set(progress.completions.map((c) => c.missionId)).size;

  return (
    <>
      <PageHeader title="อันดับของฉัน" subtitle="ระดับยศคำนวณจาก XP ที่คุณสะสมเอง" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card tone="forest" className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <motion.span
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-lime text-forest"
              aria-hidden="true"
            >
              <CurrentIcon size={38} />
            </motion.span>
            <div className="min-w-0">
              <p className="text-caption text-white/70">ยศปัจจุบันของ {profile?.displayName}</p>
              <h2 className="text-page font-bold">{current.name}</h2>
            </div>
          </div>
          <div className="mt-5">
            {next ? (
              <ProgressBar
                value={(xp - current.minXp) / (next.minXp - current.minXp)}
                label={`ความคืบหน้าสู่ยศ ${next.name}`}
                tone="lime"
                onDark
                showLabel
                valueText={`อีก ${next.minXp - xp} XP ถึง ${next.name}`}
              />
            ) : (
              <p className="text-body text-mint">คุณไปถึงยศสูงสุดแล้ว</p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
          <StatCard icon={Star} label="XP รวม" value={xp.toLocaleString('th-TH')} delay={0.05} />
          <StatCard icon={TrendingUp} label="เลเวล" value={level} delay={0.1} />
          <StatCard icon={Flame} label="Streak" value={`${streak} วัน`} delay={0.15} />
          <StatCard icon={Brain} label="ควิซตอบถูก" value={`${quizCorrect}/${quizzes.length}`} delay={0.2} />
        </div>

        <Card className="lg:col-span-2">
          <SectionTitle title="ระดับยศทั้งหมด" />
          <ol className="space-y-2">
            {RANK_TIERS.map((tier, i) => {
              const unlocked = xp >= tier.minXp;
              const isCurrent = i === currentIdx;
              const Icon = tier.icon;
              return (
                <li
                  key={tier.name}
                  className={`flex min-h-14 items-center gap-3 rounded-control border px-3 py-2 ${
                    isCurrent ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${unlocked ? 'bg-mint text-forest' : 'bg-border text-muted'}`}
                    aria-hidden="true"
                  >
                    <Icon size={19} />
                  </span>
                  <div className="flex-1">
                    <p className={`text-body font-semibold ${unlocked ? '' : 'text-muted'}`}>{tier.name}</p>
                    <p className="text-caption text-muted">ตั้งแต่ {tier.minXp.toLocaleString('th-TH')} XP</p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-caption font-semibold text-white">ปัจจุบัน</span>
                  ) : unlocked ? (
                    <CheckCircle2 size={18} className="text-success" aria-label="ผ่านแล้ว" />
                  ) : (
                    <Lock size={16} className="text-muted" aria-label="ยังไม่ปลดล็อก" />
                  )}
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="ภารกิจที่เคยลองทำ" icon={<Target size={18} className="text-primary" aria-hidden="true" />} />
            <ProgressBar
              value={triedMissions / activeMissions.length}
              label="ภารกิจที่เคยทำ"
              showLabel
              valueText={`${triedMissions}/${activeMissions.length} ภารกิจ`}
            />
          </Card>
          <p className="flex items-start gap-2 px-1 text-caption text-muted">
            <Info size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            EcoQuest ไม่มีกระดานคะแนนเทียบกับผู้เล่นอื่น เพราะข้อมูลทั้งหมดเก็บอยู่ในเครื่องของคุณเท่านั้น ยศนี้จึงสะท้อนความก้าวหน้าของคุณเอง
          </p>
        </div>
      </div>
    </>
  );
}
