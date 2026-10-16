import { Home, Target, Brain, Trophy, BarChart3, Globe2, Medal, Leaf, UserRound, Sprout, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const BOTTOM_NAV: NavItem[] = [
  { to: '/home', label: 'หน้าหลัก', icon: Home },
  { to: '/missions', label: 'ภารกิจ', icon: Target },
  { to: '/world', label: 'โลกของฉัน', icon: Globe2 },
  { to: '/achievements', label: 'รางวัล', icon: Medal },
  { to: '/profile', label: 'โปรไฟล์', icon: UserRound },
];

export const SIDEBAR_NAV: NavItem[] = [
  { to: '/home', label: 'หน้าหลัก', icon: Home },
  { to: '/missions', label: 'ภารกิจ', icon: Target },
  { to: '/quiz', label: 'ควิซ', icon: Brain },
  { to: '/world', label: 'โลกสีเขียวของฉัน', icon: Globe2 },
  { to: '/sprouty', label: 'ดูแล Sprouty', icon: Sprout },
  { to: '/achievements', label: 'เหรียญตรา', icon: Medal },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/progress', label: 'สถิติ', icon: BarChart3 },
  { to: '/impact', label: 'ผลกระทบ', icon: Leaf },
  { to: '/profile', label: 'โปรไฟล์', icon: UserRound },
];
