import {
  Recycle, Zap, Droplets, Bike, ShoppingBag, TreePine,
  Sprout, Compass, Shield, Globe, Crown, Star, Trophy, Award, Flame, TrendingUp,
  CalendarCheck, CalendarHeart, Lightbulb, BookOpen, GraduationCap, TreeDeciduous, Mountain,
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
  Bike, ShoppingBag, CalendarCheck, CalendarHeart, Lightbulb, BookOpen, GraduationCap, TreeDeciduous, Mountain,
};

export function getBadgeIcon(name: string): LucideIcon {
  return BADGE_ICONS[name] ?? Award;
}
