export type MissionCategory =
  | 'waste'
  | 'energy'
  | 'water'
  | 'transport'
  | 'consumption'
  | 'nature';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';
export type MissionType = 'educational' | 'simulation' | 'self-reported';
export type RepeatPolicy = 'once' | 'daily';
export type MissionStatus = 'available' | 'in-progress' | 'completed';

export type ImpactType =
  | 'waste-reduction'
  | 'energy-saving'
  | 'water-saving'
  | 'emission-reduction'
  | 'resource-saving'
  | 'biodiversity'
  | 'awareness';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  estimatedMinutes: number;
  type: MissionType;
  repeatPolicy: RepeatPolicy;
  active: boolean;
  steps: string[];
  environmentalExplanation: string;
  impactType: ImpactType;
  /** Set only when a sourced impact factor exists for this mission (used by Green Impact). */
  impactFactorId?: string;
  /** Required whenever the explanation or steps state a statistic. */
  sources?: { name: string; url?: string }[];
}

export interface MissionCompletion {
  id: string;
  missionId: string;
  completedAt: string;
  localDate: string;
  xpAwarded: number;
  completionType: MissionType;
  note?: string;
  /** Completed as one of that day's special daily missions (bonus XP and fertilizer included). */
  special?: boolean;
}

export interface BadgeRecord {
  badgeId: string;
  unlockedAt: string;
  /** Set when a demo admin granted the badge instead of the player earning it. */
  source?: 'admin';
}

/** Something a demo admin added on this device. Always shown as "สาธิต" and kept out of real stats. */
export type AdminGrant =
  | { id: string; at: string; kind: 'xp'; amount: number }
  | { id: string; at: string; kind: 'badge'; badgeId: string }
  | { id: string; at: string; kind: 'cosmetic'; cosmeticId: string }
  /** Counts toward the virtual world's growth (as if that many missions were done), nothing else. */
  | { id: string; at: string; kind: 'world'; missions: number }
  /** Extra waterings / fertilizer bags for Sprouty, and direct bond points. */
  | { id: string; at: string; kind: 'water'; amount: number }
  | { id: string; at: string; kind: 'fertilizer'; amount: number }
  | { id: string; at: string; kind: 'bond'; points: number };

/** One 60-second timed quiz run. Timed mode gives no XP; it only keeps the player's best. */
export interface TimedQuizRun {
  id: string;
  at: string;
  correct: number;
  answered: number;
}

/** Bonus XP for finishing the daily missions or the weekly challenge; at most one per kind and period. */
export interface ChallengeReward {
  id: string;
  kind: 'daily' | 'weekly';
  /** Local date (daily) or the week's Monday (weekly), YYYY-MM-DD. */
  periodKey: string;
  challengeId: string;
  xpAwarded: number;
  awardedAt: string;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  avatarId: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    reducedMotion: boolean;
    selectedGoalIds: string[];
    profileColor?: string;
    soundEffects?: boolean;
    /** Set once the player flips the sound switch themself; until then sound effects are on by default. */
    soundChosen?: boolean;
    inAppToasts?: boolean;
    celebrations?: boolean;
    /** The character's equipped cosmetics (hat, eyes, bag); only unlocked items are worn. */
    outfit?: Partial<Record<'hat' | 'eyes' | 'bag' | 'frame', string>>;
    /** Sprouty's own outfit (also pot and background). Until first set, Sprouty mirrors `outfit`. */
    sproutyOutfit?: Partial<Record<'hat' | 'eyes' | 'bag' | 'pot' | 'background', string>>;
    /** Cosmetics the player has already been shown as "new"; undefined until first checked. */
    seenCosmetics?: string[];
  };
}

export type QuizCategory = 'waste' | 'energy' | 'water' | 'carbon' | 'lifestyle';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestionResult {
  questionId: string;
  answerId: string | null;
  correct: boolean;
}

/** One submitted quiz. The id is created when the quiz starts, so the same submission can never be rewarded twice. */
export interface QuizAttempt {
  id: string;
  startedAt: string;
  submittedAt: string;
  category: QuizCategory | 'all';
  difficulty: QuizDifficulty | 'all';
  results: QuizQuestionResult[];
  correctCount: number;
  total: number;
  scorePercent: number;
  xpAwarded: number;
  /** Migrated from the old one-question-at-a-time quiz; answers were not stored then. */
  legacy?: boolean;
}

export interface MissionStart {
  missionId: string;
  startedAt: string;
  completedSteps: number[];
}

export type MissionProgressStatus = 'available' | 'in-progress' | 'completed-today' | 'completed-once';

export type ImpactActivityType = 'electricity-saved' | 'water-saved' | 'waste-sorted' | 'low-carbon-distance' | 'electricity-usage';
export type ImpactUnit = 'kWh' | 'L' | 'kg' | 'km';
export type WasteType = 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'other';

/** A quantity the player measured and entered themselves. Never converted from XP. */
export interface ImpactRecord {
  id: string;
  activityType: ImpactActivityType;
  quantity: number;
  unit: ImpactUnit;
  /** Local date YYYY-MM-DD (first day of the month for monthly electricity usage). */
  date: string;
  wasteType?: WasteType;
  emissionFactorId?: string;
  source: 'user-entered';
  calculationVersion: string;
  createdAt: string;
}

export interface PlayerProgress {
  totalXp: number;
  impactRecords: ImpactRecord[];
  inProgress: MissionStart[];
  completions: MissionCompletion[];
  unlockedBadges: BadgeRecord[];
  quizAttempts: QuizAttempt[];
  challengeRewards?: ChallengeReward[];
  /** Results of 60-second timed quiz runs (no XP; kept for personal bests). */
  timedRuns?: TimedQuizRun[];
  /** Demo admin grants (separate from the player's own records). */
  adminGrants?: AdminGrant[];
  /** Caring for Sprouty: days the player poured water, and fertilizer bags used. */
  care?: { wateredDays: string[]; fertilizerUsed: number; bonusWaterUsed?: number };
  schemaVersion: number;
}

export type BadgeGroup = 'missions' | 'consistency' | 'learning' | 'world';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  group: BadgeGroup;
  ruleType: 'total-completions' | 'category-completions' | 'streak' | 'quiz-correct' | 'world-stage' | 'timed-best';
  ruleCategory?: MissionCategory;
  threshold: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface WorldStage {
  id: string;
  stage: number;
  title: string;
  description: string;
  requiredMissions: number;
  unlockedMessage: string;
}

export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  waste: 'ขยะและรีไซเคิล',
  energy: 'พลังงาน',
  water: 'น้ำ',
  transport: 'การเดินทาง',
  consumption: 'การบริโภค',
  nature: 'ธรรมชาติ',
};

export const DIFFICULTY_LABELS: Record<MissionDifficulty, string> = {
  easy: 'ง่าย',
  medium: 'ปานกลาง',
  hard: 'ยาก',
};

export const RARITY_LABELS: Record<Badge['rarity'], string> = {
  common: 'ทั่วไป',
  uncommon: 'ไม่ธรรมดา',
  rare: 'หายาก',
  epic: 'มหากาพย์',
  legendary: 'ตำนาน',
};
