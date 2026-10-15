import type { MascotMood } from '../components/ui/EcoMascot';

export type QuizResultState = 'excellent' | 'good' | 'keep-learning';

export interface QuizResultConfig {
  state: QuizResultState;
  /** Lowest score percent (inclusive) for this state. */
  minPercent: number;
  title: string;
  message: string;
  mood: MascotMood;
  celebrate: boolean;
}

// Central score bands for the quiz result page, checked from the highest band down.
export const QUIZ_RESULT_STATES: QuizResultConfig[] = [
  { state: 'excellent', minPercent: 80, title: 'ยอดเยี่ยม!', message: 'คุณเข้าใจเรื่องนี้ดีมาก', mood: 'cheer', celebrate: true },
  { state: 'good', minPercent: 60, title: 'ทำได้ดี!', message: 'ผ่านเกณฑ์แล้ว ลองทบทวนข้อที่พลาดดูนะ', mood: 'happy', celebrate: true },
  { state: 'keep-learning', minPercent: 0, title: 'เรียนรู้ต่ออีกนิด', message: 'อ่านเฉลยด้านล่างแล้วลองใหม่อีกครั้ง', mood: 'calm', celebrate: false },
];

export function getQuizResultState(percent: number): QuizResultConfig {
  return QUIZ_RESULT_STATES.find((s) => percent >= s.minPercent) ?? QUIZ_RESULT_STATES[QUIZ_RESULT_STATES.length - 1];
}
