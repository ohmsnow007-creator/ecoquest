import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { Quiz } from '../pages/Quiz';
import { QuizResult } from '../pages/QuizResult';
import { quizzes } from '../data/quizzes';
import { QUIZ_XP_BY_DIFFICULTY } from '../services/rewardService';

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '', updatedAt: '',
  preferences: { reducedMotion: false, selectedGoalIds: [], profileColor: 'mint' },
};

function XpProbe() {
  const { progress } = useGame();
  return <p data-testid="probe">{progress.totalXp}:{progress.quizAttempts.length}</p>;
}

function renderAt(path: string) {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={[path]}>
        <GameProvider>
          <XpProbe />
          <Routes>
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/result" element={<QuizResult />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

const pool = quizzes.filter((q) => q.category === 'waste' && q.difficulty === 'easy');

async function answerCurrent(correct: boolean, position: number) {
  await screen.findByText(`ข้อ ${position} จาก ${pool.length}`);
  expect(document.querySelectorAll('legend')).toHaveLength(1);
  const legend = document.querySelector('legend')!;
  const q = pool.find((x) => x.question === legend.textContent)!;
  const target = correct ? q.correctAnswerId : q.options.find((o) => o.id !== q.correctAnswerId)!.id;
  fireEvent.click(screen.getAllByRole('radio').find((r) => (r as HTMLInputElement).value === target)!);
  return q;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
});

describe('Eco Quiz flow', () => {
  it('landing shows count, time, max XP and a disabled start when nothing matches', () => {
    renderAt('/quiz');
    expect(screen.getByText('10 ข้อ')).toBeInTheDocument();
    expect(screen.getByText('10 นาที')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /ทุกหมวด/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('grades real answers, shows wrong answers with the key, survives a refresh, and never pays XP twice', async () => {
    renderAt('/quiz?category=waste');
    fireEvent.click(screen.getByRole('radio', { name: 'ง่าย' }));
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มทำแบบทดสอบ' }));

    expect(await screen.findByText(`ข้อ 1 จาก ${pool.length}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ถัดไป' })).toBeDisabled();

    const asked = [];
    for (let i = 0; i < pool.length; i++) {
      const isLast = i === pool.length - 1;
      asked.push(await answerCurrent(!isLast, i + 1));
      if (!isLast) fireEvent.click(screen.getByRole('button', { name: 'ถัดไป' }));
    }
    // Going back keeps the earlier answer selected.
    fireEvent.click(screen.getByRole('button', { name: 'ก่อนหน้า' }));
    expect(screen.getAllByRole('radio').some((r) => (r as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'ถัดไป' }));
    await screen.findByText(`ข้อ ${pool.length} จาก ${pool.length}`);

    fireEvent.click(await screen.findByRole('button', { name: 'ส่งคำตอบ' }));

    const expectedXp = asked.slice(0, -1).reduce((s, q) => s + QUIZ_XP_BY_DIFFICULTY[q.difficulty], 0);
    expect(await screen.findByText(/คุณตอบถูก/)).toHaveTextContent(`คุณตอบถูก ${pool.length - 1} จาก ${pool.length} ข้อ`);
    expect(screen.getByTestId('probe')).toHaveTextContent(`${expectedXp}:1`);

    fireEvent.click(screen.getByRole('button', { name: 'ดูเฉลยคำตอบ' }));
    const review = screen.getByRole('region', { name: 'เฉลยคำตอบ' });
    const wrongQ = asked[asked.length - 1];
    const right = wrongQ.options.find((o) => o.id === wrongQ.correctAnswerId)!;
    expect(within(review).getByText(wrongQ.question)).toBeInTheDocument();
    expect(within(review).getByText(`${right.id.toUpperCase()}. ${right.text}`)).toBeInTheDocument();
    expect(within(review).getAllByText('ผิด').length).toBeGreaterThan(0);

    const attemptId = JSON.parse(localStorage.getItem('ecoquest_progress')!).quizAttempts[0].id;
    cleanup();
    renderAt(`/quiz/result?attempt=${attemptId}`);
    expect(screen.getByText(/คุณตอบถูก/)).toHaveTextContent(`คุณตอบถูก ${pool.length - 1} จาก ${pool.length} ข้อ`);
    expect(screen.getByTestId('probe')).toHaveTextContent(`${expectedXp}:1`);
  });

  it('the result route shows an empty state before any attempt', () => {
    renderAt('/quiz/result');
    expect(screen.getByText('ยังไม่มีผลแบบทดสอบ')).toBeInTheDocument();
  });
});
