import { KNOWLEDGE, type KnowledgeEntry } from '../data/knowledge';
import { TOPICS, type Topic } from '../data/knowledgeMore';
import { BINS, WASTE_ITEMS, type Bin, type WasteItem } from '../data/wasteItems';

/*
 * On-device matching for Sprouty's answers and the waste sorter. No network, no AI model: text is
 * normalised, then compared with known names/questions (exact words first, then character-pair
 * similarity so typos and different word orders still match).
 */

/** Lowercase, drop spaces/punctuation and Thai repetition marks so "ขวด น้ำ" = "ขวดน้ำ". */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/₂/g, '2')
    .replace(/[\s.,!?;:'"“”‘’()\-_/\\ๆฯ…]+/g, '')
    .trim();
}

function bigrams(s: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out.length ? out : s ? [s] : [];
}

/** Dice similarity of character pairs (0–1). */
export function similarity(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  if (!A.length || !B.length) return 0;
  const pool = new Map<string, number>();
  for (const g of B) pool.set(g, (pool.get(g) ?? 0) + 1);
  let hit = 0;
  for (const g of A) {
    const n = pool.get(g) ?? 0;
    if (n > 0) {
      hit++;
      pool.set(g, n - 1);
    }
  }
  return (2 * hit) / (A.length + B.length);
}

/** Share of the query's character pairs found in the text (good for short questions vs long ones). */
function containment(query: string, text: string): number {
  const Q = bigrams(query);
  if (!Q.length) return 0;
  const T = new Set(bigrams(text));
  return Q.filter((g) => T.has(g)).length / Q.length;
}

// ---------------- waste sorter

export interface WasteMatch {
  item: WasteItem;
  bin: Bin;
  /** The name that matched best. */
  name: string;
  score: number;
}

/** Best bins for a typed waste name, best first. Empty when nothing is close enough. */
export function classifyWaste(input: string, limit = 3): WasteMatch[] {
  const q = normalize(input);
  if (!q) return [];
  const scored: WasteMatch[] = [];
  for (const item of WASTE_ITEMS) {
    let best = 0;
    let bestName = item.names[0];
    for (const name of item.names) {
      const n = normalize(name);
      let s: number;
      if (n === q) s = 1;
      else if (q.includes(n)) s = 0.75 + 0.2 * (n.length / q.length);
      else if (n.includes(q) && q.length >= 2) s = 0.6 + 0.3 * (q.length / n.length);
      else s = similarity(q, n);
      if (s > best) {
        best = s;
        bestName = name;
      }
    }
    if (best >= 0.5) scored.push({ item, bin: BINS[item.bin], name: bestName, score: best });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ---------------- Sprouty's answers

export interface SproutyReply {
  text: string;
  source?: { name: string; url?: string };
  /** Follow-up questions to offer. */
  suggestions?: string[];
  /** The question matched nothing in the knowledge base. */
  unknown?: boolean;
}

/** Question words that every question shares; ignored when comparing wording. */
const FILLER = /(คืออะไร|อะไร|ยังไง|อย่างไร|ได้ไหม|ไหม|มั้ย|หรือเปล่า|เท่าไหร่|เท่าใด|แค่ไหน|ทำไม|บ้าง|ครับ|คับ|ค่ะ|คะ|จ้า|นะ)/g;
const core = (s: string) => s.replace(FILLER, '');

function scoreEntry(q: string, e: KnowledgeEntry): number {
  const cq = core(q);
  let askSim = 0;
  for (const a of e.ask) {
    const n = core(normalize(a));
    askSim = Math.max(askSim, similarity(cq, n), 0.85 * containment(cq, n) * Math.min(1, cq.length / 6));
  }
  if (e.match.length) {
    const hits = e.match.map((group) => group.map(normalize).filter((w) => q.includes(w)));
    if (hits.every((h) => h.length > 0)) {
      const matchedLength = hits.reduce((n, h) => n + Math.max(...h.map((w) => w.length)), 0);
      // Keyword hit; among several hits, the entry whose wording is closer to the question wins.
      return 1 + e.match.length * 0.15 + matchedLength * 0.01 + askSim * 0.3;
    }
  }
  return askSim;
}

const WASTE_INTENT = ['ทิ้ง', 'ถังไหน', 'ถังอะไร', 'ถังสีอะไร', 'แยกขยะ'];
/** General questions about the bins themselves (answered from knowledge, not as one item). */
const BIN_QUESTION = ['ถังขยะ', 'แต่ละสี', 'กี่สี', 'สีถัง', 'แยกขยะยังไง'];

const BIN_NOTE: Record<WasteItem['bin'], string> = {
  green: 'ย่อยสลายได้ นำไปทำปุ๋ยหมักได้ 🌱',
  yellow: 'รีไซเคิลได้ ♻️',
  blue: 'รีไซเคิลยาก ทิ้งรวมขยะทั่วไป',
  red: 'เป็นขยะอันตราย ต้องแยกทิ้งเสมอ ⚠️',
};

/** A waste item named inside the question (longest name wins), if any. */
function wasteInQuestion(q: string): WasteMatch | null {
  let found: WasteMatch | null = null;
  for (const item of WASTE_ITEMS) {
    for (const name of item.names) {
      const n = normalize(name);
      if (n.length >= 3 && q.includes(n) && (!found || n.length > normalize(found.name).length)) {
        found = { item, bin: BINS[item.bin], name, score: 1 };
      }
    }
  }
  return found;
}

function wasteReply(m: WasteMatch): SproutyReply {
  return {
    text: `“${m.name}” ทิ้ง${m.bin.name} – ${m.bin.kind} 🗑️
${BIN_NOTE[m.item.bin]}${m.item.tip ? `
เคล็ดลับ: ${m.item.tip}` : ''}`,
    source: { name: 'กรมควบคุมมลพิษ – การคัดแยกขยะตามสีถัง' },
    suggestions: ['ถังขยะแต่ละสีทิ้งอะไร?', `${m.name}ย่อยสลายกี่ปี?`],
  };
}

/** Is the question about nature / environment / waste / the app at all? */
function topicOf(q: string): Topic | undefined {
  let best: Topic | undefined;
  let bestHits = 0;
  for (const t of TOPICS) {
    const hits = t.words.filter((w) => q.includes(normalize(w))).length;
    if (hits > bestHits) {
      best = t;
      bestHits = hits;
    }
  }
  return best;
}

const OFF_TOPIC: SproutyReply = {
  text: 'ขอโทษนะ 🙏 ฉันตอบได้เฉพาะเรื่องธรรมชาติ สิ่งแวดล้อม ขยะ พลังงาน น้ำ และการใช้แอป EcoQuest เท่านั้น ลองถามเรื่องเหล่านี้ดูนะ 🌱',
  unknown: true,
  suggestions: ['ขยะพลาสติกย่อยสลายกี่ปี?', 'ทำไมโลกร้อน?', 'ทำไมต้องรักษาป่า?', 'ประหยัดไฟทำยังไง?'],
};

/**
 * Sprouty's answer. Order: a known waste item + "where/how to throw" → the bin; a strong knowledge
 * match → that answer; any other waste item named → the bin; an environmental topic without a precise
 * match → the topic overview with good follow-ups; anything else → politely declined (off-topic).
 */
export function answerQuestion(input: string): SproutyReply {
  const q = normalize(input);
  if (!q) return { text: 'พิมพ์คำถามมาได้เลยนะ 🌱', unknown: true };
  const generalBins = BIN_QUESTION.some((w) => q.includes(normalize(w)));

  // "Where do I throw X?" / "Can X be recycled?"
  const intent = WASTE_INTENT.some((w) => q.includes(normalize(w))) || /รีไซเคิลได้|ทิ้งยังไง|ทิ้งที่ไหน/.test(q);
  if (intent && !generalBins) {
    const named = wasteInQuestion(q);
    if (named) return wasteReply(named);
    const stripped = WASTE_INTENT.reduce((s, w) => s.split(normalize(w)).join(''), q).replace(/(รีไซเคิลได้|ลง|ที่|ใน|ควร|ต้อง|ยังไง|อย่างไร|ไหน|ไหม|มั้ย)/g, '');
    const [m] = classifyWaste(stripped);
    if (m && m.score >= 0.6) return wasteReply(m);
  }

  let best: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const e of KNOWLEDGE) {
    const s = scoreEntry(q, e);
    if (s > bestScore) {
      best = e;
      bestScore = s;
    }
  }
  if (best && bestScore >= 0.55) {
    return { text: best.answer, source: best.source, suggestions: best.next ? [best.next] : undefined };
  }

  const named = generalBins ? null : wasteInQuestion(q);
  if (named) return wasteReply(named);

  const topic = topicOf(q);
  if (topic) {
    return { text: topic.overview, suggestions: topic.suggestions };
  }
  return OFF_TOPIC;
}
