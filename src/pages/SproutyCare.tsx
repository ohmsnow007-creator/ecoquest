import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Droplets, Heart, Sparkles, Shirt, CalendarHeart, Info, Gift, CheckCircle2 } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SproutySeed, type SproutyMood } from '../components/illustrations/SproutySeed';
import { BackgroundArt } from '../components/cosmetics/SproutyScenery';
import { ItemPicker } from '../components/cosmetics/ItemPicker';
import { useOutfit } from '../components/cosmetics/useOutfit';
import { usePet } from '../components/sprouty/usePet';
import { useBlinking } from '../components/sprouty/PlayerSprouty';
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

/** "+N ความผูกพัน" floating up from Sprouty. */
function BondFloat({ amount }: { amount: number }) {
  return (
    <motion.span
      className="pointer-events-none absolute top-1/3 left-1/2 rounded-full bg-white/90 px-3 py-1 text-caption font-bold text-[#E11D48] shadow-card"
      initial={{ x: '-50%', y: 20, opacity: 0, scale: 0.6 }}
      animate={{ y: -50, opacity: [0, 1, 1, 0], scale: 1 }}
      transition={{ duration: 1.8, delay: 0.9, times: [0, 0.2, 0.75, 1] }}
      aria-hidden="true"
    >
      💗 +{amount} ความผูกพัน
    </motion.span>
  );
}

/** A watering can tips over Sprouty; drops fall, splash on the soil, and a little rainbow shines. */
function WateringFx() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.svg
        viewBox="0 0 90 64"
        className="absolute top-14 right-[14%] w-28 drop-shadow-md"
        initial={{ rotate: 10, x: 60, y: -10, opacity: 0 }}
        animate={{ rotate: [10, -32, -28, -34, -30], x: 0, y: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 1.4, times: [0, 0.3, 0.55, 0.8, 1] }}
      >
        <rect x={26} y={20} width={42} height={34} rx={9} fill="#38BDF8" />
        <rect x={26} y={20} width={42} height={8} rx={4} fill="#7DD3FC" />
        <path d="M28 30 L6 16" stroke="#38BDF8" strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={5} cy={15} rx={5} ry={3} fill="#0EA5E9" transform="rotate(-30 5 15)" />
        <path d="M64 24 C84 20 86 46 66 46" stroke="#0284C7" strokeWidth={4.5} fill="none" />
        <path d="M36 34 l5 -3 l5 3" stroke="#FFFFFF" strokeWidth={2} fill="none" opacity={0.7} />
      </motion.svg>
      {Array.from({ length: 16 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute block h-3.5 w-2 rounded-full bg-[#38BDF8]"
          style={{ left: `${38 + (i % 4) * 4 + (i % 3)}%`, top: '30%', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 130], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.8, delay: 0.45 + i * 0.07, ease: 'easeIn' }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute bottom-[14%] block h-3 w-10 rounded-[50%] border-2 border-[#7DD3FC]"
          style={{ left: `${36 + i * 9}%` }}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1.4], opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.9, delay: 1 + i * 0.18 }}
        />
      ))}
      <motion.svg
        viewBox="0 0 200 100"
        className="absolute top-[18%] left-1/2 w-56 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.75, 0], scale: 1 }}
        transition={{ duration: 2.2, delay: 1.2 }}
      >
        {['#F9A8D4', '#FDE68A', '#86EFAC', '#93C5FD'].map((c, i) => (
          <path key={c} d={`M${20 + i * 7} 95 A ${80 - i * 7} ${80 - i * 7} 0 0 1 ${180 - i * 7} 95`} stroke={c} strokeWidth={6} fill="none" />
        ))}
      </motion.svg>
      <BondFloat amount={10} />
    </div>
  );
}

/** A fertilizer bag shakes out granules; Sprouty glows and sparkles and hearts burst out. */
function FeedFx() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.svg
        viewBox="0 0 60 70"
        className="absolute top-12 left-1/2 w-16 -translate-x-1/2 drop-shadow-md"
        initial={{ y: -40, opacity: 0, rotate: 0 }}
        animate={{ y: 0, opacity: [0, 1, 1, 0], rotate: [0, 160, 150, 165, 155] }}
        transition={{ duration: 1.6, times: [0, 0.3, 0.5, 0.75, 1] }}
      >
        <path d="M10 14 L50 14 L54 64 L6 64 Z" fill="#D6A15E" />
        <path d="M10 14 L50 14 L46 6 L14 6 Z" fill="#B7813F" />
        <circle cx={30} cy={40} r={11} fill="#86EFAC" />
        <path d="M30 47 C24 40 26 33 30 31 C34 33 36 40 30 47Z" fill="#16A34A" />
      </motion.svg>
      {Array.from({ length: 18 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full"
          style={{ left: `${44 + (i % 6) * 2}%`, top: '24%', background: i % 3 ? '#8B5E34' : '#86EFAC' }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 140], x: [(i % 5) * 3 - 6, (i % 7) * 4 - 12], opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, delay: 0.55 + i * 0.04, ease: 'easeIn' }}
        />
      ))}
      <motion.span
        className="absolute bottom-[10%] left-1/2 block h-44 w-44 -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(190,242,100,0.55) 0%, rgba(190,242,100,0) 70%)' }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.3, 1.1], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, delay: 1.1 }}
      />
      {Array.from({ length: 12 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-lg"
          style={{ left: '50%', top: '62%' }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
          animate={{ x: Math.cos((i / 12) * Math.PI * 2) * 110, y: Math.sin((i / 12) * Math.PI * 2) * 80 - 40, opacity: [0, 1, 0], scale: 1 }}
          transition={{ duration: 1.3, delay: 1.2 + (i % 4) * 0.05 }}
        >
          {['💚', '✨', '🌱', '💛'][i % 4]}
        </motion.span>
      ))}
      <BondFloat amount={15} />
    </div>
  );
}

export function SproutyCare() {
  const { profile, progress, waterSprouty, feedSprouty, wearCosmetic, notify } = useGame();
  const outfit = useOutfit('sprouty');
  const reduce = useReducedMotion();
  const pet = usePet();
  const [reaction, setReaction] = useState<Reaction>(null);
  const [hop, setHop] = useState(0);
  // Sprouty says hello when you open the page, then shows how it's really doing.
  const [greeting, setGreeting] = useState(true);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const lookHold = useRef(0);
  const stageRef = useRef<HTMLButtonElement>(null);
  const blinking = useBlinking(!reduce);

  useEffect(() => {
    const hello = window.setTimeout(() => setHop((h) => h + 1), 350);
    const done = window.setTimeout(() => setGreeting(false), 3000);
    return () => {
      window.clearTimeout(hello);
      window.clearTimeout(done);
    };
  }, []);

  // Glances around now and then, like it's looking at the scenery (unless following your finger).
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (Date.now() > lookHold.current) {
          setLook({ x: Math.random() * 1.6 - 0.8, y: Math.random() * 0.7 - 0.3 });
          t = setTimeout(() => {
            if (Date.now() > lookHold.current) setLook({ x: 0, y: 0 });
            loop();
          }, 1300);
        } else loop();
      }, 2200 + Math.random() * 2200);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  // Looks toward where you touch the scene.
  const lookAtTouch = (clientX: number, clientY: number) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    lookHold.current = Date.now() + 1600;
    setLook({ x: Math.max(-1, Math.min(1, (clientX - (r.left + r.width / 2)) / (r.width / 2))), y: Math.max(-1, Math.min(1, (clientY - (r.top + r.height * 0.55)) / (r.height / 2))) });
    window.setTimeout(() => Date.now() >= lookHold.current && setLook({ x: 0, y: 0 }), 1700);
  };

  useEffect(() => {
    if (!reaction) return;
    const t = window.setTimeout(() => setReaction(null), 3400);
    return () => window.clearTimeout(t);
  }, [reaction]);

  if (!profile) return null;
  const today = getLocalDate();
  const care = getCareState(progress, today);
  const stage = getSproutyStage(getLevelFromXp(progress.totalXp)).stage;
  const greet = greeting
    ? care.thirsty
      ? { mood: 'pleading' as const, line: `${profile.displayName}! มาแล้วเหรอ… รอตั้งนานเลย 🥺` }
      : { mood: 'cheer' as const, line: `สวัสดี ${profile.displayName}! 👋 ดีใจที่มาเยี่ยมนะ` }
    : null;
  const mood: SproutyMood = pet.shy ? 'shy' : reaction?.mood ?? greet?.mood ?? care.mood;
  const line = pet.shy ? pet.line : reaction?.line ?? greet?.line ?? care.line;
  // Idle life: a gentle bob and sway; when thirsty, a sad droop and a little pleading wiggle.
  const idle = reduce
    ? undefined
    : mood === 'pleading'
      ? { rotate: [0, -3, 3, -2, 2, 0], y: [0, 2, 0, 2, 0, 0], scaleY: [1, 0.97, 1, 0.97, 1, 1] }
      : { y: [0, -5, 0], rotate: [0, 1.5, 0, -1.5, 0] };

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

  const waterHint =
    care.waterLeft > 1
      ? `มีน้ำรด ${care.waterLeft} ครั้ง`
      : care.waterLeft === 1
        ? care.hasWaterToday && !care.wateredToday ? 'มีน้ำจากภารกิจวันนี้ 1 ครั้ง' : 'มีน้ำพิเศษ 1 ครั้ง'
        : care.wateredToday ? 'รดน้ำวันนี้แล้ว พรุ่งนี้มารดใหม่นะ' : 'ทำภารกิจวันนี้สักข้อเพื่อได้น้ำ';

  return (
    <>
      <PageHeader title="ดูแล Sprouty" subtitle="รดน้ำ ใส่ปุ๋ย และสร้างความผูกพันกับ Sprouty" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padded={false} className="overflow-hidden">
          {/* Sprouty's corner: background, Sprouty (rub its head!), and what it says */}
          <div className="relative h-80 overflow-hidden" onPointerDown={(e) => lookAtTouch(e.clientX, e.clientY)}>
            <BackgroundArt id={outfit.background} className="absolute inset-0 h-full w-full" />
            <motion.p
              key={line}
              initial={reduce ? false : { opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 18 }}
              className="sprouty-bubble absolute top-3 left-1/2 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl bg-surface/95 px-4 py-2 text-center text-caption font-medium text-forest shadow-card"
              aria-live="polite"
            >
              {line}
            </motion.p>
            <button
              ref={stageRef}
              type="button"
              {...pet.handlers}
              style={pet.touchStyle}
              onClick={() => !pet.consumeTap() && setHop((h) => h + 1)}
              aria-label="แตะหรือลูบหัว Sprouty"
              className="absolute bottom-0 left-1/2 block w-56 -translate-x-1/2 rounded-full"
            >
              <motion.span
                key={reaction ? `${reaction.kind}-${hop}` : 'idle'}
                className="block origin-bottom"
                animate={
                  reaction && !reduce
                    ? reaction.kind === 'water'
                      ? { scaleY: [1, 1, 0.9, 1.12, 0.97, 1.03, 1], scaleX: [1, 1, 1.08, 0.94, 1.02, 1, 1] }
                      : { scale: [1, 1, 1.14, 0.96, 1.06, 1], rotate: [0, 0, -4, 4, -2, 0], filter: ['brightness(1)', 'brightness(1)', 'brightness(1.25)', 'brightness(1.1)', 'brightness(1)', 'brightness(1)'] }
                    : undefined
                }
                transition={{ duration: 1.5, delay: 0.8 }}
              >
                <motion.span
                  className="block origin-bottom"
                  animate={idle}
                  transition={mood === 'pleading' ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <SproutySeed
                    size={224}
                    className="h-auto w-full"
                    mood={mood}
                    stage={stage}
                    hop={reduce ? 0 : hop}
                    outfit={outfit}
                    look={look}
                    blinking={blinking && mood !== 'cheer'}
                    title=""
                  />
                </motion.span>
              </motion.span>
            </button>
            <AnimatePresence>{reaction?.kind === 'water' && !reduce && <WateringFx key={`w${hop}`} />}</AnimatePresence>
            <AnimatePresence>{reaction?.kind === 'feed' && !reduce && <FeedFx key={`f${hop}`} />}</AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              type="button"
              onClick={water}
              disabled={care.waterLeft <= 0}
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
          {/* Decorate Sprouty's corner right here */}
          <div className="space-y-3 border-t border-border px-5 pt-3 pb-1">
            <ItemPicker
              slot="background"
              label="พื้นหลังของ Sprouty"
              value={outfit.background}
              onChange={(id) => wearCosmetic('background', id ?? null, 'sprouty')}
              noneLabel="พื้นเรียบ"
              thumb={(id) => <BackgroundArt id={id} className="h-full w-full" />}
            />
            <ItemPicker
              slot="pot"
              label="กระถาง"
              value={outfit.pot}
              onChange={(id) => wearCosmetic('pot', id ?? null, 'sprouty')}
              noneLabel="ดินธรรมดา"
              thumb={(id) => <SproutySeed size={64} className="h-auto w-16 translate-y-1" stage={stage} outfit={id ? { pot: id } : {}} title="" />}
            />
          </div>
          <Link to="/profile" className="mx-3 my-3 flex min-h-11 items-center justify-center gap-1.5 rounded-full text-caption font-semibold text-primary ring-1 ring-border">
            <Shirt size={15} aria-hidden="true" /> หมวก แว่น กระเป๋า ในตู้เสื้อผ้า
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
              <li>ภารกิจพิเศษประจำวัน (⭐ วันละ 1 ข้อ เสาร์–อาทิตย์ 2 ข้อ) ได้ปุ๋ย 2 ถุงแน่นอน และ XP เพิ่ม</li>
              <li>ลูบหัว Sprouty 3 ครั้งเพื่อให้เขิน แตะเพื่อให้กระโดด</li>
              <li>ถ้าไม่ได้มา {LONELY_AFTER_DAYS} วันขึ้นไป Sprouty จะบอกว่าคิดถึง แต่ความผูกพันไม่ลดลง</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
