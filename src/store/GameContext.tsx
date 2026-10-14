import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { PlayerProfile, PlayerProgress, MissionCompletion, BadgeRecord, Badge, MissionCategory, QuizCompletion } from '../types';
import { storageService } from '../services/storageService';
import { missions } from '../data/missions';
import { checkNewBadges } from '../utils/badges';
import { getLocalDate } from '../utils/streak';

interface Toast {
  id: string;
  message: string;
  type: 'xp' | 'badge' | 'level' | 'info' | 'error';
}

interface GameState {
  profile: PlayerProfile | null;
  progress: PlayerProgress;
  toasts: Toast[];
}

interface GameActions {
  createProfile: (name: string, avatarId: string, goalIds?: string[]) => void;
  updateProfile: (name: string, avatarId: string) => void;
  completeMission: (missionId: string, note?: string) => boolean;
  canCompleteMission: (missionId: string) => boolean;
  getMissionStatus: (missionId: string) => 'available' | 'completed-today' | 'completed-once';
  completeQuiz: (quizId: string, correct: boolean, xp: number) => void;
  isQuizCompleted: (quizId: string) => boolean;
  resetAll: () => void;
  dismissToast: (id: string) => void;
  getCompletionsByCategory: () => Record<MissionCategory, number>;
  getTodayCompletionCount: () => number;
}

const GameContext = createContext<(GameState & GameActions) | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => storageService.getProfile());
  const [progress, setProgress] = useState<PlayerProgress>(() => storageService.getProgress());
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (profile) storageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storageService.saveProgress(progress);
  }, [progress]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const createProfile = useCallback((name: string, avatarId: string, goalIds: string[] = []) => {
    const now = new Date().toISOString();
    const newProfile: PlayerProfile = {
      id: crypto.randomUUID(),
      displayName: name,
      avatarId,
      createdAt: now,
      updatedAt: now,
      preferences: { reducedMotion: false, selectedGoalIds: goalIds },
    };
    setProfile(newProfile);
  }, []);

  const updateProfile = useCallback((name: string, avatarId: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, displayName: name, avatarId, updatedAt: new Date().toISOString() };
    });
  }, []);

  const canCompleteMission = useCallback((missionId: string): boolean => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.active) return false;

    const today = getLocalDate();

    if (mission.repeatPolicy === 'once') {
      return !progress.completions.some((c) => c.missionId === missionId);
    }

    if (mission.repeatPolicy === 'daily') {
      return !progress.completions.some(
        (c) => c.missionId === missionId && c.localDate === today
      );
    }

    return false;
  }, [progress.completions]);

  const getMissionStatus = useCallback((missionId: string): 'available' | 'completed-today' | 'completed-once' => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return 'available';

    const today = getLocalDate();

    if (mission.repeatPolicy === 'once') {
      return progress.completions.some((c) => c.missionId === missionId)
        ? 'completed-once'
        : 'available';
    }

    return progress.completions.some(
      (c) => c.missionId === missionId && c.localDate === today
    )
      ? 'completed-today'
      : 'available';
  }, [progress.completions]);

  const completeMission = useCallback((missionId: string, note?: string): boolean => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.active) return false;

    if (!canCompleteMission(missionId)) return false;

    const now = new Date();
    const completion: MissionCompletion = {
      id: crypto.randomUUID(),
      missionId,
      completedAt: now.toISOString(),
      localDate: getLocalDate(now),
      xpAwarded: mission.xp,
      completionType: mission.type,
      note,
    };

    setProgress((prev) => {
      const updated: PlayerProgress = {
        ...prev,
        totalXp: prev.totalXp + mission.xp,
        completions: [...prev.completions, completion],
      };

      const newBadges = checkNewBadges(updated);
      if (newBadges.length > 0) {
        const newRecords: BadgeRecord[] = newBadges.map((b) => ({
          badgeId: b.id,
          unlockedAt: now.toISOString(),
        }));
        updated.unlockedBadges = [...prev.unlockedBadges, ...newRecords];

        setTimeout(() => {
          newBadges.forEach((b: Badge) => {
            addToast(`ปลดล็อก Badge: ${b.title}!`, 'badge');
          });
        }, 500);
      }

      return updated;
    });

    addToast(`+${mission.xp} XP`, 'xp');
    return true;
  }, [canCompleteMission, addToast]);

  const completeQuiz = useCallback((quizId: string, correct: boolean, xp: number) => {
    if (progress.quizCompletions?.some((q) => q.quizId === quizId)) return;

    const record: QuizCompletion = {
      quizId,
      completedAt: new Date().toISOString(),
      correct,
      xpAwarded: correct ? xp : 0,
    };

    setProgress((prev) => {
      const updated: PlayerProgress = {
        ...prev,
        totalXp: prev.totalXp + (correct ? xp : 0),
        quizCompletions: [...(prev.quizCompletions || []), record],
      };

      const newBadges = checkNewBadges(updated);
      if (newBadges.length > 0) {
        const newRecords: BadgeRecord[] = newBadges.map((b) => ({
          badgeId: b.id,
          unlockedAt: new Date().toISOString(),
        }));
        updated.unlockedBadges = [...prev.unlockedBadges, ...newRecords];
        setTimeout(() => {
          newBadges.forEach((b: Badge) => addToast(`ปลดล็อก Badge: ${b.title}!`, 'badge'));
        }, 500);
      }

      return updated;
    });

    if (correct) addToast(`+${xp} XP จากควิซ!`, 'xp');
    else addToast('ตอบผิด ลองใหม่ได้ในครั้งหน้า', 'info');
  }, [progress.quizCompletions, addToast]);

  const isQuizCompleted = useCallback((quizId: string): boolean => {
    return (progress.quizCompletions || []).some((q) => q.quizId === quizId);
  }, [progress.quizCompletions]);

  const resetAll = useCallback(() => {
    storageService.resetAll();
    setProfile(null);
    setProgress({
      totalXp: 0,
      completions: [],
      unlockedBadges: [],
      quizCompletions: [],
      schemaVersion: 1,
    });
  }, []);

  const getCompletionsByCategory = useCallback((): Record<MissionCategory, number> => {
    const counts: Record<MissionCategory, number> = {
      waste: 0, energy: 0, water: 0, transport: 0, consumption: 0, nature: 0,
    };
    for (const completion of progress.completions) {
      const mission = missions.find((m) => m.id === completion.missionId);
      if (mission) counts[mission.category]++;
    }
    return counts;
  }, [progress.completions]);

  const getTodayCompletionCount = useCallback((): number => {
    const today = getLocalDate();
    return progress.completions.filter((c) => c.localDate === today).length;
  }, [progress.completions]);

  return (
    <GameContext.Provider
      value={{
        profile,
        progress,
        toasts,
        createProfile,
        updateProfile,
        completeMission,
        canCompleteMission,
        getMissionStatus,
        completeQuiz,
        isQuizCompleted,
        resetAll,
        dismissToast,
        getCompletionsByCategory,
        getTodayCompletionCount,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
