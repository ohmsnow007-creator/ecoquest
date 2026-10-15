import { NavLink } from 'react-router-dom';
import { Settings, Power } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { getLevelFromXp, getLevelProgress, getXpInCurrentLevel, getXpToNextLevel } from '../../utils/xp';
import { SIDEBAR_NAV } from './navItems';
import { useCloseApp } from './Launcher';
import { EcoMascot } from '../ui/EcoMascot';
import { Avatar } from '../ui/AvatarPicker';
import { LevelBadge } from '../ui/Badges';
import { ProgressBar } from '../ui/ProgressBar';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center gap-3 rounded-control px-3 text-body transition-colors ${
    isActive ? 'bg-white/12 font-semibold text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
  }`;

export function DesktopSidebar() {
  const { profile, progress } = useGame();
  const closeApp = useCloseApp();
  if (!profile) return null;

  const level = getLevelFromXp(progress.totalXp);

  return (
    <aside
      aria-label="เมนูหลัก"
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-forest px-4 py-6 text-white lg:flex"
    >
      <div className="flex items-center gap-2 px-2">
        <EcoMascot size={40} title="EcoQuest" />
        <div>
          <p className="text-card leading-tight font-bold">EcoQuest</p>
          <p className="text-caption leading-tight text-mint">ภารกิจพิชิตโลกสีเขียว</p>
        </div>
      </div>

      <div className="mt-6 rounded-card bg-white/8 p-3">
        <div className="flex items-center gap-3">
          <Avatar id={profile.avatarId} onDark />
          <div className="min-w-0">
            <p className="truncate text-body font-semibold">{profile.displayName}</p>
            <LevelBadge level={level} variant="onDark" />
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={getLevelProgress(progress.totalXp)}
            label="ความคืบหน้าเลเวล"
            tone="lime"
            size="sm"
            onDark
            showLabel
            valueText={`${getXpInCurrentLevel(progress.totalXp)}/${getXpToNextLevel(progress.totalXp)} XP`}
          />
        </div>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {SIDEBAR_NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Icon size={19} aria-hidden="true" className={isActive ? 'text-lime' : ''} />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={19} aria-hidden="true" />
          ตั้งค่า
        </NavLink>
        {closeApp && (
          <button
            type="button"
            onClick={closeApp}
            className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-body text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Power size={19} aria-hidden="true" />
            ปิดแอป
          </button>
        )}
      </div>
    </aside>
  );
}
