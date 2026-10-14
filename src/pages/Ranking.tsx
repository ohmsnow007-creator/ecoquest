import { useGame } from '../store/GameContext';
import { getLevelFromXp, xpForLevel } from '../utils/xp';
import { calculateStreak } from '../utils/streak';
import { quizzes } from '../data/quizzes';
import { missions } from '../data/missions';
import { Trophy, Star, Target, Flame, Brain, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RankTier {
  name: string;
  emoji: string;
  minXp: number;
  color: string;
  gradient: string;
}

const rankTiers: RankTier[] = [
  { name: 'นักสำรวจ', emoji: '🌱', minXp: 0, color: '#6b7280', gradient: 'linear-gradient(135deg, #e5e7eb, #d1d5db)' },
  { name: 'นักอนุรักษ์', emoji: '🌿', minXp: 100, color: '#22c55e', gradient: 'linear-gradient(135deg, #bbf7d0, #86efac)' },
  { name: 'ผู้พิทักษ์โลก', emoji: '🛡️', minXp: 300, color: '#3b82f6', gradient: 'linear-gradient(135deg, #93c5fd, #60a5fa)' },
  { name: 'แชมเปี้ยนสีเขียว', emoji: '🏆', minXp: 600, color: '#a855f7', gradient: 'linear-gradient(135deg, #c4b5fd, #a78bfa)' },
  { name: 'ตำนานรักษ์โลก', emoji: '👑', minXp: 1000, color: '#f59e0b', gradient: 'linear-gradient(135deg, #fde68a, #fbbf24)' },
];

function getCurrentRank(xp: number): RankTier {
  for (let i = rankTiers.length - 1; i >= 0; i--) {
    if (xp >= rankTiers[i].minXp) return rankTiers[i];
  }
  return rankTiers[0];
}

function getNextRank(xp: number): RankTier | null {
  for (const tier of rankTiers) {
    if (xp < tier.minXp) return tier;
  }
  return null;
}

export function Ranking() {
  const { progress, profile } = useGame();
  const level = getLevelFromXp(progress.totalXp);
  const nextLevelXp = xpForLevel(level + 1);
  const currentLevelXp = xpForLevel(level);
  const streak = calculateStreak(progress.completions);
  const currentRank = getCurrentRank(progress.totalXp);
  const nextRank = getNextRank(progress.totalXp);
  const completedQuizzes = (progress.quizCompletions || []).filter((q) => q.correct).length;
  const totalMissions = missions.filter((m) => m.active).length;
  const completedMissions = new Set(progress.completions.map((c) => c.missionId)).size;

  const stats = [
    { icon: <Star size={16} />, label: 'XP รวม', value: progress.totalXp.toLocaleString(), color: '#fbbf24' },
    { icon: <TrendingUp size={16} />, label: 'เลเวล', value: level, color: '#22c55e' },
    { icon: <Flame size={16} />, label: 'Streak', value: `${streak} วัน`, color: '#f97316' },
    { icon: <Brain size={16} />, label: 'ควิซถูก', value: `${completedQuizzes}/${quizzes.length}`, color: '#8b5cf6' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="dark-header px-4 pt-8 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">อันดับ</h1>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-white text-sm font-bold">Lvl {level}</span>
          </div>
        </div>

        {/* Current Rank */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-4xl mb-2">{currentRank.emoji}</div>
          <h2 className="text-lg font-bold text-white">{currentRank.name}</h2>
          {profile && <p className="text-sm text-green-300/60 mt-0.5">{profile.displayName}</p>}
          {nextRank && (
            <div className="mt-3">
              <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((progress.totalXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  style={{ background: currentRank.gradient }} />
              </div>
              <p className="text-[10px] text-green-300/40 mt-1">
                อีก {nextRank.minXp - progress.totalXp} XP ถึง {nextRank.emoji} {nextRank.name}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-green-50 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: s.color, background: `${s.color}15` }}>
                  {s.icon}
                </div>
                <span className="text-[10px] text-gray-400">{s.label}</span>
              </div>
              <p className="text-xl font-extrabold text-green-800">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-green-800 text-sm">เลเวล {level}</span>
            <span className="text-xs text-gray-400">{progress.totalXp - currentLevelXp}/{nextLevelXp - currentLevelXp} XP</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div className="h-full rounded-full" initial={{ width: 0 }}
              animate={{ width: `${((progress.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100}%` }}
              transition={{ duration: 0.8 }}
              style={{ background: 'linear-gradient(90deg, #22c55e, #86efac)' }} />
          </div>
        </div>

        {/* Mission Coverage */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-green-600" />
            <span className="font-bold text-green-800 text-sm">ความสำเร็จภารกิจ</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">ภารกิจที่เคยทำ</span>
            <span className="text-xs font-bold text-green-700">{completedMissions}/{totalMissions}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-green-400 h-full rounded-full transition-all"
              style={{ width: `${(completedMissions / totalMissions) * 100}%` }} />
          </div>
        </div>

        {/* Rank Tiers */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-green-800 text-sm mb-3">ระดับยศทั้งหมด</h2>
          <div className="space-y-2">
            {rankTiers.map((tier) => {
              const isUnlocked = progress.totalXp >= tier.minXp;
              const isCurrent = tier.name === currentRank.name;
              return (
                <div key={tier.name}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    isCurrent ? 'border-green-300 shadow-sm' : isUnlocked ? 'border-green-50 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'
                  }`}
                  style={isCurrent ? { background: tier.gradient } : {}}>
                  <span className="text-xl">{tier.emoji}</span>
                  <div className="flex-1">
                    <span className={`text-sm font-semibold ${isCurrent ? 'text-green-900' : isUnlocked ? 'text-green-800' : 'text-gray-500'}`}>
                      {tier.name}
                    </span>
                    <p className="text-[10px] text-gray-400">{tier.minXp} XP</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                      ปัจจุบัน
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
