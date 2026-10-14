import { useGame } from '../store/GameContext';
import { badges as allBadges } from '../data/badges';
import { getBadgeProgress } from '../utils/badges';
import { Lock, Trophy } from 'lucide-react';
import { RARITY_LABELS } from '../types';

const rarityColors = {
  common: 'border-gray-200',
  uncommon: 'border-green-200',
  rare: 'border-blue-200',
  epic: 'border-purple-200',
  legendary: 'border-amber-200',
};

const rarityBadgeStyle = {
  common: 'bg-gray-100 text-gray-500',
  uncommon: 'bg-green-50 text-green-600',
  rare: 'bg-blue-50 text-blue-600',
  epic: 'bg-purple-50 text-purple-600',
  legendary: 'bg-amber-50 text-amber-600',
};

const badgeEmojis: Record<string, string> = {
  Sprout: '🌱', Compass: '🧭', Shield: '🛡️', Globe: '🌍', Crown: '👑',
  Recycle: '♻️', Zap: '⚡', Droplets: '💧', TreePine: '🌲', Star: '⭐',
  Trophy: '🏆', Award: '🏅', Flame: '🔥', TrendingUp: '📈',
};

export function Achievements() {
  const { progress } = useGame();
  const unlockedIds = new Set(progress.unlockedBadges.map((b) => b.badgeId));

  const unlocked = allBadges.filter((b) => unlockedIds.has(b.id));
  const locked = allBadges.filter((b) => !unlockedIds.has(b.id));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dark-header px-4 pt-8 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">เหรียญตรา</h1>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-white text-sm font-bold">{unlocked.length}</span>
            <span className="text-white/40 text-sm">/ {allBadges.length}</span>
          </div>
        </div>
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <div className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${(unlocked.length / allBadges.length) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Unlocked */}
        {unlocked.length > 0 && (
          <>
            <h2 className="font-bold text-green-800 text-sm mb-3">ปลดล็อกแล้ว</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {unlocked.map((badge) => {
                const record = progress.unlockedBadges.find((b) => b.badgeId === badge.id);
                return (
                  <div key={badge.id}
                    className={`p-3 rounded-2xl border shadow-sm ${rarityColors[badge.rarity]}`}
                    style={{ background: 'linear-gradient(145deg, #fefdf8, #f0fdf4)' }}>
                    <div className="text-3xl mb-2">{badgeEmojis[badge.icon] || '🏅'}</div>
                    <h3 className="font-bold text-green-900 text-sm">{badge.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{badge.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${rarityBadgeStyle[badge.rarity]}`}>
                        {RARITY_LABELS[badge.rarity]}
                      </span>
                      {record && (
                        <span className="text-[9px] text-gray-400">
                          {new Date(record.unlockedAt).toLocaleDateString('th-TH')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <>
            <h2 className="font-bold text-gray-500 text-sm mb-3">ยังล็อกอยู่</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {locked.map((badge) => {
                const pct = getBadgeProgress(badge, progress) * 100;
                return (
                  <div key={badge.id} className="p-3 rounded-2xl border border-gray-100 bg-white/60 opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Lock size={14} className="text-gray-400" />
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${rarityBadgeStyle[badge.rarity]}`}>
                        {RARITY_LABELS[badge.rarity]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-600 text-xs">{badge.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{badge.description}</p>
                    <div className="bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-green-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 text-right">{Math.round(pct)}%</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
