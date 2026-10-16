import { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef, type ReactNode } from 'react';
import { badges } from '../data/badges';
import { COSMETICS } from '../data/cosmetics';
import { MAX_LEVEL } from '../config/levels';
import { getLevelFromXp, totalXpForLevel } from '../utils/xp';
import { checkNewBadges } from '../utils/badges';
import { AVATAR_SLOTS, getCosmetic, getCosmeticStatus, type CosmeticSlot, type OutfitTarget } from '../data/cosmetics';
import { getSpecialMissionIds } from '../utils/challenges';
import { SPECIAL_FERTILIZER } from '../config/challenges';
import { BOND_STEP, EMPTY_CARE, MAX_BOND, getCareState } from '../utils/care';
import { worldStages } from '../data/worldStages';
import { worldMissionCount } from '../utils/admin';
import type { PlayerProfile, PlayerProgress, MissionCategory, MissionProgressStatus, ImpactRecord, AdminGrant, BadgeRecord } from '../types';
import { getFactorFor } from '../data/emissionFactors';
import { CALCULATION_VERSION } from '../services/impactCalculator';
import { storageService, sanitizeProgress, TIMED_RUNS_KEPT } from '../services/storageService';
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

/** Demo-admin actions. Each one saves first; grants are stored apart from the player's own records. */
export interface AdminActions {
  grantXp: (amount: number) => boolean;
  grantLevel: (level: number) => boolean;
  grantBadge: (badgeId: string) => boolean;
  grantCosmetic: (cosmeticId: string) => boolean;
  grantAllBadges: () => boolean;
  grantAllCosmetics: () => boolean;
  grantEverything: () => boolean;
  /** Grow the virtual world to a stage (0–7). */
  grantWorldStage: (stage: number) => boolean;
  /** Give Sprouty `amount` waterings and `amount` bags of fertilizer. */
  grantCare: (amount: number) => boolean;
  /** Raise the bond with Sprouty to a level (1–10). */
  grantBond: (level: number) => boolean;
  revoke: (grantId: string) => boolean;
  revokeAll: () => boolean;
}

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
  /** Put on (or with null, take off) an item for the character, Sprouty, or both. */
  wearCosmetic: (slot: CosmeticSlot, id: string | null, target?: OutfitTarget | 'both') => WearResult;
  /** Pour today's water (needs a mission recorded today; once a day). */
  waterSprouty: () => boolean;
  /** Use one bag of fertilizer earned from missions. */
  feedSprouty: () => boolean;
  markCosmeticsSeen: (ids: string[]) => void;
  admin: AdminActions;
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

  // Another tab on this site (e.g. the separate admin page) changed the saved data: pick it up so this
  // tab doesn't overwrite it with stale in-memory state.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'ecoquest_profile') setProfile(storageService.getProfile());
      if (e.key === null || e.key === 'ecoquest_progress') setProgress(storageService.getProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
    (slot: CosmeticSlot, id: string | null, target: OutfitTarget | 'both' = 'both'): WearResult => {
      if (id !== null) {
        const item = getCosmetic(id);
        if (!item || item.slot !== slot) return 'unknown';
        if (!getCosmeticStatus(item, progress).unlocked) return 'locked';
      }
      // Pots and backgrounds are Sprouty-only.
      const toAvatar = target !== 'sprouty' && AVATAR_SLOTS.includes(slot);
      const toSprouty = target !== 'avatar';
      if (!toAvatar && !toSprouty) return 'unknown';
      const put = <T extends Record<string, string | undefined>>(o: T): T => {
        const next: Record<string, string | undefined> = { ...o };
        if (id === null) delete next[slot];
        else next[slot] = id;
        return next as T;
      };
      setProfile((prev) => {
        if (!prev) return prev;
        const prefs = prev.preferences;
        // Sprouty starts from a copy of the character's outfit the first time it is dressed on its own.
        const sproutyBase = prefs.sproutyOutfit ?? { ...(prefs.outfit ?? {}) };
        return {
          ...prev,
          preferences: {
            ...prefs,
            ...(toAvatar ? { outfit: put(prefs.outfit ?? {}) } : {}),
            ...(toSprouty ? { sproutyOutfit: put(sproutyBase) } : {}),
          },
          updatedAt: new Date().toISOString(),
        };
      });
      return 'ok';
    },
    [progress],
  );

  const waterSprouty = useCallback((): boolean => {
    if (getCareState(progress).waterLeft <= 0) return false;
    const today = getLocalDate();
    setProgress((prev) => {
      const st = getCareState(prev, today);
      const care = prev.care ?? EMPTY_CARE;
      // Today's water (from a mission) first, then extra water given by the admin.
      if (st.hasWaterToday && !st.wateredToday) return { ...prev, care: { ...care, wateredDays: [...care.wateredDays, today].sort() } };
      if (st.bonusWater > 0) return { ...prev, care: { ...care, bonusWaterUsed: (care.bonusWaterUsed ?? 0) + 1 } };
      return prev;
    });
    return true;
  }, [progress]);

  const feedSprouty = useCallback((): boolean => {
    if (getCareState(progress).fertilizer <= 0) return false;
    setProgress((prev) => {
      const care = prev.care ?? EMPTY_CARE;
      // Re-check against the latest records so a double tap can't use a bag that isn't there.
      if (getCareState(prev).fertilizer <= 0) return prev;
      return { ...prev, care: { ...care, fertilizerUsed: care.fertilizerUsed + 1 } };
    });
    return true;
  }, [progress]);

  // ---- Demo admin ----
  const commitAdmin = useCallback(
    (next: PlayerProgress): boolean => {
      // totalXp is always recomputed from records + grants, exactly as storage does on load.
      const normalized = sanitizeProgress(next);
      if (!storageService.saveProgress(normalized)) return false;
      const from = getLevelFromXp(progress.totalXp);
      const to = getLevelFromXp(normalized.totalXp);
      setProgress(normalized);
      if (to > from && prefsRef.current?.celebrations !== false) setCelebrations((c) => [...c, { id: newId(), type: 'level', level: to, from }]);
      return true;
    },
    [progress],
  );

  const admin = useMemo<AdminActions>(() => {
    const stamp = () => ({ id: createId(), at: new Date().toISOString() });
    const grants = progress.adminGrants ?? [];
    const withGrants = (extra: AdminGrant[], badgeRecords: BadgeRecord[] = []): PlayerProgress => ({
      ...progress,
      adminGrants: [...grants, ...extra],
      unlockedBadges: [...progress.unlockedBadges, ...badgeRecords],
    });
    const badgeGrant = (badgeId: string): [AdminGrant, BadgeRecord] | null => {
      if (!badges.some((b) => b.id === badgeId) || progress.unlockedBadges.some((r) => r.badgeId === badgeId)) return null;
      const st = stamp();
      return [{ ...st, kind: 'badge', badgeId }, { badgeId, unlockedAt: st.at, source: 'admin' }];
    };
    const xpTo = (level: number) => Math.max(0, totalXpForLevel(Math.min(Math.max(level, 1), MAX_LEVEL)) - progress.totalXp);

    return {
      grantXp: (amount) => {
        const n = Math.floor(amount);
        if (!(n > 0 && n <= 100000)) return false;
        return commitAdmin(withGrants([{ ...stamp(), kind: 'xp', amount: n }]));
      },
      grantLevel: (level) => {
        const n = xpTo(level);
        return n > 0 ? commitAdmin(withGrants([{ ...stamp(), kind: 'xp', amount: n }])) : false;
      },
      grantBadge: (badgeId) => {
        const g = badgeGrant(badgeId);
        return g ? commitAdmin(withGrants([g[0]], [g[1]])) : false;
      },
      grantCosmetic: (cosmeticId) => {
        if (!COSMETICS.some((c) => c.id === cosmeticId) || grants.some((g) => g.kind === 'cosmetic' && g.cosmeticId === cosmeticId)) return false;
        return commitAdmin(withGrants([{ ...stamp(), kind: 'cosmetic', cosmeticId }]));
      },
      grantAllBadges: () => {
        const extra: AdminGrant[] = [];
        const records: BadgeRecord[] = [];
        for (const b of badges) {
          const g = badgeGrant(b.id);
          if (g) {
            extra.push(g[0]);
            records.push(g[1]);
          }
        }
        return extra.length ? commitAdmin(withGrants(extra, records)) : false;
      },
      grantAllCosmetics: () => {
        const extra: AdminGrant[] = COSMETICS.filter((c) => !getCosmeticStatus(c, progress).unlocked).map((c) => ({ ...stamp(), kind: 'cosmetic', cosmeticId: c.id }));
        return extra.length ? commitAdmin(withGrants(extra)) : false;
      },
      grantEverything: () => {
        const extra: AdminGrant[] = [];
        const records: BadgeRecord[] = [];
        const n = xpTo(15);
        if (n > 0) extra.push({ ...stamp(), kind: 'xp', amount: n });
        for (const b of badges) {
          const g = badgeGrant(b.id);
          if (g) {
            extra.push(g[0]);
            records.push(g[1]);
          }
        }
        for (const c of COSMETICS) {
          if (!grants.some((g) => g.kind === 'cosmetic' && g.cosmeticId === c.id)) extra.push({ ...stamp(), kind: 'cosmetic', cosmeticId: c.id });
        }
        const worldNeed = worldStages[worldStages.length - 1].requiredMissions - worldMissionCount(progress);
        if (worldNeed > 0) extra.push({ ...stamp(), kind: 'world', missions: worldNeed });
        extra.push({ ...stamp(), kind: 'water', amount: 5 }, { ...stamp(), kind: 'fertilizer', amount: 5 });
        return extra.length ? commitAdmin(withGrants(extra, records)) : false;
      },
      grantWorldStage: (stage) => {
        const target = worldStages.find((s) => s.stage === stage);
        const need = target ? target.requiredMissions - worldMissionCount(progress) : 0;
        return need > 0 ? commitAdmin(withGrants([{ ...stamp(), kind: 'world', missions: need }])) : false;
      },
      grantCare: (amount) => {
        const n = Math.floor(amount);
        if (!(n > 0 && n <= 999)) return false;
        return commitAdmin(withGrants([{ ...stamp(), kind: 'water', amount: n }, { ...stamp(), kind: 'fertilizer', amount: n }]));
      },
      grantBond: (level) => {
        const target = Math.min(MAX_BOND, Math.max(1, Math.floor(level)));
        const need = (target - 1) * BOND_STEP - getCareState(progress).bond.points;
        return need > 0 ? commitAdmin(withGrants([{ ...stamp(), kind: 'bond', points: need }])) : false;
      },
      revoke: (grantId) => {
        const g = grants.find((x) => x.id === grantId);
        if (!g) return false;
        return commitAdmin({
          ...progress,
          adminGrants: grants.filter((x) => x.id !== grantId),
          unlockedBadges: g.kind === 'badge' ? progress.unlockedBadges.filter((r) => !(r.badgeId === g.badgeId && r.source === 'admin')) : progress.unlockedBadges,
        });
      },
      revokeAll: () =>
        commitAdmin({ ...progress, adminGrants: [], unlockedBadges: progress.unlockedBadges.filter((r) => r.source !== 'admin') }),
    };
  }, [progress, commitAdmin]);

  // Remembers which unlocked cosmetics were already announced, so each one is celebrated only once.
  const markCosmeticsSeen = useCallback((ids: string[]) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const seen = new Set(prev.preferences.seenCosmetics ?? []);
      const before = seen.size;
      ids.forEach((id) => seen.add(id));
      if (seen.size === before && prev.preferences.seenCosmetics) return prev;
      return { ...prev, preferences: { ...prev.preferences, seenCosmetics: [...seen] } };
    });
  }, []);

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
    const now = new Date();
    const special = !!profile && getSpecialMissionIds(profile.id, now).includes(missionId);
    const result = evaluateMissionCompletion(progress, missionId, now, note, special);
    if (!result.ok) return result;
    completingRef.current.add(missionId);
    if (!applyReward(result)) {
      completingRef.current.delete(missionId);
      return { ok: false, reason: 'save-failed' };
    }
    addToast(
      special ? `ภารกิจพิเศษสำเร็จ! +${result.xpAwarded} XP · ได้น้ำและปุ๋ย ${SPECIAL_FERTILIZER} ถุงให้ Sprouty` : `ภารกิจสำเร็จ! +${result.xpAwarded} XP`,
      'xp',
    );
    return { ok: true, xpAwarded: result.xpAwarded, completedAt: result.completion.completedAt };
  }, [progress, profile, applyReward, addToast]);

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
      const now = new Date();
      const run = { id: createId(), at: now.toISOString(), correct, answered };
      let next: PlayerProgress = { ...progress, timedRuns: [...(progress.timedRuns ?? []), run].slice(-TIMED_RUNS_KEPT) };
      const newBadges = checkNewBadges(next);
      if (newBadges.length) next = { ...next, unlockedBadges: [...next.unlockedBadges, ...newBadges.map((b) => ({ badgeId: b.id, unlockedAt: now.toISOString() }))] };
      if (!storageService.saveProgress(next)) return false;
      setProgress(next);
      if (newBadges.length && prefsRef.current?.celebrations !== false) {
        setCelebrations((c) => [...c, ...newBadges.map((b) => ({ id: newId(), type: 'badge' as const, badgeId: b.id }))]);
      }
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
        waterSprouty,
        feedSprouty,
        markCosmeticsSeen,
        admin,
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
