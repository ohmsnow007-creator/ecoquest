import { useGame } from '../store/GameContext';
import { getCurrentStage, getNextStage, getStageProgress } from '../utils/world';
import { worldStages } from '../data/worldStages';
import { WorldPreview } from '../components/world/WorldPreview';
import { Lock, CheckCircle2, Info } from 'lucide-react';

function CircleProgress({ pct, size = 60 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#86efac" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export function VirtualWorld() {
  const { progress } = useGame();
  const currentStage = getCurrentStage(progress.totalXp);
  const nextStage = getNextStage(progress.totalXp);
  const stagePct = getStageProgress(progress.totalXp) * 100;

  return (
    <div className="animate-fade-in">
      {/* Header with World */}
      <div className="dark-header rounded-b-[28px] overflow-hidden">
        <div className="px-4 pt-8 pb-2">
          <h1 className="text-xl font-bold text-white mb-1">โลกเสมือน</h1>
          <p className="text-sm text-green-300/60">ฟื้นฟูธรรมชาติด้วยภารกิจของคุณ</p>
        </div>
        <div className="h-48 relative">
          <WorldPreview stage={currentStage.visualKey} />
        </div>
        <div className="px-4 py-4 flex items-center gap-4">
          <div className="relative">
            <CircleProgress pct={stagePct} size={56} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{Math.round(stagePct)}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-bold text-white text-sm">{currentStage.title}</h2>
              <span className="text-[10px] bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full font-medium">
                Stage {worldStages.indexOf(currentStage) + 1}/{worldStages.length}
              </span>
            </div>
            {nextStage ? (
              <p className="text-xs text-green-300/50">
                อีก {nextStage.requiredXp - progress.totalXp} XP ถึง "{nextStage.title}"
              </p>
            ) : (
              <p className="text-xs text-green-300 font-medium">ฟื้นฟูโลกเสมือนจนสมบูรณ์แล้ว!</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-2xl p-3 mb-4">
          <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-sky-700">
            โลกเสมือนนี้เป็นภาพจำลองเชิงสัญลักษณ์ ไม่ได้หมายความว่ามีการฟื้นฟูธรรมชาติจริง
          </p>
        </div>

        {/* Stage List */}
        <h2 className="font-bold text-green-800 text-sm mb-3">ระดับทั้งหมด</h2>
        <div className="space-y-2 mb-4">
          {worldStages.map((stage) => {
            const isUnlocked = progress.totalXp >= stage.requiredXp;
            const isCurrent = stage.id === currentStage.id;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'border-green-300 shadow-sm'
                    : isUnlocked
                      ? 'bg-white border-green-50'
                      : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
                style={isCurrent ? { background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Lock size={16} className="text-gray-400" />
                    )}
                    <span className={`text-sm font-semibold ${isUnlocked ? 'text-green-800' : 'text-gray-500'}`}>
                      {stage.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                        ปัจจุบัน
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{stage.requiredXp} XP</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
