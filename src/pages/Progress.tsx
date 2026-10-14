import { Link } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { getLevelFromXp } from '../utils/xp';
import { calculateStreak, getLongestStreak } from '../utils/streak';
import { missions } from '../data/missions';
import { CATEGORY_LABELS } from '../types';
import type { MissionCategory } from '../types';
import { TrendingUp, Target, Flame, Sparkles, Calendar, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const categoryEmojis: Record<MissionCategory, string> = {
  waste: '♻️', energy: '⚡', water: '💧',
  transport: '🚲', consumption: '🛍️', nature: '🌿',
};

export function Progress() {
  const { progress, getCompletionsByCategory } = useGame();
  const level = getLevelFromXp(progress.totalXp);
  const streak = calculateStreak(progress.completions);
  const longestStreak = getLongestStreak(progress.completions);
  const categoryCounts = getCompletionsByCategory();

  const recentCompletions = progress.completions
    .slice()
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 20);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dark-header px-4 pt-8 pb-6 rounded-b-[28px]">
        <h1 className="text-xl font-bold text-white mb-4">สถิติ</h1>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Target size={16} className="text-green-300" />, label: 'ภารกิจสำเร็จ', value: progress.completions.length },
            { icon: <Sparkles size={16} className="text-amber-300" />, label: 'XP สะสม', value: progress.totalXp.toLocaleString() },
            { icon: <TrendingUp size={16} className="text-sky-300" />, label: 'เลเวล', value: level },
            { icon: <Flame size={16} className="text-rose-300" />, label: 'Streak สูงสุด', value: `${longestStreak} วัน` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}>
              <StatCard icon={s.icon} label={s.label} value={s.value} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <Flame size={16} className="text-amber-600" />
            </div>
            <span className="font-bold text-green-800 text-sm">Streak ปัจจุบัน</span>
          </div>
          <p className="text-3xl font-extrabold text-green-800 mb-1">{streak} วัน</p>
          <p className="text-[11px] text-gray-400">
            นับจากจำนวนวันต่อเนื่องที่ทำภารกิจอย่างน้อย 1 รายการ
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-green-800 text-sm mb-3">แยกตามหมวดหมู่</h2>
          <div className="space-y-3">
            {(Object.keys(categoryCounts) as MissionCategory[]).map((cat) => {
              const count = categoryCounts[cat];
              const total = missions.filter((m) => m.category === cat && m.active).length;
              const pct = total > 0 ? (count / (total * 3)) * 100 : 0;

              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-medium">
                      {categoryEmojis[cat]} {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{count} ครั้ง</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg, #22c55e, #86efac)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Chart */}
        {progress.completions.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
            <h2 className="font-bold text-green-800 text-sm mb-3">กราฟกิจกรรม</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(Object.keys(categoryCounts) as MissionCategory[]).map((cat) => ({
                name: categoryEmojis[cat],
                count: categoryCounts[cat],
              }))} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {(Object.keys(categoryCounts) as MissionCategory[]).map((_, i) => (
                    <Cell key={i} fill={['#22c55e', '#eab308', '#3b82f6', '#f97316', '#ec4899', '#14b8a6'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Impact Link */}
        <Link
          to="/impact"
          className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-green-50 mb-4 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              <BarChart3 size={18} className="text-green-700" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm">ดูผลกระทบ</p>
              <p className="text-[10px] text-gray-400">สรุปกิจกรรมและวิธีคำนวณ</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Link>

        {/* Recent History */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 shadow-sm mb-4">
          <h2 className="flex items-center gap-2 font-bold text-green-800 text-sm mb-3">
            <Calendar size={14} />
            ประวัติล่าสุด
          </h2>
          {recentCompletions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติภารกิจ</p>
          ) : (
            <div className="space-y-2">
              {recentCompletions.map((c) => {
                const mission = missions.find((m) => m.id === c.missionId);
                return (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-green-800 font-semibold truncate">
                        {mission?.title || c.missionId}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(c.completedAt).toLocaleDateString('th-TH', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold shrink-0 ml-2 px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e' }}>
                      +{c.xpAwarded} XP
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-green-200/60">{label}</span>
      </div>
      <p className="text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}
