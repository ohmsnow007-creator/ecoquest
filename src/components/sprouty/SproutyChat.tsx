import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Send, X, BookOpen } from 'lucide-react';
import { PlayerSprouty } from './PlayerSprouty';
import type { SproutyMood } from '../illustrations/SproutySeed';
import { answerQuestion, type SproutyReply } from '../../utils/sproutyChat';
import { SUGGESTED_QUESTIONS } from '../../data/knowledge';

interface Message {
  id: number;
  from: 'me' | 'sprouty';
  text: string;
  reply?: SproutyReply;
}

const CHAT_KEY = 'ecoquest_chat';
const GREETING: Message = {
  id: 0,
  from: 'sprouty',
  text: 'สวัสดี! ฉัน Sprouty 🌱 ถามฉันได้ทุกเรื่องเกี่ยวกับธรรมชาติ สัตว์ ป่า ทะเล ขยะ พลังงาน น้ำ และโลกร้อน หรือกดคำถามด้านล่างก็ได้นะ',
};

/** The conversation lives only for this browser session (and never leaves the device). */
function loadChat(): Message[] {
  try {
    const raw = sessionStorage.getItem(CHAT_KEY);
    const list = raw ? (JSON.parse(raw) as Message[]) : null;
    return Array.isArray(list) && list.length ? list.slice(-60) : [GREETING];
  } catch {
    return [GREETING];
  }
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Sprouty กำลังคิด">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-2 w-2 rounded-full bg-primary"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

function SproutyBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <span className="-mb-1 block w-9 shrink-0" aria-hidden="true">
        <PlayerSprouty size={36} mood="happy" />
      </span>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 text-body leading-relaxed text-forest shadow-card ring-1 ring-mint/60">
        {children}
      </div>
    </div>
  );
}

function ChatSheet({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>(loadChat);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [mood, setMood] = useState<SproutyMood>('happy');
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* storage blocked: keep chatting without saving */
    }
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, thinking, reduce]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onClose]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    const reply = answerQuestion(q);
    setMessages((m) => [...m, { id: Date.now(), from: 'me', text: q }]);
    setText('');
    setThinking(true);
    setMood('thinking');
    // A short pause so the answer reads like Sprouty thought about it (the lookup itself is instant).
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'sprouty', text: reply.text, reply }]);
      setThinking(false);
      setMood(reply.unknown ? 'worried' : 'cheer');
      timer.current = setTimeout(() => setMood('happy'), 2200);
    }, reduce ? 300 : 900 + Math.min(reply.text.length * 3, 700));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(text);
  };

  const last = messages[messages.length - 1];
  const chips = !thinking && last?.reply?.suggestions?.length ? last.reply.suggestions : SUGGESTED_QUESTIONS;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div className="absolute inset-0 bg-evergreen/60 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="คุยกับ Sprouty"
        className="safe-bottom relative flex h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] bg-background shadow-raised sm:h-[80dvh] sm:rounded-card"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* header: Sprouty (dressed as you dressed it) shows how it feels */}
        <header className="bg-forest-hero flex items-center gap-3 px-4 pt-3 pb-3 text-white">
          <span className="block w-16 shrink-0" aria-hidden="true">
            <PlayerSprouty size={64} mood={mood} hop={mood === 'cheer' ? messages.length : 0} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-section leading-tight font-bold">คุยกับ Sprouty</h2>
            <p className="text-[0.75rem] leading-snug text-mint">
              {thinking ? 'กำลังคิดคำตอบ…' : 'ตอบจากคลังความรู้ในแอป · ข้อความไม่ถูกส่งออกนอกเครื่อง'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
            <X size={20} />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4" aria-live="polite">
          {messages.map((m) =>
            m.from === 'me' ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-md bg-forest px-3.5 py-2.5 text-body leading-relaxed whitespace-pre-line text-white shadow-card">{m.text}</p>
              </div>
            ) : (
              <SproutyBubble key={m.id}>
                <p className="whitespace-pre-line">{m.text}</p>
                {m.reply?.source && (
                  <p className="mt-2 flex items-start gap-1 border-t border-border pt-1.5 text-[0.75rem] leading-snug text-muted">
                    <BookOpen size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {m.reply.source.url ? (
                      <a href={m.reply.source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">
                        ที่มา: {m.reply.source.name}
                      </a>
                    ) : (
                      <span>ที่มา: {m.reply.source.name}</span>
                    )}
                  </p>
                )}
              </SproutyBubble>
            ),
          )}
          {thinking && (
            <SproutyBubble>
              <TypingDots />
            </SproutyBubble>
          )}
        </div>

        {/* suggested questions: tap to ask */}
        <div className="border-t border-border bg-surface/80 pt-2">
          <ul className="scrollbar-hide flex gap-2 overflow-x-auto px-3 pb-2" style={{ touchAction: 'pan-x' }} aria-label="คำถามแนะนำ">
            {chips.map((c) => (
              <li key={c} className="shrink-0">
                <button
                  type="button"
                  onClick={() => ask(c)}
                  disabled={thinking}
                  className="min-h-9 rounded-full bg-pale-mint px-3 text-caption font-semibold text-forest ring-1 ring-mint active:scale-95 disabled:opacity-50"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={submit} className="flex items-center gap-2 px-3 pb-3">
            <label htmlFor="sprouty-ask" className="sr-only">พิมพ์คำถาม</label>
            <input
              id="sprouty-ask"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์คำถามถึง Sprouty…"
              autoComplete="off"
              enterKeyHint="send"
              maxLength={200}
              className="min-h-12 flex-1 rounded-full border border-border bg-surface px-4 text-base focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              aria-label="ส่งคำถาม"
              disabled={!text.trim() || thinking}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-card active:scale-95 disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </form>
        </div>
      </motion.section>
    </div>
  );
}

/** A cute round robot with a leaf antenna and rosy cheeks (the chat button's icon). */
function LeafBot({ blink }: { blink: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11 drop-shadow-sm">
      {/* leaf antenna, swaying */}
      <motion.g style={{ transformOrigin: '32px 18px' }} animate={blink ? { rotate: [-8, 8, -8] } : undefined} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M32 18 L32 9" stroke="#2F7A3E" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M32 10 C26 2 18 4 18 9 C23 13 29 12 32 10 Z" fill="#7CCB4F" />
        <path d="M32 10 C38 1 47 3 46 9 C41 13 35 12 32 10 Z" fill="#A3E06F" />
      </motion.g>
      {/* ears */}
      <rect x={6} y={30} width={7} height={13} rx={3.5} fill="#5FB8A0" />
      <rect x={51} y={30} width={7} height={13} rx={3.5} fill="#5FB8A0" />
      {/* head */}
      <rect x={11} y={17} width={42} height={38} rx={16} fill="#BFF0DC" stroke="#5FB8A0" strokeWidth={2.4} />
      <ellipse cx={22} cy={24} rx={6} ry={3} fill="#FFFFFF" opacity={0.7} />
      {/* screen face */}
      <rect x={17} y={28} width={30} height={19} rx={9} fill="#123C2E" />
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={blink ? { scaleY: [1, 1, 0.1, 1, 1] } : undefined} transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}>
        <ellipse cx={26} cy={36} rx={3} ry={3.6} fill="#C6F36B" />
        <ellipse cx={38} cy={36} rx={3} ry={3.6} fill="#C6F36B" />
      </motion.g>
      <path d="M28.5 42 Q32 45 35.5 42" stroke="#C6F36B" strokeWidth={2} strokeLinecap="round" fill="none" />
      <ellipse cx={19.5} cy={43} rx={3} ry={1.8} fill="#F9A8D4" opacity={0.9} />
      <ellipse cx={44.5} cy={43} rx={3} ry={1.8} fill="#F9A8D4" opacity={0.9} />
    </svg>
  );
}

/** Floating chat button (Home only) that opens a chat with Sprouty. */
export function SproutyChatButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const reduce = useReducedMotion();
  return (
    <>
      {/* 56px tap area around a 52px frosted-glass button with a cute leaf robot */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดแชตถามความรู้กับ Sprouty"
        className="fixed right-3 z-40 flex h-14 w-14 items-center justify-center lg:bottom-8"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.88 }}
      >
        {!reduce && (
          <motion.span
            className="absolute h-[3.25rem] w-[3.25rem] rounded-full bg-lime/40"
            animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.6, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
        <span
          className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-white/30 shadow-raised ring-1 ring-white/70 backdrop-blur-md"
          style={{ boxShadow: '0 8px 24px rgb(14 127 89 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.7)' }}
          aria-hidden="true"
        >
          <LeafBot blink={!reduce} />
        </span>
      </motion.button>
      {createPortal(<AnimatePresence>{open && <ChatSheet key="chat" onClose={close} />}</AnimatePresence>, document.body)}
    </>
  );
}
