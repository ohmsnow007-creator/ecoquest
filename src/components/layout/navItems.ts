import { Home, Target, Brain, Trophy, BarChart3, Globe2, Medal, Leaf, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const BOTTOM_NAV: NavItem[] = [
  { to: '/home', label: 'หน้าหลัก', icon: Home },
  { to: '/missions', label: 'ภารกิจ', icon: Target },
  { to: '/quiz', label: 'ควิซ', icon: Brain },
  { to: '/ranking', label: 'อันดับ', icon: Trophy },
  { to: '/progress', label: 'สถิติ', icon: BarChart3 },
];

export const SIDEBAR_NAV: NavItem[] = [
  { to: '/home', label: 'หน้าหลัก', icon: Home },
  { to: '/missions', label: 'ภารกิจ', icon: Target },
  { to: '/quiz', label: 'ควิซ', icon: Brain },
  { to: '/world', label: 'โลกสีเขียวของฉัน', icon: Globe2 },
  { to: '/achievements', label: 'เหรียญตรา', icon: Medal },
  { to: '/ranking', label: 'อันดับ', icon: Trophy },
  { to: '/progress', label: 'สถิติ', icon: BarChart3 },
  { to: '/impact', label: 'ผลกระทบ', icon: Leaf },
];
