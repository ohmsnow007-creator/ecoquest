import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { missions } from '../data/missions';
import { useGame } from '../store/GameContext';
import type { MissionCategory, MissionDifficulty } from '../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';

const categoryFilters: { key: MissionCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'waste', label: '♻️ ขยะ' },
  { key: 'energy', label: '⚡ พลังงาน' },
  { key: 'water', label: '💧 น้ำ' },
  { key: 'transport', label: '🚲 เดินทาง' },
  { key: 'consumption', label: '🛍️ บริโภค' },
  { key: 'nature', label: '🌿 ธรรมชาติ' },
];

const difficultyColors: Record<MissionDifficulty, string> = {
  easy: 'bg-green-500/10 text-green-700',
  medium: 'bg-amber-500/10 text-amber-700',
  hard: 'bg-rose-500/10 text-rose-700',
};

const categoryGradients: Record<MissionCategory, string> = {
  waste: 'from-emerald-50 to-green-50',
  energy: 'from-amber-50 to-yellow-50',
  water: 'from-sky-50 to-blue-50',
  transport: 'from-blue-50 to-indigo-50',
  consumption: 'from-purple-50 to-pink-50',
  nature: 'from-green-50 to-emerald-50',
};

const categoryIcons: Record<MissionCategory, string> = {
  waste: '♻️', energy: '⚡', water: '💧',
  transport: '🚲', consumption: '🛍️', nature: '🌿',
};

export function Missions() {
  const { getMissionStatus } = useGame();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<MissionCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const activeMissions = missions.filter((m) => m.active);

  const filtered = activeMissions.filter((m) => {
    if (filter !== 'all' && m.category !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dark-header px-4 pt-8 pb-5 rounded-b-[28px]">
        <h1 className="text-xl font-bold text-white mb-4">ภารกิจ</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50" />
          <input
            type="text"
            placeholder="ค้นหาภารกิจ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-green-300/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          {categoryFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === key
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-100 shadow-sm'
              }`}
              style={filter === key ? { background: 'linear-gradient(135deg, #16a34a, #22c55e)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mission List */}
        <div className="space-y-3 mt-1">
          {filtered.map((mission, idx) => {
            const status = getMissionStatus(mission.id);
            const isCompleted = status === 'completed-today' || status === 'completed-once';

            return (
              <motion.button
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                onClick={() => navigate(`/missions/${mission.id}`)}
                className={`w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] shadow-sm ${
                  isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className={`p-4 bg-gradient-to-r ${categoryGradients[mission.category]} border border-white/60`}
                  style={{ borderRadius: '1rem' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcons[mission.category]}</span>
                      <h3 className="font-bold text-green-900 text-sm">{mission.title}</h3>
                    </div>
                    {isCompleted && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 ml-7">{mission.description}</p>
                  <div className="flex items-center gap-2 flex-wrap ml-7">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${difficultyColors[mission.difficulty]}`}>
                      {DIFFICULTY_LABELS[mission.difficulty]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 font-medium">
                      {CATEGORY_LABELS[mission.category]}
                    </span>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={10} /> {mission.durationMinutes} นาที
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                        <Sparkles size={10} /> {mission.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">ไม่พบภารกิจที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>
    </div>
  );
}
