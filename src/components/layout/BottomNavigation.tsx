import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BOTTOM_NAV } from './navItems';

// The middle destination is drawn as a raised round button, as on the EcoQuest board.
const CENTER = Math.floor(BOTTOM_NAV.length / 2);

export function BottomNavigation() {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-[1.75rem] border-t border-border bg-surface/95 shadow-nav backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }, i) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.75rem] transition-colors ${isActive ? 'font-semibold text-primary' : 'text-muted hover:text-forest'}`
              }
            >
              {({ isActive }) =>
                i === CENTER ? (
                  <>
                    <span
                      className={`-mt-7 mb-0.5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface text-white shadow-raised transition-colors ${isActive ? 'bg-forest' : 'bg-primary'}`}
                    >
                      <Icon size={24} strokeWidth={2.2} className={isActive ? 'text-lime' : ''} aria-hidden="true" />
                    </span>
                    <span>{label}</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-8 w-14 items-center justify-center">
                      {isActive && (
                        <motion.span
                          layoutId="bottom-nav-pill"
                          className="absolute inset-0 rounded-full bg-pale-mint"
                          transition={{ type: 'spring', damping: 30, stiffness: 380 }}
                        />
                      )}
                      <Icon size={21} strokeWidth={isActive ? 2.4 : 1.9} className="relative" aria-hidden="true" />
                    </span>
                    <span>{label}</span>
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
