import { Link } from 'react-router-dom';
import { Target, Flame, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getLevelFromXp, getXpInCurrentLevel, getXpToNextLevel, getLevelProgress } from '../utils/xp';
import { calculateStreak } from '../utils/streak';
import { getCurrentStage, getNextStage } from '../utils/world';
import { badges as allBadges } from '../data/badges';
import { missions } from '../data/missions';
import { WorldPreview } from '../components/world/WorldPreview';

const avatarEmojis: Record<string, string> = {
  'avatar-leaf': '🌿', 'avatar-tree': '🌳', 'avatar-flower': '🌻',
  'avatar-earth': '🌍', 'avatar-water': '💧', 'avatar-sun': '☀️',
};

function CircleProgress({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#86efac" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export function Dashboard() {
  const { profile, progress, getTodayCompletionCount } = useGame();
  if (!profile) return null;

  const level = getLevelFromXp(progress.totalXp);
  const xpInLevel = getXpInCurrentLevel(progress.totalXp);
  const xpNeeded = getXpToNextLevel(progress.totalXp);
  const levelPct = getLevelProgress(progress.totalXp) * 100;
  const streak = calculateStreak(progress.completions);
  const todayCount = getTodayCompletionCount();
  const dailyMissions = missions.filter((m) => m.repeatPolicy === 'daily' && m.active);
  const currentStage = getCurrentStage(progress.totalXp);
  const nextStage = getNextStage(progress.totalXp);

  const recentBadges = progress.unlockedBadges
    .slice()
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3)
    .map((r) => allBadges.find((b) => b.id === r.badgeId))
    .filter(Boolean);

  return (
    <div className="animate-fade-in">
      {/* Dark Header */}
      <div className="dark-header px-4 pt-8 pb-6 rounded-b-[28px]">
        {/* Greeting Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
              style={{ background: 'rgba(134, 239, 172, 0.2)', border: '2px solid rgba(134, 239, 172, 0.4)' }}>
              {avatarEmojis[profile.avatarId] || '🌿'}
            </div>
            <div>
              <p className="text-green-300 text-xs font-medium">สวัสดี!</p>
              <h1 className="text-white text-lg font-bold">{profile.displayName}</h1>
            </div>
          </div>
          <Link to="/settings" className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-300">
              <path d="M10.11 1h-.22a1 1 0 0 0-1 1v.09a1 1 0 0 1-.5.87l-.22.12a1 1 0 0 1-1 0l-.07-.04a1 1 0 0 0-1.37.37l-.11.19a1 1 0 0 0 .37 1.37l.07.04a1 1 0 0 1 .5.86v.26a1 1 0 0 1-.5.87l-.07.05a1 1 0 0 0-.37 1.36l.11.19a1 1 0 0 0 1.37.37l.07-.04a1 1 0 0 1 1 0l.22.13a1 1 0 0 1 .5.86V10a1 1 0 0 0 1 1h.22a1 1 0 0 0 1-1v-.09a1 1 0 0 1 .5-.87l.22-.12a1 1 0 0 1 1 0l.07.04a1 1 0 0 0 1.37-.37l.11-.19a1 1 0 0 0-.37-1.37l-.07-.04a1 1 0 0 1-.5-.87v-.25a1 1 0 0 1 .5-.87l.07-.05a1 1 0 0 0 .37-1.36l-.11-.19a1 1 0 0 0-1.37-.37l-.07.04a1 1 0 0 1-1 0l-.22-.12a1 1 0 0 1-.5-.87V2a1 1 0 0 0-1-1z" />
              <circle cx="10" cy="6" r="1.5" />
            </svg>
          </Link>
        </div>

        {/* Level Circle + XP */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <CircleProgress pct={levelPct} size={76} stroke={5} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white text-xs font-medium opacity-70">Lvl</span>
              <span className="text-white text-xl font-extrabold leading-none">{level}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-green-200 text-xs mb-0.5">XP {xpInLevel} / {xpNeeded}</p>
            <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-green-400 h-full rounded-full transition-all duration-500" style={{ width: `${levelPct}%` }} />
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-white text-lg font-bold">{progress.totalXp.toLocaleString()}</p>
                <p className="text-green-300/60 text-[10px]">XP สะสม</p>
              </div>
              <div>
                <p className="text-white text-lg font-bold">{progress.completions.length}</p>
                <p className="text-green-300/60 text-[10px]">ภารกิจสำเร็จ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 max-w-lg mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-green-50 text-center">
            <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-1">
              <Flame size={16} className="text-amber-500" />
            </div>
            <p className="text-lg font-bold text-green-800">{streak}</p>
            <p className="text-[10px] text-gray-400">Streak</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-green-50 text-center">
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1">
              <Target size={16} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-800">{todayCount}</p>
            <p className="text-[10px] text-gray-400">วันนี้</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-green-50 text-center">
            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-1">
              <Sparkles size={16} className="text-purple-500" />
            </div>
            <p className="text-lg font-bold text-green-800">{progress.unlockedBadges.length}</p>
            <p className="text-[10px] text-gray-400">เหรียญ</p>
          </div>
        </div>

        {/* Daily Challenge Card */}
        <Link
          to="/missions"
          className="block rounded-2xl overflow-hidden mb-4 shadow-sm active:scale-[0.99] transition-transform"
          style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}
        >
          <div className="p-4">
            <p className="text-[10px] font-bold text-green-600 tracking-wider mb-1">ภารกิจประจำวัน</p>
            <h3 className="text-sm font-bold text-green-900 mb-1">ทำภารกิจรักษ์โลกวันนี้</h3>
            <p className="text-xs text-green-600/70 mb-3">มี {dailyMissions.length} ภารกิจรอคุณอยู่</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-green-700">
              <span>เริ่มเลย</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </Link>

        {/* World Preview */}
        <Link
          to="/world"
          className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-green-50 mb-4 active:scale-[0.99] transition-transform"
        >
          <div className="h-36">
            <WorldPreview stage={currentStage.visualKey} />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">โลกเสมือน</p>
              <p className="text-sm font-bold text-green-800">{currentStage.title}</p>
            </div>
            {nextStage && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400">ถัดไป</p>
                <p className="text-xs text-green-600 font-medium">อีก {nextStage.requiredXp - progress.totalXp} XP</p>
              </div>
            )}
            <ChevronRight size={18} className="text-gray-300 ml-2" />
          </div>
        </Link>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <Link
            to="/achievements"
            className="block bg-white rounded-2xl p-4 shadow-sm border border-green-50 mb-4 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <span className="font-bold text-green-800 text-sm">เหรียญตราที่ปลดล็อก</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {recentBadges.map((badge) =>
                badge ? (
                  <div key={badge.id} className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                    <span className="text-base">{getBadgeEmoji(badge.icon)}</span>
                    <span className="text-xs font-medium text-amber-800">{badge.title}</span>
                  </div>
                ) : null
              )}
            </div>
          </Link>
        )}

        {progress.completions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm text-gray-500 mb-3">ยังไม่ได้เริ่มภารกิจ</p>
            <Link
              to="/missions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm active:scale-[0.97] transition-transform shadow-md text-white"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
            >
              <Target size={16} />
              เริ่มภารกิจแรก
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function getBadgeEmoji(iconName: string): string {
  const map: Record<string, string> = {
    Sprout: '🌱', Compass: '🧭', Shield: '🛡️', Globe: '🌍', Crown: '👑',
    Recycle: '♻️', Zap: '⚡', Droplets: '💧', TreePine: '🌲', Star: '⭐',
    Trophy: '🏆', Award: '🏅', Flame: '🔥', TrendingUp: '📈',
  };
  return map[iconName] || '🏅';
}
