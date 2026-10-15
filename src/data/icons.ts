import {
  Recycle, Zap, Droplets, Bike, ShoppingBag, TreePine,
  Sprout, Compass, Shield, Globe, Crown, Star, Trophy, Award, Flame, TrendingUp,
  Leaf, Flower2, Droplet, Sun, Mountain,
  type LucideIcon,
} from 'lucide-react';
import type { MissionCategory } from '../types';

export const CATEGORY_ORDER: MissionCategory[] = ['waste', 'energy', 'water', 'transport', 'consumption', 'nature'];

export const CATEGORY_ICON: Record<MissionCategory, LucideIcon> = {
  waste: Recycle,
  energy: Zap,
  water: Droplets,
  transport: Bike,
  consumption: ShoppingBag,
  nature: TreePine,
};

const BADGE_ICONS: Record<string, LucideIcon> = {
  Sprout, Compass, Shield, Globe, Crown, Recycle, Zap, Droplets, TreePine, Star, Trophy, Award, Flame, TrendingUp,
};

export function getBadgeIcon(name: string): LucideIcon {
  return BADGE_ICONS[name] ?? Award;
}

export interface AvatarOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const AVATARS: AvatarOption[] = [
  { id: 'avatar-leaf', label: 'ใบไม้', icon: Leaf },
  { id: 'avatar-tree', label: 'ต้นไม้', icon: TreePine },
  { id: 'avatar-flower', label: 'ดอกไม้', icon: Flower2 },
  { id: 'avatar-earth', label: 'โลก', icon: Globe },
  { id: 'avatar-water', label: 'หยดน้ำ', icon: Droplet },
  { id: 'avatar-sun', label: 'ดวงอาทิตย์', icon: Sun },
];

export function getAvatar(id: string | undefined): AvatarOption {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export const GOAL_OPTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'goal-waste', label: 'ลดขยะ', icon: Recycle },
  { id: 'goal-energy', label: 'ประหยัดพลังงาน', icon: Zap },
  { id: 'goal-water', label: 'ประหยัดน้ำ', icon: Droplets },
  { id: 'goal-transport', label: 'เดินทางยั่งยืน', icon: Bike },
  { id: 'goal-nature', label: 'รักธรรมชาติ', icon: Mountain },
];
