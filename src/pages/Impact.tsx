import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Info, Hand, BookOpen, ListChecks } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { missions } from '../data/missions';
import { CATEGORY_LABELS } from '../types';
import { CATEGORY_ORDER } from '../data/icons';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ResponsiveChart, ChartTooltip, CHART_THEME } from '../components/ui/ResponsiveChart';

export function Impact() {
  const { progress, getCompletionsByCategory } = useGame();
  const byCategory = getCompletionsByCategory();
  const total = progress.completions.length;
  const selfReported = progress.completions.filter((c) => c.completionType === 'self-reported').length;

  const xpByCategory = (cat: string) =>
    progress.completions
      .filter((c) => missions.find((m) => m.id === c.missionId)?.category === cat)
      .reduce((s, c) => s + c.xpAwarded, 0);

  const data = CATEGORY_ORDER.map((cat) => ({ cat, name: CATEGORY_LABELS[cat], count: byCategory[cat], xp: xpByCategory(cat) }));

  return (
    <>
      <PageHeader title="ผลกระทบ" subtitle="สรุปกิจกรรมที่คุณรายงานว่าทำแล้ว" back="/progress" />

      <div className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        <div className="text-body">
          <p className="font-semibold">ข้อจำกัดของตัวชี้วัด</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-caption">
            <li>ตัวเลขในหน้านี้คือจำนวนกิจกรรมและคะแนน XP ไม่ใช่ปริมาณ CO₂ หรือผลกระทบที่วัดได้จริง</li>
            <li>ภารกิจชีวิตจริงเป็นการรายงานด้วยตนเอง (self-reported) ระบบไม่ได้ตรวจจับหรือยืนยัน</li>
            <li>การกดภารกิจในแอปไม่ใช่หลักฐานว่าเกิดผลกระทบจริงต่อสิ่งแวดล้อม</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={ListChecks} label="กิจกรรมทั้งหมด" value={`${total} ครั้ง`} />
        <StatCard icon={Hand} label="รายงานด้วยตนเอง" value={`${selfReported} ครั้ง`} delay={0.05} />
        <StatCard icon={BookOpen} label="เรียนรู้ / จำลอง" value={`${total - selfReported} ครั้ง`} delay={0.1} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ResponsiveChart
            title="กิจกรรมแยกตามหมวดหมู่"
            description="จำนวนครั้งที่ทำภารกิจในแต่ละหมวด"
            height={260}
            minWidth={300}
            isEmpty={total === 0}
            emptyMessage="ยังไม่มีกิจกรรม ทำภารกิจเพื่อเริ่มเห็นภาพรวมของคุณ"
            table={{ headers: ['หมวดหมู่', 'จำนวนครั้ง', 'XP'], rows: data.map((d) => [d.name, d.count, d.xp]) }}
          >
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={CHART_THEME.grid} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={104} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.text, fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'var(--color-mint)', fillOpacity: 0.3 }} content={<ChartTooltip unit="ครั้ง" />} />
              <Bar dataKey="count" name="จำนวนครั้ง" fill={CHART_THEME.bar} radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveChart>
        </div>

        <Card className="lg:col-span-2">
          <h2 className="text-section font-semibold">วิธีคำนวณ</h2>
          <dl className="mt-3 space-y-3 text-body">
            <div>
              <dt className="font-semibold">คะแนนกิจกรรม (XP)</dt>
              <dd className="text-muted">รวม XP ของภารกิจที่ทำสำเร็จ XP ถูกกำหนดตามความยากของภารกิจ ไม่ได้แปลงเป็นหน่วยวัดสิ่งแวดล้อม</dd>
            </div>
            <div>
              <dt className="font-semibold">การรายงาน</dt>
              <dd className="text-muted">ผู้ใช้เป็นผู้กดยืนยันเองว่าทำภารกิจแล้ว ระบบไม่มีเซ็นเซอร์หรือการตรวจสอบภายนอก</dd>
            </div>
            <div>
              <dt className="font-semibold">จุดประสงค์</dt>
              <dd className="text-muted">ใช้สร้างแรงจูงใจและติดตามนิสัยของตัวเอง ไม่ใช่การวัดผลทางวิทยาศาสตร์</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
