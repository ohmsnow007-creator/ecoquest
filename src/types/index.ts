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

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xp: number;
  durationMinutes: number;
  type: MissionType;
  repeatPolicy: RepeatPolicy;
  active: boolean;
  instructions: string[];
  learningPoint: string;
}

export interface MissionCompletion {
  id: string;
  missionId: string;
  completedAt: string;
  localDate: string;
  xpAwarded: number;
  completionType: MissionType;
  note?: string;
}

export interface BadgeRecord {
  badgeId: string;
  unlockedAt: string;
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
  };
}

export interface PlayerProgress {
  totalXp: number;
  completions: MissionCompletion[];
  unlockedBadges: BadgeRecord[];
  schemaVersion: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  ruleType: 'total-completions' | 'category-completions' | 'total-xp' | 'streak' | 'level';
  ruleCategory?: MissionCategory;
  threshold: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface WorldStage {
  id: string;
  title: string;
  description: string;
  requiredXp: number;
  visualKey: string;
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

export const CATEGORY_ICONS: Record<MissionCategory, string> = {
  waste: 'Recycle',
  energy: 'Zap',
  water: 'Droplets',
  transport: 'Bike',
  consumption: 'ShoppingBag',
  nature: 'TreePine',
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
