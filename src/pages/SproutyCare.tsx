import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Droplets, Heart, Sparkles, Shirt, CalendarHeart, Info, Gift, CheckCircle2 } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SproutySeed, type SproutyMood } from '../components/illustrations/SproutySeed';
import { BackgroundArt } from '../components/cosmetics/SproutyScenery';
import { useOutfit } from '../components/cosmetics/useOutfit';
import { usePet } from '../components/sprouty/usePet';
import { getCareState, fertilizerSources, BOND_STEP, FERTILIZER_PERCENT, LONELY_AFTER_DAYS, MAX_BOND } from '../utils/care';
import { getSproutyStage } from '../utils/sprouty';
import { getLevelFromXp } from '../utils/xp';
import { getLocalDate } from '../utils/streak';
import { missions } from '../data/missions';
import { COSMETICS, EVENT_REWARDS, getCosmeticStatus } from '../data/cosmetics';
import { eventDateLabel, getActiveEvent, getNextEvent } from '../data/events';

type Reaction = { mood: SproutyMood; line: string; kind: 'water' | 'feed' } | null;

const WATER_LINES = ['อ๊า~ สดชื่นสุด ๆ ขอบคุณนะ!', 'น้ำเย็นชื่นใจ ใบเขียวขึ้นเลย!', 'ขอบคุณที่ดูแลกันทุกวันนะ'];
const FEED_LINES = ['ปุ๋ยอร่อยจัง! รู้สึกแข็งแรงขึ้นเลย', 'ว้าว พลังเต็มเปี่ยม!', 'อิ่มแล้ว~ รักเธอที่สุด'];
const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

/** Drops falling from a tilted watering can. */
function WateringFx() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.svg
        viewBox="0 0 80 60"
        className="absolute top-2 right-6 w-24"
        initial={{ rotate: 0, x: 20, opacity: 0 }}
        animate={{ rotate: -28, x: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <rect x={22} y={18} width={36} height={30} rx={8} fill="#5BA8D9" />
        <path d="M24 26 L4 14" stroke="#5BA8D9" strokeWidth={6} strokeLinecap="round" />
        <path d="M54 22 C70 18 72 40 56 40" stroke="#3C86B8" strokeWidth={4} fill="none" />
        <rect x={26} y={22} width={10} height={4} rx={2} fill="#FFFFFF" opacity={0.5} />
      </motion.svg>
      {Array.from({ length: 9 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute block h-3 w-2 rounded-full bg-[#38BDF8]/80"
          style={{ left: `${44 + (i % 3) * 5}%`, top: '22%' }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 120, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

/** Sparkles and hearts when Sprouty gets fertilizer. */
function FeedFx() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-lg"
          style={{ left: `${20 + ((i * 37) % 60)}%`, top: '60%' }}
          initial={{ y: 0, opacity: 0, scale: 0.4 }}
          animate={{ y: -110 - (i % 3) * 20, opacity: [0, 1, 0], scale: 1 }}
          transition={{ duration: 1.4, delay: i * 0.08 }}
        >
          {i % 2 ? '💚' : '✨'}
        </motion.span>
      ))}
    </div>
  );
}

export function SproutyCare() {
  const { profile, progress, waterSprouty, feedSprouty, notify } = useGame();
  const outfit = useOutfit('sprouty');
  const reduce = useReducedMotion();
  const pet = usePet();
  const [reaction, setReaction] = useState<Reaction>(null);
  const [hop, setHop] = useState(0);

  useEffect(() => {
    if (!reaction) return;
    const t = window.setTimeout(() => setReaction(null), 2600);
    return () => window.clearTimeout(t);
  }, [reaction]);

  if (!profile) return null;
  const today = getLocalDate();
  const care = getCareState(progress, today);
  const stage = getSproutyStage(getLevelFromXp(progress.totalXp)).stage;
  const mood: SproutyMood = pet.shy ? 'shy' : reaction?.mood ?? care.mood;
  const line = pet.shy ? pet.line : reaction?.line ?? care.line;

  const water = () => {
    if (!waterSprouty()) return;
    navigator.vibrate?.(20);
    setHop((h) => h + 1);
    setReaction({ mood: 'cheer', line: pick(WATER_LINES), kind: 'water' });
    notify('รดน้ำให้ Sprouty แล้ว · ความผูกพัน +10', 'info');
  };
  const feed = () => {
    if (!feedSprouty()) return;
    navigator.vibrate?.([15, 40, 15]);
    setHop((h) => h + 1);
    setReaction({ mood: 'cheer', line: pick(FEED_LINES), kind: 'feed' });
    notify('ใส่ปุ๋ยให้ Sprouty แล้ว · ความผูกพัน +15', 'info');
  };

  const nextBondItem = COSMETICS.filter((c) => c.unlock.type === 'bond' && c.unlock.level > care.bond.level).sort(
    (a, b) => (a.unlock.type === 'bond' && b.unlock.type === 'bond' ? a.unlock.level - b.unlock.level : 0),
  )[0];
  const sources = fertilizerSources(progress);
  const active = getActiveEvent(today);
  const next = getNextEvent(today);
  const shownEvent = active ?? next.event;
  const eventReward = EVENT_REWARDS.find((r) => r.event.id === shownEvent.id)?.cosmetic;
  const eventDone = eventReward ? getCosmeticStatus(eventReward, progress).unlocked : false;

  const waterHint = care.wateredToday ? 'รดน้ำวันนี้แล้ว พรุ่งนี้มารดใหม่นะ' : care.hasWaterToday ? 'มีน้ำจากภารกิจวันนี้ 1 ครั้ง' : 'ทำภารกิจวันนี้สักข้อเพื่อได้น้ำ';

  return (
    <>
      <PageHeader title="ดูแล Sprouty" subtitle="รดน้ำ ใส่ปุ๋ย และสร้างความผูกพันกับ Sprouty" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padded={false} className="overflow-hidden">
          {/* Sprouty's corner: background, Sprouty (rub its head!), and what it says */}
          <div className="relative h-80 overflow-hidden">
            <BackgroundArt id={outfit.background} className="absolute inset-0 h-full w-full" />
            <p className="sprouty-bubble absolute top-3 left-1/2 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl bg-surface/95 px-4 py-2 text-center text-caption font-medium text-forest shadow-card" aria-live="polite">
              {line}
            </p>
            <button
              type="button"
              {...pet.handlers}
              style={pet.touchStyle}
              onClick={() => !pet.consumeTap() && setHop((h) => h + 1)}
              aria-label="แตะหรือลูบหัว Sprouty"
              className="absolute bottom-0 left-1/2 block w-56 -translate-x-1/2 rounded-full"
            >
              <SproutySeed size={224} className="h-auto w-full" mood={mood} stage={stage} hop={reduce ? 0 : hop} outfit={outfit} title="" />
            </button>
            <AnimatePresence>{reaction?.kind === 'water' && !reduce && <WateringFx key={`w${hop}`} />}</AnimatePresence>
            <AnimatePresence>{reaction?.kind === 'feed' && !reduce && <FeedFx key={`f${hop}`} />}</AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              type="button"
              onClick={water}
              disabled={!care.hasWaterToday || care.wateredToday}
              className="flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#0EA5E9] px-2 py-2 text-white shadow-card transition active:scale-95 disabled:bg-background disabled:text-muted disabled:shadow-none disabled:ring-1 disabled:ring-border"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <Droplets size={18} aria-hidden="true" /> รดน้ำ
              </span>
              <span className="text-[0.6875rem] leading-tight opacity-90">{waterHint}</span>
            </button>
            <button
              type="button"
              onClick={feed}
              disabled={care.fertilizer <= 0}
              className="flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#F59E0B] px-2 py-2 text-white shadow-card transition active:scale-95 disabled:bg-background disabled:text-muted disabled:shadow-none disabled:ring-1 disabled:ring-border"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles size={18} aria-hidden="true" /> ใส่ปุ๋ย
              </span>
              <span className="text-[0.6875rem] leading-tight opacity-90">{care.fertilizer > 0 ? `มีปุ๋ย ${care.fertilizer} ถุง` : 'ทำภารกิจเพื่อลุ้นปุ๋ย'}</span>
            </button>
          </div>
          <Link to="/profile" className="mx-3 mb-3 flex min-h-11 items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-primary ring-1 ring-border">
            <Shirt size={15} aria-hidden="true" /> แต่งตัว Sprouty ในตู้เสื้อผ้า
          </Link>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title={`ความผูกพัน ระดับ ${care.bond.level}`} icon={<Heart size={18} className="text-[#E11D48]" aria-hidden="true" />} />
            <div className="flex gap-1" aria-label={`ความผูกพันระดับ ${care.bond.level} จาก ${MAX_BOND}`} role="img">
              {Array.from({ length: MAX_BOND }, (_, i) => (
                <Heart key={i} size={22} className={i < care.bond.level ? 'fill-[#F43F5E] text-[#F43F5E]' : 'text-border'} aria-hidden="true" />
              ))}
            </div>
            <div className="mt-3">
              {care.bond.nextAt ? (
                <ProgressBar value={care.bond.intoLevel / BOND_STEP} label={`ถึงระดับ ${care.bond.level + 1}`} showLabel valueText={`${care.bond.intoLevel}/${BOND_STEP} แต้ม`} />
              ) : (
                <p className="text-caption font-semibold text-primary">ความผูกพันเต็มแล้ว! Sprouty รักคุณที่สุด</p>
              )}
            </div>
            {nextBondItem && (
              <p className="mt-2 flex items-center gap-1.5 text-caption text-muted">
                <Gift size={14} className="text-primary" aria-hidden="true" /> ระดับ {nextBondItem.unlock.type === 'bond' ? nextBondItem.unlock.level : ''} ปลดล็อก “{nextBondItem.name}”
              </p>
            )}
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-caption">
              <div className="rounded-control bg-background p-2">
                <dt className="text-muted">รดน้ำแล้ว</dt>
                <dd className="text-section font-bold text-forest">{care.care.wateredDays.length} วัน</dd>
              </div>
              <div className="rounded-control bg-background p-2">
                <dt className="text-muted">ปุ๋ยที่ใช้</dt>
                <dd className="text-section font-bold text-forest">{care.care.fertilizerUsed}</dd>
              </div>
              <div className="rounded-control bg-background p-2">
                <dt className="text-muted">ปุ๋ยที่ได้</dt>
                <dd className="text-section font-bold text-forest">{care.fertilizerEarned}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <SectionTitle title={active ? `กิจกรรมตอนนี้: ${shownEvent.name}` : 'กิจกรรมถัดไป'} icon={<CalendarHeart size={18} className="text-primary" aria-hidden="true" />} />
            <p className="text-body font-semibold text-forest">
              {shownEvent.name} · {eventDateLabel(shownEvent)}
            </p>
            <p className="mt-1 text-caption text-muted">
              {active ? `${shownEvent.blurb} (ถึง ${eventDateLabel(shownEvent)} +3 วัน)` : `เริ่มในอีก ${next.inDays} วัน · ${shownEvent.blurb}`}
            </p>
            {eventReward && (
              <p className={`mt-2 flex items-center gap-1.5 text-caption font-semibold ${eventDone ? 'text-primary' : 'text-forest'}`}>
                {eventDone ? <CheckCircle2 size={15} aria-hidden="true" /> : <Gift size={15} aria-hidden="true" />}
                {eventDone ? `ได้รับ “${eventReward.name}” แล้ว` : `ของรางวัล: “${eventReward.name}”`}
              </p>
            )}
            {active && !eventDone && (
              <Link to="/missions" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-caption font-semibold text-white">
                ไปทำภารกิจ
              </Link>
            )}
          </Card>

          {sources.length > 0 && (
            <Card>
              <SectionTitle title="ปุ๋ยที่ได้ล่าสุด" icon={<Sparkles size={18} className="text-[#F59E0B]" aria-hidden="true" />} />
              <ul className="divide-y divide-border text-caption">
                {sources.map((c) => (
                  <li key={c.id} className="flex justify-between gap-2 py-2">
                    <span className="min-w-0 truncate">{missions.find((m) => m.id === c.missionId)?.title ?? 'ภารกิจ'}</span>
                    <span className="shrink-0 text-muted">{c.localDate.split('-').reverse().join('/')}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card tone="mint">
            <SectionTitle title="วิธีดูแล Sprouty" icon={<Info size={18} className="text-primary" aria-hidden="true" />} />
            <ul className="list-disc space-y-1 pl-5 text-caption text-text">
              <li>วันที่ทำภารกิจอย่างน้อย 1 ข้อ จะได้น้ำ 1 ครั้ง กดรดน้ำได้วันละครั้ง (+10 แต้ม)</li>
              <li>แต่ละภารกิจมีโอกาสได้ปุ๋ยประมาณ {FERTILIZER_PERCENT}% ผลลุ้นถูกกำหนดตอนบันทึก กดซ้ำหรือโหลดใหม่ไม่เปลี่ยน (+15 แต้มต่อถุง)</li>
              <li>ลูบหัว Sprouty 3 ครั้งเพื่อให้เขิน แตะเพื่อให้กระโดด</li>
              <li>ถ้าไม่ได้มา {LONELY_AFTER_DAYS} วันขึ้นไป Sprouty จะบอกว่าคิดถึง แต่ความผูกพันไม่ลดลง</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
