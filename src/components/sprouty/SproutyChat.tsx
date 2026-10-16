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

/** Floating 🤖 button (Home only) that opens a chat with Sprouty. */
export function SproutyChatButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const reduce = useReducedMotion();
  return (
    <>
      {/* 48px tap area around a 40px themed button: your Sprouty peeking out of a green bubble */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดแชตถามความรู้กับ Sprouty"
        className="fixed right-3 z-40 flex h-12 w-12 items-center justify-center lg:bottom-8"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.75rem)' }}
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.88 }}
      >
        {!reduce && (
          <motion.span
            className="absolute h-10 w-10 rounded-full bg-lime/50"
            animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.4, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
        <span className="bg-forest-hero relative flex h-10 w-10 items-end justify-center overflow-hidden rounded-full shadow-raised ring-2 ring-lime" aria-hidden="true">
          <span className="block w-[3.1rem] translate-y-[0.55rem]">
            <PlayerSprouty size={50} mood="happy" />
          </span>
        </span>
        {/* little lime speech bubble with typing dots */}
        <span className="absolute -top-0.5 -right-0.5 flex h-[1.05rem] items-center gap-[2px] rounded-full rounded-bl-sm bg-lime px-1 shadow-card ring-2 ring-surface" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-[3px] w-[3px] rounded-full bg-forest"
              animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </span>
      </motion.button>
      {createPortal(<AnimatePresence>{open && <ChatSheet key="chat" onClose={close} />}</AnimatePresence>, document.body)}
    </>
  );
}
