import { createContext, useContext, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Power } from 'lucide-react';
import { useMediaQuery, DESKTOP_QUERY } from '../../hooks/useMediaQuery';
import { EcoMascot } from '../ui/EcoMascot';
import { markSplashSeen } from '../../utils/session';

const SESSION_KEY = 'ecoquest_launcher_open';

const LauncherContext = createContext<(() => void) | null>(null);

export function useCloseApp() {
  return useContext(LauncherContext);
}

function readOpen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeOpen(value: boolean) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable (private mode); the launcher still works for this page view.
  }
}

export function Launcher({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isOpen, setIsOpen] = useState(readOpen);

  if (!isDesktop) return <>{children}</>;

  const open = () => {
    markSplashSeen();
    writeOpen(true);
    setIsOpen(true);
  };
  const close = () => {
    writeOpen(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="launcher-bg">
        <motion.div
          className="flex max-w-md flex-col items-center text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EcoMascot size={168} mood="happy" float />
          <h1 className="mt-6 text-[2.5rem] leading-tight font-bold">EcoQuest</h1>
          <p className="mt-1 text-section font-medium text-mint">ภารกิจพิชิตโลกสีเขียว</p>
          <p className="mt-2 text-body text-white/70">เปลี่ยนนิสัยเล็ก ๆ ให้กลายเป็นการเปลี่ยนแปลงที่ยิ่งใหญ่</p>
          <button
            type="button"
            onClick={open}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-lime px-8 text-base font-semibold text-forest shadow-raised transition-colors hover:bg-mint"
          >
            <Power size={18} aria-hidden="true" />
            เปิดแอป
          </button>
          <p className="mt-10 text-caption text-white/45">EcoQuest v1.1 · ผลงานโปรเจกต์มหาวิทยาลัย</p>
        </motion.div>
      </div>
    );
  }

  return <LauncherContext.Provider value={close}>{children}</LauncherContext.Provider>;
}
