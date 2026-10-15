import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { PlayerProfile, PlayerProgress, MissionCompletion, BadgeRecord, MissionCategory, QuizCompletion } from '../types';
import { storageService } from '../services/storageService';
import { missions } from '../data/missions';
import { checkNewBadges } from '../utils/badges';
import { getLocalDate } from '../utils/streak';
import { getLevelFromXp } from '../utils/xp';

export interface Toast {
  id: string;
  message: string;
  type: 'xp' | 'badge' | 'level' | 'info' | 'error';
}

export type Celebration =
  | { id: string; type: 'level'; level: number }
  | { id: string; type: 'badge'; badgeId: string };

interface GameState {
  profile: PlayerProfile | null;
  progress: PlayerProgress;
  toasts: Toast[];
  celebrations: Celebration[];
}

interface GameActions {
  createProfile: (name: string, avatarId: string, goalIds?: string[]) => boolean;
  updateProfile: (name: string, avatarId: string) => void;
  setReducedMotion: (value: boolean) => void;
  completeMission: (missionId: string, note?: string) => boolean;
  canCompleteMission: (missionId: string) => boolean;
  getMissionStatus: (missionId: string) => 'available' | 'completed-today' | 'completed-once';
  completeQuiz: (quizId: string, correct: boolean, xp: number) => void;
  isQuizCompleted: (quizId: string) => boolean;
  resetAll: () => void;
  dismissToast: (id: string) => void;
  dismissCelebration: () => void;
  getCompletionsByCategory: () => Record<MissionCategory, number>;
  getTodayCompletionCount: () => number;
}

const GameContext = createContext<(GameState & GameActions) | null>(null);

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => storageService.getProfile());
  const [progress, setProgress] = useState<PlayerProgress>(() => storageService.getProgress());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);

  useEffect(() => {
    if (profile) storageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storageService.saveProgress(progress);
  }, [progress]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = newId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrations((prev) => prev.slice(1));
  }, []);

  // Applies an XP gain, records newly unlocked badges and queues level-up / badge celebrations.
  const commitProgress = useCallback((prev: PlayerProgress, next: PlayerProgress) => {
    const newBadges = checkNewBadges(next);
    const now = new Date().toISOString();
    if (newBadges.length > 0) {
      const records: BadgeRecord[] = newBadges.map((b) => ({ badgeId: b.id, unlockedAt: now }));
      next = { ...next, unlockedBadges: [...next.unlockedBadges, ...records] };
    }
    setProgress(next);

    const queued: Celebration[] = [];
    const prevLevel = getLevelFromXp(prev.totalXp);
    const nextLevel = getLevelFromXp(next.totalXp);
    if (nextLevel > prevLevel) queued.push({ id: newId(), type: 'level', level: nextLevel });
    for (const b of newBadges) queued.push({ id: newId(), type: 'badge', badgeId: b.id });
    if (queued.length > 0) setCelebrations((c) => [...c, ...queued]);
  }, []);

  const createProfile = useCallback((name: string, avatarId: string, goalIds: string[] = []): boolean => {
    const now = new Date().toISOString();
    const next: PlayerProfile = {
      id: crypto.randomUUID(),
      displayName: name,
      avatarId,
      createdAt: now,
      updatedAt: now,
      preferences: { reducedMotion: false, selectedGoalIds: goalIds },
    };
    if (!storageService.saveProfile(next)) return false;
    setProfile(next);
    return true;
  }, []);

  const updateProfile = useCallback((name: string, avatarId: string) => {
    setProfile((prev) => (prev ? { ...prev, displayName: name, avatarId, updatedAt: new Date().toISOString() } : prev));
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setProfile((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, reducedMotion: value }, updatedAt: new Date().toISOString() } : prev,
    );
  }, []);

  const canCompleteMission = useCallback((missionId: string): boolean => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.active) return false;
    if (mission.repeatPolicy === 'once') {
      return !progress.completions.some((c) => c.missionId === missionId);
    }
    const today = getLocalDate();
    return !progress.completions.some((c) => c.missionId === missionId && c.localDate === today);
  }, [progress.completions]);

  const getMissionStatus = useCallback((missionId: string): 'available' | 'completed-today' | 'completed-once' => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return 'available';
    if (mission.repeatPolicy === 'once') {
      return progress.completions.some((c) => c.missionId === missionId) ? 'completed-once' : 'available';
    }
    const today = getLocalDate();
    return progress.completions.some((c) => c.missionId === missionId && c.localDate === today)
      ? 'completed-today'
      : 'available';
  }, [progress.completions]);

  const completeMission = useCallback((missionId: string, note?: string): boolean => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.active || !canCompleteMission(missionId)) return false;

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

    commitProgress(progress, {
      ...progress,
      totalXp: progress.totalXp + mission.xp,
      completions: [...progress.completions, completion],
    });
    addToast(`+${mission.xp} XP`, 'xp');
    return true;
  }, [progress, canCompleteMission, commitProgress, addToast]);

  const completeQuiz = useCallback((quizId: string, correct: boolean, xp: number) => {
    if ((progress.quizCompletions ?? []).some((q) => q.quizId === quizId)) return;

    const record: QuizCompletion = {
      quizId,
      completedAt: new Date().toISOString(),
      correct,
      xpAwarded: correct ? xp : 0,
    };

    commitProgress(progress, {
      ...progress,
      totalXp: progress.totalXp + (correct ? xp : 0),
      quizCompletions: [...(progress.quizCompletions ?? []), record],
    });
    if (correct) addToast(`+${xp} XP จากควิซ`, 'xp');
  }, [progress, commitProgress, addToast]);

  const isQuizCompleted = useCallback((quizId: string): boolean => {
    return (progress.quizCompletions ?? []).some((q) => q.quizId === quizId);
  }, [progress.quizCompletions]);

  const resetAll = useCallback(() => {
    storageService.resetAll();
    setProfile(null);
    setCelebrations([]);
    setProgress({ totalXp: 0, completions: [], unlockedBadges: [], quizCompletions: [], schemaVersion: 1 });
  }, []);

  const getCompletionsByCategory = useCallback((): Record<MissionCategory, number> => {
    const counts: Record<MissionCategory, number> = { waste: 0, energy: 0, water: 0, transport: 0, consumption: 0, nature: 0 };
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
        celebrations,
        createProfile,
        updateProfile,
        setReducedMotion,
        completeMission,
        canCompleteMission,
        getMissionStatus,
        completeQuiz,
        isQuizCompleted,
        resetAll,
        dismissToast,
        dismissCelebration,
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
