import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Target, Sparkles, TrendingUp, Flame, ChevronRight, Leaf, History } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getPlayerStats } from '../utils/playerStats';
import { getRecentActivity, buildActivityFeed, formatRelativeTime } from '../utils/activity';
import { CATEGORY_LABELS } from '../types';
import { CATEGORY_ICON, CATEGORY_ORDER } from '../data/icons';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ResponsiveChart, ChartTooltip, CHART_THEME } from '../components/ui/ResponsiveChart';
import { XPBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';

export function Progress() {
  const { progress } = useGame();
  const stats = getPlayerStats(progress);
  const { level, streak, longestStreak: longest, byCategory } = stats;
  const maxCategory = Math.max(1, ...CATEGORY_ORDER.map((c) => byCategory[c]));
  const activity = getRecentActivity(progress);
  const weekTotal = activity.reduce((s, d) => s + d.total, 0);

  const recent = buildActivityFeed(progress).slice(0, 20);

  return (
    <>
      <PageHeader title="สถิติ" subtitle="ภาพรวมกิจกรรมที่คุณบันทึกไว้ในแอป" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Target} label="ภารกิจสำเร็จ" value={stats.missionsCompleted} delay={0} />
        <StatCard icon={Sparkles} label="XP สะสม" value={stats.xp.toLocaleString('th-TH')} delay={0.05} />
        <StatCard icon={TrendingUp} label="เลเวล" value={level} delay={0.1} />
        <StatCard icon={Flame} label="Streak ปัจจุบัน" value={`${streak} วัน`} hint={`สูงสุด ${longest} วัน`} delay={0.15} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ResponsiveChart
            title="กิจกรรม 7 วันล่าสุด"
            description={`จำนวนภารกิจและควิซที่ทำในแต่ละวัน รวม ${weekTotal} รายการ`}
            isEmpty={weekTotal === 0}
            emptyMessage="ยังไม่มีกิจกรรมใน 7 วันที่ผ่านมา ลองทำภารกิจแรกของสัปดาห์ดูสิ"
            table={{
              headers: ['วันที่', 'ภารกิจ', 'ควิซ', 'รวม'],
              rows: activity.map((d) => [`${d.label} ${d.date}`, d.missions, d.quizzes, d.total]),
            }}
          >
            <BarChart data={activity} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_THEME.grid} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'var(--color-mint)', fillOpacity: 0.3 }} content={<ChartTooltip unit="รายการ" labelKey="date" />} />
              <Bar dataKey="total" name="กิจกรรม" fill={CHART_THEME.bar} radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveChart>
        </div>

        <Card className="lg:col-span-2">
          <SectionTitle title="แยกตามหมวดหมู่" />
          <ul className="space-y-3">
            {CATEGORY_ORDER.map((cat) => {
              const Icon = CATEGORY_ICON[cat];
              return (
                <li key={cat} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pale-mint text-primary" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <div className="flex-1">
                    <ProgressBar
                      value={byCategory[cat] / maxCategory}
                      label={CATEGORY_LABELS[cat]}
                      size="sm"
                      showLabel
                      valueText={`${byCategory[cat]} ครั้ง`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Link to="/impact" className="mt-4 flex min-h-11 items-center justify-between rounded-control bg-pale-mint px-3 text-body font-semibold">
            <span className="flex items-center gap-2">
              <Leaf size={17} className="text-primary" aria-hidden="true" /> ดูสรุปผลกระทบและวิธีคำนวณ
            </span>
            <ChevronRight size={17} aria-hidden="true" />
          </Link>
        </Card>
      </div>

      <Card className="mt-4">
        <SectionTitle id="history" title="ประวัติกิจกรรม" icon={<History size={18} className="text-primary" aria-hidden="true" />} />
        {recent.length === 0 ? (
          <EmptyState compact title="ยังไม่มีประวัติกิจกรรม" description="ภารกิจ ควิซ และเหรียญตราที่ได้รับจะแสดงที่นี่" />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((e) => {
              const title =
                e.type === 'mission' ? `ภารกิจ: ${e.title}`
                : e.type === 'quiz' ? `ทำ${e.title} ถูก ${e.correctCount}/${e.total} ข้อ`
                : e.type === 'badge' ? `ปลดล็อกเหรียญ "${e.title}"`
                : e.type === 'challenge' ? (e.kind === 'daily' ? 'ทำภารกิจประจำวันครบ' : `สำเร็จชาเลนจ์ "${e.title}"`)
                : `เลื่อนเป็นเลเวล ${e.level}`;
              const xp = e.type === 'mission' || e.type === 'quiz' || e.type === 'challenge' ? e.xp : 0;
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium">{title}</p>
                    <p className="text-caption text-muted">
                      {formatRelativeTime(e.at)}
                      {e.type === 'mission' && e.selfReported && ' · รายงานด้วยตนเอง'}
                    </p>
                  </div>
                  {xp > 0 && <XPBadge amount={xp} plus />}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
