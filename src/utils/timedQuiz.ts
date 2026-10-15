import type { TimedQuizRun } from '../types';
import { quizzes, type QuizQuestion } from '../data/quizzes';

export const TIMED_QUIZ_SECONDS = 60;

/** Best run: most correct answers; on a tie, the more accurate run (fewer answers); then the earlier one. */
export function bestTimedRun(runs: TimedQuizRun[] | undefined): TimedQuizRun | null {
  if (!runs?.length) return null;
  return [...runs].sort((a, b) => b.correct - a.correct || a.answered - b.answered || a.at.localeCompare(b.at))[0];
}

/** A fresh shuffled question order; reshuffled when a fast player runs out. */
export function shuffledQuestions(random: () => number = Math.random): QuizQuestion[] {
  const out = [...quizzes];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
