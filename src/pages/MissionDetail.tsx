import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles, BookOpen, CheckCircle2, Info } from 'lucide-react';
import { missions } from '../data/missions';
import { useGame } from '../store/GameContext';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import { useState } from 'react';

const typeLabels = {
  educational: '📚 ความรู้',
  simulation: '🎮 จำลอง',
  'self-reported': '✋ รายงานด้วยตนเอง',
};

export function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { completeMission, canCompleteMission, getMissionStatus } = useGame();
  const [note, setNote] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  const mission = missions.find((m) => m.id === id);
  if (!mission) {
    return (
      <div className="px-4 pt-8 max-w-lg mx-auto text-center">
        <p className="text-gray-500">ไม่พบภารกิจนี้</p>
        <button onClick={() => navigate('/missions')} className="mt-4 text-green-600 font-medium text-sm">
          กลับไปหน้าภารกิจ
        </button>
      </div>
    );
  }

  const status = getMissionStatus(mission.id);
  const canComplete = canCompleteMission(mission.id);

  const handleComplete = () => {
    const success = completeMission(mission.id, note.trim() || undefined);
    if (success) {
      setJustCompleted(true);
      setNote('');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Dark Header */}
      <div className="dark-header px-4 pt-6 pb-5 rounded-b-[28px]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-green-300 font-medium text-sm mb-3 py-1"
        >
          <ArrowLeft size={18} />
          <span>กลับ</span>
        </button>
        <h1 className="text-lg font-bold text-white mb-2">{mission.title}</h1>
        <p className="text-sm text-green-200/70">{mission.description}</p>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-green-200 font-medium">
            {CATEGORY_LABELS[mission.category]}
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-amber-200 font-medium">
            {DIFFICULTY_LABELS[mission.difficulty]}
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-sky-200 font-medium">
            {typeLabels[mission.type]}
          </span>
          <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white/70">
            <Clock size={10} /> {mission.durationMinutes} นาที
          </span>
          <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold">
            <Sparkles size={10} /> {mission.xp} XP
          </span>
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Self-reported notice */}
        {mission.type === 'self-reported' && (
          <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-2xl p-3 mb-4">
            <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-700">
              ภารกิจนี้เป็นแบบรายงานด้วยตนเอง ระบบไม่ได้ตรวจจับการกระทำจริง
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-3 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-green-800 text-sm mb-3">
            <BookOpen size={15} />
            วิธีทำ
          </h2>
          <ol className="space-y-2.5">
            {mission.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Learning Point */}
        <div className="rounded-2xl border border-green-100 p-4 mb-4" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
          <h2 className="font-bold text-green-800 text-sm mb-2">💡 สิ่งที่ได้เรียนรู้</h2>
          <p className="text-sm text-green-700">{mission.learningPoint}</p>
        </div>

        {/* Note */}
        {canComplete && (
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">บันทึก (ถ้ามี)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เล่าสิ่งที่ทำ..."
              rows={2}
              maxLength={200}
              className="w-full bg-white border border-green-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none shadow-sm"
            />
          </div>
        )}

        {/* Action Button */}
        {justCompleted ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-green-800"
            style={{ background: 'linear-gradient(135deg, #bbf7d0, #86efac)' }}>
            <CheckCircle2 size={22} />
            <span>สำเร็จแล้ว! +{mission.xp} XP</span>
          </div>
        ) : canComplete ? (
          <button
            onClick={handleComplete}
            className="w-full text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.97] transition-transform shadow-lg"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
          >
            ทำสำเร็จแล้ว ✓
          </button>
        ) : (
          <div className="text-center py-3">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <CheckCircle2 size={18} />
              <span>
                {status === 'completed-once'
                  ? 'ภารกิจนี้ทำได้ครั้งเดียว'
                  : 'ทำสำเร็จแล้ววันนี้ กลับมาใหม่พรุ่งนี้'}
              </span>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-gray-400 mt-3 mb-4">
          {mission.repeatPolicy === 'daily' ? 'ทำซ้ำได้ทุกวัน' : 'ทำได้ครั้งเดียว'}
        </p>
      </div>
    </div>
  );
}
