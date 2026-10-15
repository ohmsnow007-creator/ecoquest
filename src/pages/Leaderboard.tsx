import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Crown, Settings, Info, FlaskConical, Medal } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { createLocalLeaderboard, rankEntries, type LeaderboardPeriod, type RankedEntry } from '../services/leaderboardService';
import { SegmentedControl } from '../components/ui/Controls';
import { Avatar } from '../components/ui/AvatarPicker';

function DemoTag() {
  return <span className="rounded-full bg-tag-lavender px-1.5 py-0.5 text-[0.6875rem] font-semibold text-forest">ข้อมูลตัวอย่าง</span>;
}

function YouTag() {
  return <span className="rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white">คุณ</span>;
}

const PODIUM_STYLE: Record<number, { ring: string; height: string; label: string }> = {
  1: { ring: 'ring-lime', height: 'h-24', label: 'bg-lime text-forest' },
  2: { ring: 'ring-mint', height: 'h-16', label: 'bg-mint text-forest' },
  3: { ring: 'ring-pale-mint', height: 'h-12', label: 'bg-pale-mint text-forest' },
};

function Podium({ entry }: { entry: RankedEntry }) {
  const s = PODIUM_STYLE[entry.rank];
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.rank * 0.08 }}
      className={`flex min-w-0 flex-1 flex-col items-center text-center ${entry.rank === 1 ? 'order-2' : entry.rank === 2 ? 'order-1' : 'order-3'}`}
    >
      {entry.rank === 1 && <Crown size={22} className="text-lime" aria-hidden="true" />}
      <span className={`rounded-full ring-4 ${s.ring}`}>
        <Avatar id={entry.avatarId} color={entry.profileColor} size={entry.rank === 1 ? 'lg' : 'md'} />
      </span>
      <p className="mt-1.5 w-full truncate text-caption font-semibold text-white">{entry.name}</p>
      <p className="text-[0.75rem] text-white/75">{entry.xp.toLocaleString('th-TH')} XP</p>
      <div className="mt-1 flex flex-wrap justify-center gap-1">{entry.isDemo ? <DemoTag /> : entry.isCurrentPlayer ? <YouTag /> : null}</div>
      <div className={`mt-2 flex w-full items-start justify-center rounded-t-2xl pt-1.5 ${s.height} ${s.label}`}>
        <span className="text-section font-bold">{entry.rank}</span>
      </div>
    </motion.li>
  );
}

export function Leaderboard() {
  const { profile, progress } = useGame();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [includeDemo, setIncludeDemo] = useState(true);

  const ranked = useMemo(() => {
    if (!profile) return [];
    return rankEntries(createLocalLeaderboard(profile, progress).getEntries(period, { includeDemo }));
  }, [profile, progress, period, includeDemo]);

  if (!profile) return null;
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const me = ranked.find((e) => e.isCurrentPlayer)!;

  return (
    <>
      <header className="safe-top pt-5 pb-4 lg:pt-10 lg:pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-card bg-tag-yellow text-forest" aria-hidden="true">
              <Trophy size={22} />
            </span>
            <div>
              <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">Leaderboard</h1>
              <p className="text-body text-muted">จัดอันดับตาม XP ที่สะสม</p>
            </div>
          </div>
          <Link to="/settings" aria-label="ตั้งค่า" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-forest shadow-card hover:bg-pale-mint">
            <Settings size={19} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4">
          <SegmentedControl
            ariaLabel="ช่วงเวลา"
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'weekly', label: 'รายสัปดาห์' },
              { value: 'all-time', label: 'ทั้งหมด' },
            ]}
          />
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-card border border-tag-lavender bg-tag-lavender/40 p-3" role="note">
          <FlaskConical size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
          <div className="flex-1 text-caption">
            <p className="font-semibold">Demo Mode — ผู้เล่นอื่นเป็นข้อมูลตัวอย่าง ไม่ใช่ผู้ใช้จริง</p>
            <p className="text-muted">
              เวอร์ชันออฟไลน์ไม่มีเซิร์ฟเวอร์ ข้อมูลตัวอย่างเป็นค่าคงที่และแยกจากข้อมูลของคุณ เฉพาะแถว “คุณ” เท่านั้นที่มาจากการเล่นจริงในเครื่องนี้
            </p>
          </div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-caption font-medium">
            <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />
            แสดงตัวอย่าง
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          {top3.length >= 3 && (
            <section aria-label={`Top 3 ${period === 'weekly' ? 'ประจำสัปดาห์' : 'ตลอดกาล'}`} className="bg-forest-hero rounded-hero p-4 text-white shadow-raised">
              <p className="mb-3 flex items-center gap-2 text-card font-semibold text-white">
                <Trophy size={18} className="text-lime" aria-hidden="true" /> Top 3 {period === 'weekly' ? 'ประจำสัปดาห์' : 'ตลอดกาล'}
              </p>
              <ol className="flex items-end gap-2">
                {top3.map((e) => (
                  <Podium key={e.id} entry={e} />
                ))}
              </ol>
            </section>
          )}

          <section aria-label="อันดับทั้งหมด">
            <ol className="space-y-2">
              {(top3.length >= 3 ? rest : ranked).map((e) => (
                <li
                  key={e.id}
                  aria-current={e.isCurrentPlayer ? 'true' : undefined}
                  className={`flex items-center gap-3 rounded-card border p-3 shadow-card ${e.isCurrentPlayer ? 'border-primary bg-pale-mint' : 'border-border bg-surface'}`}
                >
                  <span className="w-7 shrink-0 text-center text-body font-bold text-muted">{e.rank}</span>
                  <Avatar id={e.avatarId} color={e.profileColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-body font-semibold">
                      <span className="truncate">{e.name}</span>
                      {e.isDemo && <DemoTag />}
                      {e.isCurrentPlayer && <YouTag />}
                    </p>
                    <p className="flex items-center gap-1 text-caption text-muted">
                      เลเวล {e.level}
                      {e.topBadge && (
                        <>
                          {' · '}
                          <Medal size={12} aria-hidden="true" /> {e.topBadge}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-body font-semibold">{e.xp.toLocaleString('th-TH')} XP</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-label="อันดับของคุณ" className="rounded-card border border-primary bg-pale-mint p-4">
            <p className="text-caption text-muted">อันดับของคุณ ({period === 'weekly' ? '7 วันล่าสุด' : 'ทั้งหมด'})</p>
            <p className="mt-0.5 text-page font-bold text-forest">#{me.rank} <span className="text-body font-normal text-muted">จาก {ranked.length}</span></p>
            <p className="text-body">{me.xp.toLocaleString('th-TH')} XP · เลเวล {me.level}</p>
          </section>
          <p className="flex items-start gap-2 px-1 text-caption text-muted">
            <Info size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            เรียงตาม XP จากมากไปน้อย ถ้า XP เท่ากัน ผู้ที่ได้ XP ถึงจำนวนนั้นก่อนจะอยู่อันดับสูงกว่า รายสัปดาห์นับ XP 7 วันล่าสุดตามวันที่ในเครื่อง
          </p>
        </aside>
      </div>
    </>
  );
}
