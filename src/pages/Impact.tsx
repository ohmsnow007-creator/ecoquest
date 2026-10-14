import { useGame } from '../store/GameContext';
import { missions } from '../data/missions';
import { CATEGORY_LABELS } from '../types';
import type { MissionCategory } from '../types';
import { Leaf, Info, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const categoryEmojis: Record<MissionCategory, string> = {
  waste: '♻️', energy: '⚡', water: '💧',
  transport: '🚲', consumption: '🛍️', nature: '🌿',
};

export function Impact() {
  const { progress, getCompletionsByCategory } = useGame();
  const navigate = useNavigate();
  const categoryCounts = getCompletionsByCategory();
  const totalCompletions = progress.completions.length;

  const selfReportedCount = progress.completions.filter((c) => c.completionType === 'self-reported').length;
  const educationalCount = progress.completions.filter((c) => c.completionType === 'educational').length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dark-header px-4 pt-6 pb-5 rounded-b-[28px]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-green-300 font-medium text-sm mb-3 py-1">
          <ArrowLeft size={18} />
          <span>กลับ</span>
        </button>
        <h1 className="text-xl font-bold text-white mb-1">ผลกระทบ</h1>
        <p className="text-sm text-green-300/60">สรุปกิจกรรมที่คุณรายงานว่าทำแล้ว</p>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-4">
          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-700">
            <p className="font-semibold mb-1">ข้อจำกัดของตัวชี้วัด</p>
            <ul className="space-y-0.5 list-disc pl-3">
              <li>ตัวเลขเป็นคะแนนกิจกรรม ไม่ใช่ค่า CO2 ที่คำนวณได้แม่นยำ</li>
              <li>ภารกิจชีวิตจริงเป็นการรายงานด้วยตนเอง (self-reported)</li>
              <li>ผลกระทบจริงขึ้นอยู่กับบริบทและพฤติกรรมของแต่ละคน</li>
            </ul>
          </div>
        </div>

        {totalCompletions === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-green-50 shadow-sm">
            <Leaf size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">ยังไม่มีกิจกรรม</p>
            <p className="text-xs text-gray-300 mt-1">ทำภารกิจเพื่อเริ่มสะสมผลกระทบ</p>
          </div>
        ) : (
          <>
            {/* Activity Score */}
            <div className="rounded-2xl p-5 text-white mb-4 shadow-md"
              style={{ background: 'linear-gradient(135deg, #14532d, #166534)' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} />
                <span className="text-xs font-medium text-green-300">คะแนนกิจกรรมรวม</span>
              </div>
              <p className="text-4xl font-extrabold mb-1">{progress.totalXp}</p>
              <p className="text-xs text-green-300/50">จากกิจกรรม {totalCompletions} ครั้ง</p>
            </div>

            {/* Type breakdown */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white rounded-2xl border border-green-50 p-4 shadow-sm">
                <p className="text-[10px] text-gray-500 mb-1">กิจกรรมจริง (self-reported)</p>
                <p className="text-2xl font-extrabold text-green-800">{selfReportedCount}</p>
                <p className="text-[10px] text-gray-400">ครั้ง</p>
              </div>
              <div className="bg-white rounded-2xl border border-green-50 p-4 shadow-sm">
                <p className="text-[10px] text-gray-500 mb-1">เรียนรู้ / จำลอง</p>
                <p className="text-2xl font-extrabold text-green-800">{educationalCount}</p>
                <p className="text-[10px] text-gray-400">ครั้ง</p>
              </div>
            </div>

            {/* Category Pie Chart */}
            {(() => {
              const chartData = (Object.keys(categoryCounts) as MissionCategory[])
                .filter((cat) => categoryCounts[cat] > 0)
                .map((cat) => ({ name: CATEGORY_LABELS[cat], value: categoryCounts[cat] }));
              const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#f97316', '#ec4899', '#14b8a6'];
              return chartData.length > 0 ? (
                <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
                  <h2 className="font-bold text-green-800 text-sm mb-2">สัดส่วนกิจกรรม</h2>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                        dataKey="value" strokeWidth={2} stroke="#fff">
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {chartData.map((d, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Category impact */}
            <div className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
              <h2 className="font-bold text-green-800 text-sm mb-3">กิจกรรมแยกตามหมวดหมู่</h2>
              <div className="space-y-3">
                {(Object.keys(categoryCounts) as MissionCategory[])
                  .filter((cat) => categoryCounts[cat] > 0)
                  .sort((a, b) => categoryCounts[b] - categoryCounts[a])
                  .map((cat) => {
                    const count = categoryCounts[cat];
                    const xpFromCat = progress.completions
                      .filter((c) => {
                        const m = missions.find((mm) => mm.id === c.missionId);
                        return m?.category === cat;
                      })
                      .reduce((sum, c) => sum + c.xpAwarded, 0);

                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                          {categoryEmojis[cat]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-800">{CATEGORY_LABELS[cat]}</span>
                            <span className="text-xs text-gray-500 font-bold">{count} ครั้ง</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{xpFromCat} XP</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Methodology */}
            <details className="bg-white rounded-2xl border border-green-50 p-4 mb-4 shadow-sm">
              <summary className="font-bold text-green-800 text-sm cursor-pointer">
                ▶ วิธีคำนวณและข้อจำกัด
              </summary>
              <div className="mt-3 text-xs text-gray-600 space-y-2">
                <p>
                  <strong>คะแนนกิจกรรม:</strong> คำนวณจาก XP ของแต่ละภารกิจที่สำเร็จ
                  XP ถูกกำหนดตามความยากและผลกระทบโดยประมาณของภารกิจ
                  ไม่ได้แปลงเป็นหน่วยวัดสิ่งแวดล้อมที่แม่นยำ
                </p>
                <p>
                  <strong>การรายงาน:</strong> ภารกิจชีวิตจริงเป็น self-reported
                  ผู้ใช้เป็นคนรายงานว่าทำสำเร็จ ระบบไม่ได้ตรวจจับการกระทำจริง
                </p>
                <p>
                  <strong>ข้อจำกัด:</strong> ตัวชี้วัดนี้เป็นเครื่องมือสร้างแรงจูงใจ
                  ไม่ใช่การวัดผลกระทบด้านสิ่งแวดล้อมที่แม่นยำทางวิทยาศาสตร์
                </p>
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
