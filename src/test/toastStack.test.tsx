import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, MAX_TOASTS, useGame } from '../store/GameContext';
import { ToastNotification } from '../components/feedback/Toast';

function Buttons() {
  const { notify, toasts } = useGame();
  return (
    <>
      <output data-testid="toasts">{toasts.map((t) => t.message).join('|')}</output>
      <button onClick={() => notify('รดน้ำให้ Sprouty แล้ว · ความผูกพัน +10', 'info')}>water</button>
      <button onClick={() => notify('ใส่ปุ๋ยให้ Sprouty แล้ว · ความผูกพัน +15', 'info')}>feed</button>
      {[1, 2, 3, 4].map((n) => (
        <button key={n} onClick={() => notify(`ข้อความ ${n}`, 'info')}>{`other-${n}`}</button>
      ))}
    </>
  );
}

const renderIt = () =>
  render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter>
        <GameProvider>
          <Buttons />
          <ToastNotification />
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );

describe('notices do not pile up', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('watering and feeding again and again shows one notice each with ×count', () => {
    renderIt();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByText('water'));
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByText('feed'));
    expect(screen.getByTestId('toasts').textContent).toBe('รดน้ำให้ Sprouty แล้ว · ความผูกพัน +10|ใส่ปุ๋ยให้ Sprouty แล้ว · ความผูกพัน +15');
    expect(screen.getByText('×4')).toBeInTheDocument();
    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it(`never shows more than ${MAX_TOASTS} at once; the newest stay`, () => {
    renderIt();
    for (const n of [1, 2, 3, 4]) fireEvent.click(screen.getByText(`other-${n}`));
    // (a notice that just left may still be fading out on screen; the list itself is capped)
    expect(screen.getByTestId('toasts').textContent).toBe('ข้อความ 2|ข้อความ 3|ข้อความ 4');
  });
});
