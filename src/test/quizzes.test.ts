import { describe, it, expect } from 'vitest';
import { quizzes } from '../data/quizzes';

describe('quiz data integrity', () => {
  it('has at least 10 questions', () => {
    expect(quizzes.length).toBeGreaterThanOrEqual(10);
  });

  it('every question has unique id', () => {
    const ids = quizzes.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question has valid correctIndex', () => {
    for (const q of quizzes) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.choices.length);
    }
  });

  it('every question has at least 2 choices', () => {
    for (const q of quizzes) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every question awards positive XP', () => {
    for (const q of quizzes) {
      expect(q.xp).toBeGreaterThan(0);
    }
  });

  it('every question has a non-empty explanation', () => {
    for (const q of quizzes) {
      expect(q.explanation.trim().length).toBeGreaterThan(0);
    }
  });
});
