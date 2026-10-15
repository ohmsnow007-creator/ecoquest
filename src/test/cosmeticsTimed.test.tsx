import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { COSMETICS, getAllCosmeticStatuses, wearableOutfit } from '../data/cosmetics';
import { storageService, sanitizeProgress } from '../services/storageService';
import { bestTimedRun, TIMED_QUIZ_SECONDS } from '../utils/timedQuiz';
import { QuizTimed } from '../pages/QuizTimed';
import { Wardrobe } from '../components/cosmetics/Wardrobe';
import { CharacterAvatar } from '../components/avatar/CharacterAvatar';
import { SproutySeed } from '../components/illustrations/SproutySeed';
import { AVATAR_CHARACTERS } from '../data/avatars';
import { totalXpForLevel } from '../utils/xp';
import type { PlayerProgress } from '../types';

const fresh = (): PlayerProgress => storageService.getDefaultProgress();
const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '',
  preferences: { reducedMotion: true, selectedGoalIds: [], profileColor: 'mint' },
};

describe('cosmetic unlocks', () => {
  it('nothing is unlocked for a new player', () => {
    expect(getAllCosmeticStatuses(fresh()).filter((s) => s.unlocked)).toHaveLength(0);
  });

  it('unlocks come from real badges, level and weekly challenges', () => {
    const p: PlayerProgress = {
      ...fresh(),
      totalXp: totalXpForLevel(8),
      unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: '2026-10-01T00:00:00.000Z' }],
      challengeRewards: [{ id: 'w1', kind: 'weekly', periodKey: '2026-10-05', challengeId: 'week-waste', xpAwarded: 40, awardedAt: '2026-10-08T00:00:00.000Z' }],
    };
    const unlocked = getAllCosmeticStatuses(p).filter((s) => s.unlocked).map((s) => s.cosmetic.id);
    expect(unlocked.sort()).toEqual(['hat-flower-crown', 'hat-leaf-cap', 'hat-straw']);
  });

  it('a locked or misplaced item is never worn', () => {
    const p = { ...fresh(), unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: 'x' }] };
    expect(wearableOutfit({ hat: 'hat-leaf-cap', eyes: 'eyes-sun', bag: 'hat-straw' }, p)).toEqual({ hat: 'hat-leaf-cap' });
  });

  it('every item renders on every avatar and on Sprouty', () => {
    for (const c of COSMETICS) {
      for (const a of AVATAR_CHARACTERS.slice(0, 4)) {
        const { container, unmount } = render(<CharacterAvatar look={a.look} outfit={{ [c.slot]: c.id }} />);
        expect(container.querySelector('svg')).not.toBeNull();
        unmount();
      }
      const { container, unmount } = render(<SproutySeed outfit={{ [c.slot]: c.id }} />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });
});

describe('wardrobe', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    localStorage.setItem('ecoquest_progress', JSON.stringify({ ...fresh(), unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: '2026-10-01T00:00:00.000Z' }] }));
  });

  function Probe() {
    const { profile: p, wearCosmetic } = useGame();
    return (
      <>
        <p data-testid="outfit">{JSON.stringify(p?.preferences.outfit ?? {})}</p>
        <button type="button" onClick={() => (document.title = wearCosmetic('eyes', 'eyes-sun'))}>force-locked</button>
      </>
    );
  }

  it('wears an unlocked item, saves it, refuses a locked one, and takes it off', () => {
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <Wardrobe />
            <Probe />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    expect(screen.getByText('ปลดล็อกแล้ว 1/8')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /หมวกใบไม้/ }));
    expect(screen.getByTestId('outfit')).toHaveTextContent('"hat":"hat-leaf-cap"');
    expect(storageService.getProfile()?.preferences.outfit).toEqual({ hat: 'hat-leaf-cap' });

    expect(screen.getByRole('button', { name: /หมวกฟางสายลม/ })).toBeDisabled();
    fireEvent.click(screen.getByText('force-locked'));
    expect(document.title).toBe('locked');

    fireEvent.click(screen.getByRole('button', { name: /หมวกใบไม้/ }));
    expect(storageService.getProfile()?.preferences.outfit ?? {}).toEqual({});
  });
});

describe('timed quiz', () => {
  it('best run = most correct, then most accurate', () => {
    expect(bestTimedRun([])).toBeNull();
    const runs = [
      { id: 'a', at: '2026-10-01', correct: 8, answered: 12 },
      { id: 'b', at: '2026-10-02', correct: 9, answered: 15 },
      { id: 'c', at: '2026-10-03', correct: 9, answered: 10 },
    ];
    expect(bestTimedRun(runs)?.id).toBe('c');
  });

  it('storage keeps valid runs only', () => {
    const p = sanitizeProgress({ timedRuns: [{ id: 'a', at: 'x', correct: 3, answered: 5 }, { id: 'b', at: 'x', correct: 9, answered: 5 }, { id: 'c' }] });
    expect(p.timedRuns).toEqual([{ id: 'a', at: 'x', correct: 3, answered: 5 }]);
  });

  describe('page', () => {
    beforeEach(() => {
      cleanup();
      localStorage.clear();
      localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
      vi.useFakeTimers({ shouldAdvanceTime: false });
    });
    afterEach(() => vi.useRealTimers());

    it('runs for 60 s, counts answers, saves the run once and gives no XP', async () => {
      render(
        <MotionConfig reducedMotion="always">
          <MemoryRouter initialEntries={['/quiz/timed']}>
            <GameProvider>
              <Routes>
                <Route path="/quiz/timed" element={<QuizTimed />} />
              </Routes>
            </GameProvider>
          </MemoryRouter>
        </MotionConfig>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'เริ่มจับเวลา' }));
      // answer the first question with its first option
      const options = screen.getAllByRole('button').filter((b) => b.className.includes('min-h-12'));
      fireEvent.click(options[0]);
      expect(screen.getByText(/ถูก [01] \/ 1/)).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(TIMED_QUIZ_SECONDS * 1000 + 300);
      });
      expect(screen.getByRole('region', { name: 'ผลควิซจับเวลา' })).toBeInTheDocument();
      const saved = storageService.getProgress();
      expect(saved.timedRuns).toHaveLength(1);
      expect(saved.timedRuns![0].answered).toBe(1);
      expect(saved.totalXp).toBe(0);
    });
  });
});

describe('cosmetics never double up with a character’s own accessories', () => {
  const byName = (n: string) => AVATAR_CHARACTERS.find((a) => a.name === n)!;

  it('a worn hat replaces ซันนี่’s built-in cap', () => {
    const own = render(<CharacterAvatar look={byName('ซันนี่').look} />);
    expect(own.container.innerHTML).toContain('M98 78 L166 78'); // the cap's brim
    own.unmount();
    const worn = render(<CharacterAvatar look={byName('ซันนี่').look} outfit={{ hat: 'hat-leaf-cap' }} />);
    expect(worn.container.innerHTML).not.toContain('M98 78 L166 78');
    worn.unmount();
  });

  it('worn glasses replace built-in glasses (มีน, ลีโอ)', () => {
    for (const n of ['มีน', 'ลีโอ']) {
      const own = render(<CharacterAvatar look={byName(n).look} />);
      expect(own.container.querySelectorAll('circle[r="11"]').length).toBe(2);
      own.unmount();
      const worn = render(<CharacterAvatar look={byName(n).look} outfit={{ eyes: 'eyes-round' }} />);
      expect(worn.container.querySelectorAll('circle[r="11"]').length).toBe(0);
      worn.unmount();
    }
  });
});
