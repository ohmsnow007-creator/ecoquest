import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, Info, Lightbulb } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { PlayerSprouty } from '../components/sprouty/PlayerSprouty';
import type { SproutyMood } from '../components/illustrations/SproutySeed';
import { WasteBin } from '../components/waste/WasteBin';
import { classifyWaste, type WasteMatch } from '../utils/sproutyChat';
import { BINS, BIN_ORDER, BIN_SOURCE, WASTE_EXAMPLES } from '../data/wasteItems';

type Result = { query: string; matches: WasteMatch[] } | null;

/** Type a piece of rubbish; Sprouty says which colour bin it goes in (Thai four-colour standard). */
export function WasteSorter() {
  const reduce = useReducedMotion();
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const check = (value: string) => {
    const q = value.trim();
    if (!q || checking) return;
    setText(q);
    setChecking(true);
    setResult(null);
    const matches = classifyWaste(q);
    // A short pause for Sprouty's "let me look" moment (the lookup itself is instant).
    timer.current = setTimeout(() => {
      setResult({ query: q, matches });
      setChecking(false);
    }, reduce ? 200 : 800);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    check(text);
  };

  const best = result?.matches[0];
  const mood: SproutyMood = checking ? 'thinking' : !result ? 'happy' : best ? 'cheer' : 'worried';
  const line = checking
    ? 'ขอดูก่อนนะ… 🤔'
    : !result
      ? 'พิมพ์ชื่อขยะมาเลย เดี๋ยวฉันบอกว่าทิ้งถังไหน!'
      : best
        ? `“${best.name}” ทิ้ง${best.bin.name}นะ!`
        : `ฉันยังไม่รู้จัก “${result.query}” ลองพิมพ์ชื่อให้สั้นลงดูนะ`;

  return (
    <>
      <PageHeader title="แยกขยะกับ Sprouty" subtitle="พิมพ์ชื่อขยะ แล้วดูว่าต้องทิ้งถังสีไหน" back />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-end gap-2">
            <span className="block w-20 shrink-0" aria-hidden="true">
              <PlayerSprouty size={80} mood={mood} hop={best && !checking ? result!.query.length : 0} />
            </span>
            <p className="sprouty-bubble relative mb-2 min-w-0 flex-1 rounded-2xl rounded-bl-md border border-mint bg-surface px-3 py-2 text-caption font-medium text-forest shadow-card" aria-live="polite">
              {line}
            </p>
          </div>

          <form onSubmit={submit} className="mt-3 flex gap-2">
            <label htmlFor="waste-name" className="sr-only">ชื่อขยะ</label>
            <input
              id="waste-name"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เช่น ขวดน้ำพลาสติก, เปลือกกล้วย"
              autoComplete="off"
              enterKeyHint="search"
              maxLength={60}
              className="min-h-12 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-base focus:border-primary focus:outline-none"
            />
            <button type="submit" disabled={!text.trim() || checking} className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 font-semibold text-white shadow-card active:scale-95 disabled:opacity-40">
              <Search size={17} aria-hidden="true" /> ตรวจสอบ
            </button>
          </form>

          <ul className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" style={{ touchAction: 'pan-x' }} aria-label="ตัวอย่างขยะ">
            {WASTE_EXAMPLES.map((w) => (
              <li key={w} className="shrink-0">
                <button type="button" onClick={() => check(w)} className="min-h-9 rounded-full bg-pale-mint px-3 text-caption font-semibold text-forest ring-1 ring-mint active:scale-95">
                  {w}
                </button>
              </li>
            ))}
          </ul>

          <AnimatePresence mode="wait">
            {best && result && (
              <motion.div
                key={result.query}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 18 }}
                className="mt-4 overflow-hidden rounded-2xl ring-2"
                style={{ background: `${best.bin.color}1A`, boxShadow: `inset 0 0 0 2px ${best.bin.color}` }}
                data-testid="waste-result"
              >
                <div className="flex items-center gap-3 p-4">
                  <motion.span
                    className="block w-24 shrink-0"
                    initial={reduce ? false : { rotate: -8, y: 10 }}
                    animate={{ rotate: [0, -6, 6, 0], y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <WasteBin id={best.bin.id} open className="h-auto w-full" />
                  </motion.span>
                  <div className="min-w-0">
                    <p className="text-caption text-muted">“{best.name}” ทิ้งที่</p>
                    <p className="font-display text-[1.5rem] leading-tight font-bold" style={{ color: best.bin.dark }}>
                      {best.bin.name}
                    </p>
                    <p className="text-body font-semibold text-forest">{best.bin.kind}</p>
                  </div>
                </div>
                {best.item.tip && (
                  <p className="flex items-start gap-2 border-t border-white/60 bg-surface/70 px-4 py-3 text-caption text-forest">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" aria-hidden="true" /> {best.item.tip}
                  </p>
                )}
                {result.matches.length > 1 && (
                  <div className="border-t border-white/60 bg-surface/70 px-4 py-2.5 text-[0.75rem] text-muted">
                    หมายถึงอย่างอื่นหรือเปล่า:{' '}
                    {result.matches.slice(1).map((m, i) => (
                      <button key={m.name} type="button" onClick={() => check(m.name)} className="font-semibold text-primary underline decoration-dotted">
                        {i > 0 && ', '}
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            {result && !best && (
              <motion.p key="unknown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl bg-background p-4 text-caption text-text">
                ยังไม่มี “{result.query}” ในรายการขยะของแอป ลองพิมพ์ชื่อสั้น ๆ เช่น “ขวด” “ถุง” “กล่อง” หรือดูตัวอย่างในแต่ละถังด้านล่าง ถ้ายังไม่แน่ใจ ให้ดูป้ายที่ถังขยะในพื้นที่ของคุณ
              </motion.p>
            )}
          </AnimatePresence>
        </Card>

        <Card>
          <SectionTitle title="ถังขยะ 4 สี" />
          <ul className="grid grid-cols-2 gap-3">
            {BIN_ORDER.map((id) => {
              const b = BINS[id];
              const active = best?.bin.id === id;
              return (
                <li key={id} className={`rounded-2xl p-3 text-center ring-2 transition ${active ? 'scale-[1.02] shadow-card' : 'ring-transparent'}`} style={{ background: `${b.color}14`, ...(active ? { boxShadow: `0 0 0 2px ${b.color}` } : {}) }}>
                  <WasteBin id={id} open={active} className="mx-auto h-auto w-16" />
                  <p className="mt-1 font-semibold" style={{ color: b.dark }}>
                    {b.name}
                  </p>
                  <p className="text-caption font-medium text-forest">{b.kind}</p>
                  <p className="mt-0.5 text-[0.75rem] leading-snug text-muted">{b.examples}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-start gap-1.5 text-[0.75rem] leading-snug text-muted">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            สีถังตาม{BIN_SOURCE.name} บางพื้นที่อาจใช้สีต่างกัน (เช่น ขยะอันตรายใช้สีส้ม) ให้ดูป้ายที่ถังด้วย · ระบบจับคู่ชื่อขยะจากรายการในแอป ทำงานในเครื่อง ไม่ส่งข้อมูลออก
          </p>
        </Card>
      </div>
    </>
  );
}
