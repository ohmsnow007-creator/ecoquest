import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from 'react';
import { getCosmetic, getCosmeticStatus, type CosmeticSlot } from '../data/cosmetics';
import type { PlayerProfile, PlayerProgress, MissionCategory, MissionProgressStatus, ImpactRecord } from '../types';
import { getFactorFor } from '../data/emissionFactors';
import { CALCULATION_VERSION } from '../services/impactCalculator';
import { storageService, TIMED_RUNS_KEPT } from '../services/storageService';
import { missions } from '../data/missions';
import { evaluateChallengeClaim, evaluateMissionCompletion, evaluateQuizAttempt, type ChallengeRejection, type RewardOutcome, type MissionRejection, type QuizDraft } from '../services/rewardService';
import { getLocalDate } from '../utils/streak';
import { createId } from '../utils/id';
import { playSound } from '../services/soundService';

export interface Toast {
  id: string;
  message: string;
  type: 'xp' | 'badge' | 'level' | 'info' | 'error';
}

export type Celebration =
  | { id: string; type: 'level'; level: number; from: number }
  | { id: string; type: 'badge'; badgeId: string };

export interface NewProfileInput {
  name: string;
  avatarId: string;
  goalIds?: string[];
  profileColor?: string;
}

export type NewImpactRecord = Pick<ImpactRecord, 'activityType' | 'quantity' | 'unit' | 'date' | 'wasteType'>;

export type ClaimChallengeResult = { ok: true; xpAwarded: number } | { ok: false; reason: ChallengeRejection | 'save-failed' | 'no-profile' };
export type SubmitQuizResult = { ok: true; attemptId: string; xpAwarded: number } | { ok: false; reason: 'duplicate' | 'invalid' | 'save-failed' };

export type BooleanPreference = 'reducedMotion' | 'soundEffects' | 'inAppToasts' | 'celebrations';

export type CreateProfileResult = 'ok' | 'exists' | 'save-failed';

export type CompleteMissionResult =
  | { ok: true; xpAwarded: number; completedAt: string }
  | { ok: false; reason: MissionRejection | 'save-failed' | 'busy' };

export interface ProfileChanges {
  name?: string;
  avatarId?: string;
  profileColor?: string;
  goalIds?: string[];
}

export type WearResult = 'ok' | 'locked' | 'unknown';

interface GameState {
  profile: PlayerProfile | null;
  progress: PlayerProgress;
  toasts: Toast[];
  celebrations: Celebration[];
}

interface GameActions {
  createProfile: (input: NewProfileInput) => CreateProfileResult;
  updateProfile: (changes: ProfileChanges) => void;
  setReducedMotion: (value: boolean) => void;
  setPreference: (key: BooleanPreference, value: boolean) => void;
  wearCosmetic: (slot: CosmeticSlot, id: string | null) => WearResult;
  resetProgress: () => boolean;
  completeMission: (missionId: string, note?: string) => CompleteMissionResult;
  canCompleteMission: (missionId: string) => boolean;
  getMissionStatus: (missionId: string) => MissionProgressStatus;
  startMission: (missionId: string) => void;
  toggleMissionStep: (missionId: string, stepIndex: number) => void;
  getCompletedSteps: (missionId: string) => number[];
  submitQuizAttempt: (draft: QuizDraft) => SubmitQuizResult;
  claimChallenge: (kind: 'daily' | 'weekly') => ClaimChallengeResult;
  saveTimedRun: (correct: number, answered: number) => boolean;
  resetAll: () => void;
  dismissToast: (id: string) => void;
  notify: (message: string, type?: Toast['type']) => void;
  addImpactRecord: (input: NewImpactRecord) => boolean;
  deleteImpactRecord: (id: string) => boolean;
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

  // Read inside stable callbacks so preference changes apply immediately.
  const prefsRef = useRef(profile?.preferences);
  useEffect(() => {
    prefsRef.current = profile?.preferences;
  }, [profile]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    if (type !== 'error' && prefsRef.current?.inAppToasts === false) return;
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

  // Persists a reward outcome before showing it: if saving fails, no XP, badge or level change is applied.
  const applyReward = useCallback((outcome: RewardOutcome): boolean => {
    if (!storageService.saveProgress(outcome.next)) return false;
    setProgress(outcome.next);
    if (prefsRef.current?.soundEffects) playSound(outcome.levelTo > outcome.levelFrom || outcome.newBadges.length > 0 ? 'reward' : 'success');
    if (prefsRef.current?.celebrations === false) return true;
    const queued: Celebration[] = [];
    if (outcome.levelTo > outcome.levelFrom) queued.push({ id: newId(), type: 'level', level: outcome.levelTo, from: outcome.levelFrom });
    for (const b of outcome.newBadges) queued.push({ id: newId(), type: 'badge', badgeId: b.id });
    if (queued.length > 0) setCelebrations((c) => [...c, ...queued]);
    return true;
  }, []);

  // Local demo mode allows exactly one profile, and a new profile always starts from empty progress.
  const createProfile = useCallback((input: NewProfileInput): CreateProfileResult => {
    if (profile || storageService.getProfile()) return 'exists';
    const now = new Date().toISOString();
    const next: PlayerProfile = {
      id: createId(),
      displayName: input.name,
      avatarId: input.avatarId,
      createdAt: now,
      updatedAt: now,
      preferences: {
        reducedMotion: false,
        selectedGoalIds: input.goalIds ?? [],
        profileColor: input.profileColor,
      },
    };
    const fresh = storageService.getDefaultProgress();
    if (!storageService.saveProfile(next) || !storageService.saveProgress(fresh)) {
      storageService.resetAll();
      return 'save-failed';
    }
    setProgress(fresh);
    setProfile(next);
    return 'ok';
  }, [profile]);

  const updateProfile = useCallback((changes: ProfileChanges) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            displayName: changes.name ?? prev.displayName,
            avatarId: changes.avatarId ?? prev.avatarId,
            preferences: {
              ...prev.preferences,
              ...(changes.profileColor ? { profileColor: changes.profileColor } : {}),
              ...(changes.goalIds ? { selectedGoalIds: changes.goalIds } : {}),
            },
            updatedAt: new Date().toISOString(),
          }
        : prev,
    );
  }, []);

  // Equip (or with null, take off) a cosmetic. Locked items are refused here, not only hidden in the UI.
  const wearCosmetic = useCallback(
    (slot: CosmeticSlot, id: string | null): WearResult => {
      if (id !== null) {
        const item = getCosmetic(id);
        if (!item || item.slot !== slot) return 'unknown';
        if (!getCosmeticStatus(item, progress).unlocked) return 'locked';
      }
      setProfile((prev) => {
        if (!prev) return prev;
        const outfit = { ...(prev.preferences.outfit ?? {}) };
        if (id === null) delete outfit[slot];
        else outfit[slot] = id;
        return { ...prev, preferences: { ...prev.preferences, outfit }, updatedAt: new Date().toISOString() };
      });
      return 'ok';
    },
    [progress],
  );

  const setPreference = useCallback((key: BooleanPreference, value: boolean) => {
    setProfile((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, [key]: value }, updatedAt: new Date().toISOString() } : prev,
    );
  }, []);

  // Clears game progress but keeps the profile.
  const resetProgress = useCallback((): boolean => {
    const fresh = storageService.getDefaultProgress();
    if (!storageService.saveProgress(fresh)) return false;
    storageService.setInboxSeenAt(new Date().toISOString());
    setCelebrations([]);
    setProgress(fresh);
    return true;
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

  const getMissionStatus = useCallback((missionId: string): MissionProgressStatus => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return 'available';
    if (mission.repeatPolicy === 'once' && progress.completions.some((c) => c.missionId === missionId)) return 'completed-once';
    const today = getLocalDate();
    if (mission.repeatPolicy === 'daily' && progress.completions.some((c) => c.missionId === missionId && c.localDate === today)) return 'completed-today';
    return progress.inProgress.some((s) => s.missionId === missionId) ? 'in-progress' : 'available';
  }, [progress.completions, progress.inProgress]);

  const startMission = useCallback((missionId: string) => {
    if (!canCompleteMission(missionId) || progress.inProgress.some((s) => s.missionId === missionId)) return;
    setProgress((prev) =>
      prev.inProgress.some((s) => s.missionId === missionId)
        ? prev
        : { ...prev, inProgress: [...prev.inProgress, { missionId, startedAt: new Date().toISOString(), completedSteps: [] }] },
    );
    const title = missions.find((m) => m.id === missionId)?.title;
    addToast(title ? `เริ่มภารกิจ "${title}" แล้ว` : 'เริ่มภารกิจแล้ว', 'info');
  }, [canCompleteMission, progress.inProgress, addToast]);

  const toggleMissionStep = useCallback((missionId: string, stepIndex: number) => {
    setProgress((prev) => ({
      ...prev,
      inProgress: prev.inProgress.map((s) =>
        s.missionId !== missionId
          ? s
          : {
              ...s,
              completedSteps: s.completedSteps.includes(stepIndex)
                ? s.completedSteps.filter((i) => i !== stepIndex)
                : [...s.completedSteps, stepIndex].sort((a, b) => a - b),
            },
      ),
    }));
  }, []);

  const getCompletedSteps = useCallback(
    (missionId: string) => progress.inProgress.find((s) => s.missionId === missionId)?.completedSteps ?? [],
    [progress.inProgress],
  );

  // Rejects a second completion of the same mission before the first one has re-rendered (e.g. a double tap).
  const completingRef = useRef(new Set<string>());
  useEffect(() => {
    completingRef.current.clear();
  }, [progress]);

  const completeMission = useCallback((missionId: string, note?: string): CompleteMissionResult => {
    if (completingRef.current.has(missionId)) return { ok: false, reason: 'busy' };
    const result = evaluateMissionCompletion(progress, missionId, new Date(), note);
    if (!result.ok) return result;
    completingRef.current.add(missionId);
    if (!applyReward(result)) {
      completingRef.current.delete(missionId);
      return { ok: false, reason: 'save-failed' };
    }
    addToast(`ภารกิจสำเร็จ! +${result.xpAwarded} XP`, 'xp');
    return { ok: true, xpAwarded: result.xpAwarded, completedAt: result.completion.completedAt };
  }, [progress, applyReward, addToast]);

  // Bonus for today's daily missions or this week's challenge: checked against stored records, paid once per period.
  const claimChallenge = useCallback(
    (kind: 'daily' | 'weekly'): ClaimChallengeResult => {
      if (!profile) return { ok: false, reason: 'no-profile' };
      const key = `challenge:${kind}`;
      if (completingRef.current.has(key)) return { ok: false, reason: 'already-claimed' };
      const result = evaluateChallengeClaim(progress, kind, profile.id, new Date());
      if (!result.ok) return result;
      completingRef.current.add(key);
      const saved = applyReward(result);
      completingRef.current.delete(key);
      if (!saved) return { ok: false, reason: 'save-failed' };
      addToast(`${kind === 'daily' ? 'โบนัสภารกิจประจำวัน' : 'โบนัสชาเลนจ์ประจำสัปดาห์'} +${result.xpAwarded} XP`, 'xp');
      return { ok: true, xpAwarded: result.xpAwarded };
    },
    [profile, progress, applyReward, addToast],
  );

  // Timed quiz: store the result for personal bests. No XP, so it cannot be farmed.
  const saveTimedRun = useCallback(
    (correct: number, answered: number): boolean => {
      const run = { id: createId(), at: new Date().toISOString(), correct, answered };
      const next: PlayerProgress = { ...progress, timedRuns: [...(progress.timedRuns ?? []), run].slice(-TIMED_RUNS_KEPT) };
      if (!storageService.saveProgress(next)) return false;
      setProgress(next);
      return true;
    },
    [progress],
  );

  // Grades, rewards and saves a quiz once; the same attempt id is rejected if submitted again.
  const submitQuizAttempt = useCallback((draft: QuizDraft): SubmitQuizResult => {
    if (completingRef.current.has(draft.id)) return { ok: false, reason: 'duplicate' };
    const result = evaluateQuizAttempt(progress, draft, new Date());
    if (!result.ok) return result;
    completingRef.current.add(draft.id);
    if (!applyReward(result)) {
      completingRef.current.delete(draft.id);
      return { ok: false, reason: 'save-failed' };
    }
    if (result.xpAwarded > 0) addToast(`+${result.xpAwarded} XP จากควิซ`, 'xp');
    return { ok: true, attemptId: result.attempt.id, xpAwarded: result.xpAwarded };
  }, [progress, applyReward, addToast]);

  // Saved before it is shown, like rewards; entering quantities never awards XP.
  const addImpactRecord = useCallback((input: NewImpactRecord): boolean => {
    const record: ImpactRecord = {
      id: createId(),
      ...input,
      ...(input.activityType === 'waste-sorted' ? {} : { wasteType: undefined }),
      emissionFactorId: getFactorFor(input.activityType)?.id,
      source: 'user-entered',
      calculationVersion: CALCULATION_VERSION,
      createdAt: new Date().toISOString(),
    };
    const next = { ...progress, impactRecords: [...progress.impactRecords, record] };
    if (!storageService.saveProgress(next)) return false;
    setProgress(next);
    return true;
  }, [progress]);

  const deleteImpactRecord = useCallback((id: string): boolean => {
    const next = { ...progress, impactRecords: progress.impactRecords.filter((r) => r.id !== id) };
    if (!storageService.saveProgress(next)) return false;
    setProgress(next);
    return true;
  }, [progress]);


  const resetAll = useCallback(() => {
    storageService.resetAll();
    setProfile(null);
    setCelebrations([]);
    setProgress(storageService.getDefaultProgress());
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
        setPreference,
        wearCosmetic,
        resetProgress,
        completeMission,
        canCompleteMission,
        getMissionStatus,
        startMission,
        toggleMissionStep,
        getCompletedSteps,
        submitQuizAttempt,
        claimChallenge,
        saveTimedRun,
        resetAll,
        dismissToast,
        notify: addToast,
        addImpactRecord,
        deleteImpactRecord,
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
