import { lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from './store/GameContext';
import './App.css';
import { Launcher } from './components/layout/Launcher';
import { AppShell } from './components/layout/AppShell';

const Welcome = lazy(() => import('./pages/Welcome').then((m) => ({ default: m.Welcome })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Missions = lazy(() => import('./pages/Missions').then((m) => ({ default: m.Missions })));
const MissionDetail = lazy(() => import('./pages/MissionDetail').then((m) => ({ default: m.MissionDetail })));
const VirtualWorld = lazy(() => import('./pages/VirtualWorld').then((m) => ({ default: m.VirtualWorld })));
const Achievements = lazy(() => import('./pages/Achievements').then((m) => ({ default: m.Achievements })));
const Progress = lazy(() => import('./pages/Progress').then((m) => ({ default: m.Progress })));
const Impact = lazy(() => import('./pages/Impact').then((m) => ({ default: m.Impact })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Quiz = lazy(() => import('./pages/Quiz').then((m) => ({ default: m.Quiz })));
const Ranking = lazy(() => import('./pages/Ranking').then((m) => ({ default: m.Ranking })));

function AppRoutes() {
  const { profile } = useGame();
  const guard = (el: React.ReactNode) => (profile ? el : <Navigate to="/" replace />);

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={profile ? <Dashboard /> : <Welcome />} />
        <Route path="/missions" element={guard(<Missions />)} />
        <Route path="/missions/:id" element={guard(<MissionDetail />)} />
        <Route path="/world" element={guard(<VirtualWorld />)} />
        <Route path="/achievements" element={guard(<Achievements />)} />
        <Route path="/progress" element={guard(<Progress />)} />
        <Route path="/impact" element={guard(<Impact />)} />
        <Route path="/quiz" element={guard(<Quiz />)} />
        <Route path="/ranking" element={guard(<Ranking />)} />
        <Route path="/settings" element={guard(<Settings />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function MotionPreferences({ children }: { children: React.ReactNode }) {
  const { profile } = useGame();
  const reduced = profile?.preferences.reducedMotion ?? false;

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
  }, [reduced]);

  return <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>{children}</MotionConfig>;
}

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <MotionPreferences>
          <Launcher>
            <AppRoutes />
          </Launcher>
        </MotionPreferences>
      </GameProvider>
    </HashRouter>
  );
}
