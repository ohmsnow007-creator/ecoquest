import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Leaf, ListChecks, Zap, Droplets, Cloud, Recycle, Footprints, Info, Calculator, Plus, Download, Trash2, ExternalLink, Sparkles, type LucideIcon } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { CATEGORY_LABELS } from '../types';
import type { ImpactActivityType, WasteType } from '../types';
import { CATEGORY_ORDER } from '../data/icons';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { IMPACT_ACTIVITIES, WASTE_TYPE_LABELS, getActivityMeta } from '../data/impactActivities';
import { buildImpactCsv, summarizeImpact, CALCULATION_VERSION, type ImpactRange } from '../services/impactCalculator';
import { ResponsiveChart, ChartTooltip, CHART_THEME } from '../components/ui/ResponsiveChart';
import { SegmentedControl } from '../components/ui/Controls';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { Modal, ConfirmationDialog } from '../components/ui/Modal';
import { ImpactLogDialog } from '../components/impact/ImpactLogDialog';

const NO_CO2E = 'ยังไม่มีข้อมูลเพียงพอสำหรับคำนวณ CO2e';
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const fmt = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 2 });
const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return `${TH_MONTH[m - 1]} ${String(y + 543).slice(2)}`;
};
const isActivityType = (v: string | null): v is ImpactActivityType => IMPACT_ACTIVITIES.some((a) => a.type === v);

function Kpi({ icon: Icon, tone, label, value, unit, note, delay, featured = false }: { icon: LucideIcon; tone: string; label: string; value: string | null; unit?: string; note: string; delay: number; featured?: boolean }) {
  const muted = featured ? 'text-white/75' : 'text-muted';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={featured ? 'bg-forest-hero rounded-card p-3.5 text-white shadow-raised sm:p-4' : 'rounded-card border border-border bg-surface p-3.5 shadow-card sm:p-4'}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`} aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className={`text-caption leading-tight ${muted}`}>{label}</span>
      </div>
      {value !== null ? (
        <p className={`mt-2 text-[1.5rem] leading-tight font-bold ${featured ? 'text-white' : 'text-forest'}`}>
          {value} {unit && <span className="text-body font-semibold">{unit}</span>}
        </p>
      ) : (
        <p className={`mt-2 text-body font-semibold ${muted}`}>ยังไม่มีข้อมูล</p>
      )}
      <p className={`mt-0.5 text-[0.75rem] leading-snug ${muted}`}>{note}</p>
    </motion.div>
  );
}

export function Impact() {
  const { progress, deleteImpactRecord, notify } = useGame();
  const [params, setParams] = useSearchParams();
  const requested = params.get('log');
  const [range, setRange] = useState<ImpactRange>('30d');
  const [logOpen, setLogOpen] = useState(isActivityType(requested));
  const [logType, setLogType] = useState<ImpactActivityType>(isActivityType(requested) ? requested : 'electricity-saved');
  const [logKey, setLogKey] = useState(0);
  const [methodOpen, setMethodOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const s = useMemo(() => summarizeImpact(progress, range), [progress, range]);
  const csv = useMemo(() => buildImpactCsv(progress, range), [progress, range]);

  const openLog = (type: ImpactActivityType = 'electricity-saved') => {
    setLogType(type);
    setLogKey((k) => k + 1);
    setLogOpen(true);
  };
  const closeLog = () => {
    setLogOpen(false);
    if (params.has('log')) setParams({}, { replace: true });
  };

  const download = () => {
    const blob = new Blob([csv.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecoquest-green-impact-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryData = CATEGORY_ORDER.map((c) => ({ name: CATEGORY_LABELS[c], count: s.activities.byCategory[c] }));
  const resultData = s.emissions.lines.map((l) => ({ name: getActivityMeta(l.activityType).label, kg: l.kgCO2e }));
  const usageData = s.monthlyUsage.map((u) => ({ name: monthLabel(u.month), kWh: u.kWh }));
  const wasteTotal = s.quantities['waste-sorted'];
  const rangeLabel = range === '7d' ? '7 วันล่าสุด' : range === '30d' ? '30 วันล่าสุด' : 'ทั้งหมด';
  const recentRecords = [...progress.impactRecords].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <>
      <header className="safe-top pt-5 pb-4 lg:pt-10 lg:pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest text-lime shadow-card" aria-hidden="true">
            <Leaf size={22} />
          </span>
          <div className="min-w-0">
            <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">Green Impact</h1>
            <p className="text-body text-muted">สรุปกิจกรรมและค่าประมาณผลกระทบจากข้อมูลที่คุณบันทึก</p>
          </div>
        </div>
        <p className="mt-3 text-caption text-muted">
          ค่า CO₂e เป็นการประมาณจากปริมาณที่คุณกรอก × ค่าปัจจัยที่มีแหล่งอ้างอิงเท่านั้น ไม่ได้แปลงจาก XP และไม่ใช่การวัดจริง
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SegmentedControl
            ariaLabel="ช่วงเวลา"
            value={range}
            onChange={setRange}
            options={[
              { value: '7d', label: '7 วัน' },
              { value: '30d', label: '30 วัน' },
              { value: 'all', label: 'ทั้งหมด' },
            ]}
          />
          <SecondaryButton icon={<Calculator size={16} />} onClick={() => setMethodOpen(true)}>ดูวิธีคำนวณ</SecondaryButton>
        </div>
      </header>

      {/* 1 + 2: KPI cards — each from its own data, never combined */}
      <section aria-label={`ตัวชี้วัด ${rangeLabel}`} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          featured
          icon={Cloud}
          tone="bg-lime text-forest"
          label="CO₂e ที่ลดลง (ประมาณการ)"
          value={s.emissions.totalKg !== null ? fmt(s.emissions.totalKg) : null}
          unit="kg CO₂e"
          note={s.emissions.totalKg !== null ? 'คำนวณจากค่าปัจจัยที่มีแหล่งอ้างอิง' : NO_CO2E}
          delay={0}
        />
        <Kpi icon={ListChecks} tone="bg-mint text-forest" label="กิจกรรมที่บันทึก" value={fmt(s.activities.total)} unit="ครั้ง" note={`รายงานเอง ${s.activities.selfReported} · เรียนรู้ ${s.activities.learning}`} delay={0} />
        <Kpi icon={Zap} tone="bg-tag-yellow text-forest" label="ไฟฟ้าที่ประหยัดได้" value={s.quantities['electricity-saved'] > 0 ? fmt(s.quantities['electricity-saved']) : null} unit="kWh" note="จากปริมาณที่คุณกรอก" delay={0.05} />
        <Kpi icon={Droplets} tone="bg-tag-sky text-forest" label="น้ำที่ประหยัดได้" value={s.quantities['water-saved'] > 0 ? fmt(s.quantities['water-saved']) : null} unit="ลิตร" note="จากปริมาณที่คุณกรอก" delay={0.1} />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton icon={<Plus size={17} />} onClick={() => openLog()}>บันทึกข้อมูลกิจกรรม</PrimaryButton>
        <SecondaryButton icon={<Download size={17} />} onClick={download} disabled={csv.rows === 0} aria-describedby="csv-hint">
          ส่งออก CSV
        </SecondaryButton>
        <p id="csv-hint" className="w-full text-caption text-muted">
          {csv.rows === 0 ? `ยังไม่มีข้อมูลใน${rangeLabel} จึงยังส่งออกไม่ได้` : `รายงาน ${csv.rows} แถว พร้อมวันที่ หน่วย และแหล่งข้อมูล (${rangeLabel})`}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ResponsiveChart
          title="กิจกรรมแยกตามหมวดหมู่"
          description={`หน่วย: ครั้ง · ${rangeLabel}`}
          isEmpty={s.activities.total === 0}
          emptyMessage="ยังไม่มีกิจกรรมในช่วงเวลานี้"
          table={{ headers: ['หมวดหมู่', 'จำนวนครั้ง'], rows: categoryData.map((d) => [d.name, d.count]) }}
          height={240}
        >
          <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke={CHART_THEME.grid} />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.text, fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'var(--color-mint)', fillOpacity: 0.3 }} content={<ChartTooltip unit="ครั้ง" />} />
            <Bar dataKey="count" name="จำนวนครั้ง" fill={CHART_THEME.bar} radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveChart>

        <ResponsiveChart
          title="จำนวนกิจกรรมตามช่วงเวลา"
          description={`หน่วย: ครั้ง · ${range === '7d' ? 'รายวัน' : range === '30d' ? 'ช่วงละ 6 วัน' : 'รายเดือน'}`}
          isEmpty={s.activities.total === 0}
          emptyMessage="ยังไม่มีกิจกรรมในช่วงเวลานี้"
          table={{ headers: ['ช่วงเวลา', 'จำนวนครั้ง'], rows: s.activities.byPeriod.map((b) => [b.label, b.missions]) }}
          height={240}
        >
          <BarChart data={s.activities.byPeriod} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke={CHART_THEME.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 11 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'var(--color-mint)', fillOpacity: 0.3 }} content={<ChartTooltip unit="ครั้ง" />} />
            <Bar dataKey="missions" name="กิจกรรม" fill={CHART_THEME.bar} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveChart>

        <ResponsiveChart
          title="ผลการคำนวณ CO₂e (ประมาณการ)"
          description={`หน่วย: kg CO₂e · ${rangeLabel}`}
          isEmpty={resultData.length === 0}
          emptyMessage={`${NO_CO2E} — บันทึกไฟฟ้าที่ประหยัดได้ (kWh) เพื่อเริ่มคำนวณ`}
          table={{
            headers: ['กิจกรรม', 'ปริมาณ', 'ค่าปัจจัย', 'kg CO₂e'],
            rows: s.emissions.lines.map((l) => [getActivityMeta(l.activityType).label, `${fmt(l.quantity)} ${l.unit}`, `${l.factor.kgCO2ePerUnit} kgCO₂e/${l.factor.unit}`, fmt(l.kgCO2e)]),
          }}
          height={200}
        >
          <BarChart data={resultData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke={CHART_THEME.grid} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.text, fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'var(--color-mint)', fillOpacity: 0.3 }} content={<ChartTooltip unit="kg CO₂e" />} />
            <Bar dataKey="kg" name="kg CO₂e" fill={CHART_THEME.bar} radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveChart>

        <ResponsiveChart
          title="การใช้ไฟฟ้ารายเดือน (ก่อน-หลัง)"
          description="หน่วย: kWh · จากบิลค่าไฟที่คุณกรอก (ทุกช่วงเวลา)"
          isEmpty={usageData.length < 2}
          emptyMessage="กรอกหน่วยไฟฟ้าจากบิลอย่างน้อย 2 เดือนเพื่อดูการเปรียบเทียบ"
          table={{ headers: ['เดือน', 'kWh'], rows: usageData.map((u) => [u.name, u.kWh]) }}
          height={220}
        >
          <BarChart data={usageData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke={CHART_THEME.grid} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_THEME.axis, fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'var(--color-mint)', fillOpacity: 0.3 }} content={<ChartTooltip unit="kWh" />} />
            <Bar dataKey="kWh" name="kWh" fill={CHART_THEME.bar} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveChart>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Quantities without a verified factor */}
        <section aria-labelledby="qty-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 id="qty-title" className="text-section font-bold text-forest">ปริมาณที่บันทึก ({rangeLabel})</h2>
          <ul className="mt-3 space-y-2.5">
            <li className="flex items-start gap-3">
              <Recycle size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-body">ขยะที่แยก {wasteTotal > 0 ? <strong>{fmt(wasteTotal)} kg</strong> : <span className="text-muted">ยังไม่มีข้อมูล</span>}</p>
                {wasteTotal > 0 && (
                  <p className="text-caption text-muted">
                    {(Object.keys(s.wasteByType) as WasteType[])
                      .filter((w) => s.wasteByType[w] > 0)
                      .map((w) => `${WASTE_TYPE_LABELS[w]} ${fmt(s.wasteByType[w])} kg`)
                      .join(' · ')}
                  </p>
                )}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Footprints size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <p className="flex-1 text-body">
                เดิน/ปั่นแทนรถ {s.quantities['low-carbon-distance'] > 0 ? <strong>{fmt(s.quantities['low-carbon-distance'])} km</strong> : <span className="text-muted">ยังไม่มีข้อมูล</span>}
              </p>
            </li>
          </ul>
          {s.emissions.uncalculated.length > 0 && (
            <p className="mt-3 rounded-control bg-background p-3 text-caption text-muted">
              {s.emissions.uncalculated.map((u) => `${getActivityMeta(u.activityType).label} ${fmt(u.quantity)} ${u.unit}`).join(', ')}: {NO_CO2E} (ยังไม่มีค่าปัจจัยที่ตรวจสอบได้)
            </p>
          )}
        </section>

        {/* Calculated estimate, with the source of every factor used */}
        <section aria-labelledby="calc-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 id="calc-title" className="text-section font-bold text-forest">ผลกระทบที่คำนวณได้ (ประมาณการ)</h2>
          {s.emissions.lines.length === 0 ? (
            <p className="mt-2 text-body text-muted">{NO_CO2E}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {s.emissions.lines.map((l) => (
                <li key={l.activityType} className="rounded-control bg-background p-3">
                  <p className="text-body">
                    {getActivityMeta(l.activityType).label} {fmt(l.quantity)} {l.unit} × {l.factor.kgCO2ePerUnit} = <strong>{fmt(l.kgCO2e)} kg CO₂e</strong>
                  </p>
                  <p className="mt-1 text-caption text-muted">
                    ค่าปัจจัย: {l.factor.publisher} · ประกาศ {l.factor.publishedDate} · มีผล {l.factor.effectiveFrom}{' '}
                    <a href={l.factor.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-primary underline">
                      แหล่งอ้างอิง <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Data integrity: three kinds, shown apart */}
      <section aria-label="ประเภทข้อมูลในหน้านี้" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-caption font-semibold text-primary">1 · กิจกรรมที่รายงานด้วยตนเอง</p>
          <p className="mt-1 text-body"><strong>{s.activities.selfReported}</strong> ครั้ง + ปริมาณที่คุณกรอก</p>
          <p className="text-caption text-muted">ระบบบันทึกตามข้อมูลที่คุณยืนยัน ไม่ได้ตรวจสอบการกระทำจริง</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-caption font-semibold text-primary">2 · ค่าประมาณที่คำนวณได้</p>
          <p className="mt-1 text-body">{s.emissions.totalKg !== null ? <><strong>{fmt(s.emissions.totalKg)}</strong> kg CO₂e</> : 'ยังไม่มี'}</p>
          <p className="text-caption text-muted">ปริมาณ × ค่าปัจจัยที่มีแหล่งอ้างอิง (เวอร์ชัน {CALCULATION_VERSION})</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="flex items-center gap-1 text-caption font-semibold text-primary"><Sparkles size={13} aria-hidden="true" /> 3 · XP ในเกม</p>
          <p className="mt-1 text-body"><strong>{fmt(s.gameXp)}</strong> XP</p>
          <p className="text-caption text-muted">คะแนนสร้างแรงจูงใจ ไม่ใช่หน่วยวัดผลกระทบ และไม่ถูกนำมาคำนวณ CO₂e</p>
        </div>
      </section>

      {/* Entered records */}
      <section aria-labelledby="records-title" className="mt-4 rounded-card border border-border bg-surface p-4 shadow-card">
        <h2 id="records-title" className="text-section font-bold text-forest">ข้อมูลที่คุณบันทึกล่าสุด</h2>
        {recentRecords.length === 0 ? (
          <p className="mt-2 text-body text-muted">เริ่มบันทึกกิจกรรมเพื่อดูผลลัพธ์</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {recentRecords.map((r) => {
              const meta = getActivityMeta(r.activityType);
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body">
                      {meta.label}
                      {r.wasteType ? ` (${WASTE_TYPE_LABELS[r.wasteType]})` : ''} · <strong>{fmt(r.quantity)} {r.unit}</strong>
                    </p>
                    <p className="text-caption text-muted">
                      {r.activityType === 'electricity-usage' ? `บิลเดือน ${monthLabel(r.date.slice(0, 7))}` : r.date} · กรอกเอง
                    </p>
                  </div>
                  <button type="button" onClick={() => setDeleting(r.id)} aria-label={`ลบ ${meta.label} ${fmt(r.quantity)} ${r.unit}`} className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger">
                    <Trash2 size={17} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-4 mb-2 flex items-start gap-2 rounded-card bg-pale-mint p-4 text-caption">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        หมายเหตุ: ข้อมูลในหน้านี้มาจากการรายงานของคุณเอง ค่า CO₂e เป็นการประมาณการเชิงการเรียนรู้ ไม่ใช่การวัดหรือรับรองผลกระทบจริง
      </p>

      <ImpactLogDialog key={logKey} open={logOpen} initialType={logType} onClose={closeLog} />

      <Modal open={methodOpen} onClose={() => setMethodOpen(false)} title="วิธีคำนวณ">
        <div className="space-y-3 text-body">
          <p><strong>สูตร:</strong> ผลกระทบที่ประมาณได้ (kg CO₂e) = ปริมาณกิจกรรม × ค่าปัจจัยที่ตรงกับกิจกรรมและหน่วย</p>
          <p>ระบบคำนวณเฉพาะเมื่อหน่วยของข้อมูลตรงกับหน่วยของค่าปัจจัย และค่าปัจจัยมีผู้เผยแพร่ ค่า และวันที่ที่ตรวจสอบได้ ถ้าไม่มีจะแสดง “{NO_CO2E}”</p>
          <p>XP ในเกมไม่ถูกนำมาแปลงเป็น CO₂e</p>
          <h3 className="pt-1 text-card font-semibold">ค่าปัจจัยที่ใช้</h3>
          <ul className="space-y-2">
            {EMISSION_FACTORS.map((f) => (
              <li key={f.id} className="rounded-control bg-background p-3 text-caption">
                <p className="font-semibold">{f.name}</p>
                <p>{f.kgCO2ePerUnit} kgCO₂e/{f.unit} · {f.publisher}</p>
                <p>ประกาศ {f.publishedDate} · มีผล {f.effectiveFrom} · ตรวจสอบเมื่อ {f.retrievedAt}</p>
                <p className="text-muted">{f.caveat}</p>
                <p className="mt-1 flex flex-wrap gap-3">
                  <a href={f.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">ข่าวประกาศ</a>
                  <a href={f.publisherUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">หน้า Emission Factor ของ TGO</a>
                </p>
              </li>
            ))}
          </ul>
          <p className="text-caption text-muted">น้ำ ขยะ และระยะทาง ยังไม่มีค่าปัจจัยที่ตรวจสอบวันที่ได้ จึงแสดงเป็นปริมาณเท่านั้น · เวอร์ชันการคำนวณ {CALCULATION_VERSION}</p>
        </div>
      </Modal>

      <ConfirmationDialog
        open={deleting !== null}
        title="ลบข้อมูลนี้?"
        description="ข้อมูลที่ลบจะไม่ถูกนำไปคำนวณอีก และกู้คืนไม่ได้"
        confirmLabel="ลบ"
        tone="danger"
        onConfirm={() => {
          if (deleting && !deleteImpactRecord(deleting)) notify('ลบไม่สำเร็จ กรุณาลองอีกครั้ง', 'error');
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
