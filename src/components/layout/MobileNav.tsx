import { NavLink } from 'react-router-dom';
import {
  Home,
  Target,
  TreePine,
  Trophy,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'หน้าหลัก' },
  { to: '/missions', icon: Target, label: 'ภารกิจ' },
  { to: '/world', icon: TreePine, label: 'โลก' },
  { to: '/achievements', icon: Trophy, label: 'เหรียญ' },
  { to: '/progress', icon: BarChart3, label: 'สถิติ' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: 'linear-gradient(135deg, #0d2918 0%, #14532d 100%)',
        borderTop: '1px solid rgba(34, 197, 94, 0.2)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[56px] ${
                isActive
                  ? 'text-green-400'
                  : 'text-white/40 hover:text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-green-500/20' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
