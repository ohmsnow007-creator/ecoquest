import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../feedback/Toast';
import { useGame } from '../../store/GameContext';

export function AppShell() {
  const { profile } = useGame();

  if (!profile) return <Outlet />;

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
