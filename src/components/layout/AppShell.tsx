import { Suspense } from 'react';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNavigation } from './BottomNavigation';
import { DesktopSidebar } from './DesktopSidebar';
import { ConnectionBanner } from './ConnectionBanner';
import { ToastNotification } from '../feedback/Toast';
import { CelebrationModal } from '../feedback/CelebrationModal';
import { CosmeticUnlockCelebration } from '../cosmetics/CosmeticUnlockCelebration';
import { ErrorBoundary, LoadingSkeleton } from '../ui/States';
import { useGame } from '../../store/GameContext';

export function AppShell() {
  const { profile } = useGame();
  const { pathname } = useLocation();
  const navType = useNavigationType();

  // Opening a page starts at its top, like a phone app. Going back (browser/phone back) keeps
  // the browser's own scroll restore, so you return to where you were in a list.
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navType]);

  if (!profile) {
    return (
      <ErrorBoundary key={pathname}>
        <Suspense fallback={<LoadingSkeleton />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-dvh lg:pl-64">
      <DesktopSidebar />
      <ConnectionBanner />
      <main className="pb-nav lg:pb-12">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<LoadingSkeleton />}>
              <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
                <Outlet />
              </motion.div>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <BottomNavigation />
      <ToastNotification />
      <CelebrationModal />
      <CosmeticUnlockCelebration />
    </div>
  );
}
