import { describe, it, expect } from 'vitest';
import { quizzes, QUIZ_CATEGORY_LABELS } from '../data/quizzes';
import { evaluateQuizAttempt, QUIZ_XP_BY_DIFFICULTY, type QuizDraft } from '../services/rewardService';
import { storageService } from '../services/storageService';
import type { QuizCategory } from '../types';

describe('quiz data integrity', () => {
  it('has at least 30 questions with unique ids', () => {
    expect(quizzes.length).toBeGreaterThanOrEqual(30);
    expect(new Set(quizzes.map((q) => q.id)).size).toBe(quizzes.length);
  });

  it('covers all five categories', () => {
    const cats = new Set(quizzes.map((q) => q.category));
    for (const c of Object.keys(QUIZ_CATEGORY_LABELS) as QuizCategory[]) expect(cats.has(c)).toBe(true);
  });

  it('every question has unique option ids and a correct answer among them', () => {
    for (const q of quizzes) {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(q.correctAnswerId);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    }
  });

  it('questions that quote a published figure carry a source', () => {
    const quotesFigure = (t: string) => /(ประมาณ|รายงาน|ประเมิน|ปี 20|ข้อมูลปี|NOAA|WWF|FAO|IEA|IPBES|USGS|TGO)/.test(t);
    for (const q of quizzes.filter((x) => quotesFigure(x.question) && /\d/.test(x.options.map((o) => o.text).join(' ')))) {
      expect(q.source?.name, q.id).toBeTruthy();
    }
  });
});

const draftFor = (ids: string[], answers: Record<string, string>, id = 'attempt-1'): QuizDraft => ({
  id, startedAt: new Date().toISOString(), category: 'all', difficulty: 'all', questionIds: ids, answers,
});

describe('quiz grading and reward rule', () => {
  const qs = quizzes.slice(0, 4);
  const correct = Object.fromEntries(qs.map((q) => [q.id, q.correctAnswerId]));
  const wrongFirst = { ...correct, [qs[0].id]: qs[0].options.find((o) => o.id !== qs[0].correctAnswerId)!.id };

  it('scores from the actual answers', () => {
    const r = evaluateQuizAttempt(storageService.getDefaultProgress(), draftFor(qs.map((q) => q.id), wrongFirst), new Date());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.attempt.correctCount).toBe(3);
    expect(r.attempt.total).toBe(4);
    expect(r.attempt.scorePercent).toBe(75);
    expect(r.attempt.results[0]).toMatchObject({ correct: false });
  });

  it('awards XP only the first time a question is answered correctly', () => {
    const first = evaluateQuizAttempt(storageService.getDefaultProgress(), draftFor(qs.map((q) => q.id), correct, 'a1'), new Date());
    if (!first.ok) throw new Error('first attempt failed');
    const expected = qs.reduce((s, q) => s + QUIZ_XP_BY_DIFFICULTY[q.difficulty], 0);
    expect(first.attempt.xpAwarded).toBe(expected);

    const second = evaluateQuizAttempt(first.next, draftFor(qs.map((q) => q.id), correct, 'a2'), new Date());
    if (!second.ok) throw new Error('second attempt failed');
    expect(second.attempt.xpAwarded).toBe(0);
    expect(second.next.totalXp).toBe(expected);
  });

  it('rejects the same attempt id twice and invalid question ids', () => {
    const first = evaluateQuizAttempt(storageService.getDefaultProgress(), draftFor([qs[0].id], correct, 'same'), new Date());
    if (!first.ok) throw new Error('first attempt failed');
    expect(evaluateQuizAttempt(first.next, draftFor([qs[0].id], correct, 'same'), new Date())).toEqual({ ok: false, reason: 'duplicate' });
    expect(evaluateQuizAttempt(first.next, draftFor(['nope'], {}, 'other'), new Date())).toEqual({ ok: false, reason: 'invalid' });
  });

  it('counts an unanswered question as wrong', () => {
    const r = evaluateQuizAttempt(storageService.getDefaultProgress(), draftFor([qs[0].id], {}), new Date());
    expect(r.ok && r.attempt.results[0]).toMatchObject({ answerId: null, correct: false });
  });
});
