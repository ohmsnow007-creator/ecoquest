import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BOTTOM_NAV } from './navItems';

export function BottomNavigation() {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.75rem] transition-colors ${isActive ? 'font-semibold text-primary' : 'text-muted hover:text-text'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex h-8 w-14 items-center justify-center">
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-pill"
                        className="absolute inset-0 rounded-full bg-primary/10"
                        transition={{ type: 'spring', damping: 30, stiffness: 380 }}
                      />
                    )}
                    <Icon size={21} strokeWidth={isActive ? 2.4 : 1.9} className="relative" aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
