import { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from './store/GameContext';
import './App.css';
import { Launcher } from './components/layout/Launcher';
import { lazyRetry } from './utils/lazyRetry';
import { AppShell } from './components/layout/AppShell';

const Admin = lazyRetry(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const Welcome = lazyRetry(() => import('./pages/Welcome').then((m) => ({ default: m.Welcome })));
const ProfileCreation = lazyRetry(() => import('./pages/ProfileCreation').then((m) => ({ default: m.ProfileCreation })));
const Dashboard = lazyRetry(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Missions = lazyRetry(() => import('./pages/Missions').then((m) => ({ default: m.Missions })));
const MissionDetail = lazyRetry(() => import('./pages/MissionDetail').then((m) => ({ default: m.MissionDetail })));
const WasteSorter = lazyRetry(() => import('./pages/WasteSorter').then((m) => ({ default: m.WasteSorter })));
const SproutyCare = lazyRetry(() => import('./pages/SproutyCare').then((m) => ({ default: m.SproutyCare })));
const VirtualWorld = lazyRetry(() => import('./pages/VirtualWorld').then((m) => ({ default: m.VirtualWorld })));
const Achievements = lazyRetry(() => import('./pages/Achievements').then((m) => ({ default: m.Achievements })));
const Progress = lazyRetry(() => import('./pages/Progress').then((m) => ({ default: m.Progress })));
const Impact = lazyRetry(() => import('./pages/Impact').then((m) => ({ default: m.Impact })));
const Settings = lazyRetry(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Quiz = lazyRetry(() => import('./pages/Quiz').then((m) => ({ default: m.Quiz })));
const QuizTimed = lazyRetry(() => import('./pages/QuizTimed').then((m) => ({ default: m.QuizTimed })));
const QuizResult = lazyRetry(() => import('./pages/QuizResult').then((m) => ({ default: m.QuizResult })));
const Leaderboard = lazyRetry(() => import('./pages/Leaderboard').then((m) => ({ default: m.Leaderboard })));
const Install = lazyRetry(() => import('./pages/Install').then((m) => ({ default: m.Install })));
const NotFound = lazyRetry(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const Profile = lazyRetry(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));

function AppRoutes() {
  const { profile } = useGame();
  const guard = (el: React.ReactNode) => (profile ? el : <Navigate to="/welcome" replace />);
  const entry = <Navigate to={profile ? '/home' : '/welcome'} replace />;

  return (
    <Routes>
      <Route
        path="/welcome"
        element={
          <Suspense fallback={<div className="min-h-dvh bg-primary" />}>
            <Welcome />
          </Suspense>
        }
      />
      <Route
        path="/welcome/profile"
        element={
          <Suspense fallback={<div className="min-h-dvh bg-sand" />}>
            <ProfileCreation />
          </Suspense>
        }
      />
      <Route path="/" element={entry} />
      <Route element={<AppShell />}>
        <Route path="/home" element={guard(<Dashboard />)} />
        <Route path="/missions" element={guard(<Missions />)} />
        <Route path="/missions/:id" element={guard(<MissionDetail />)} />
        <Route path="/world" element={guard(<VirtualWorld />)} />
        <Route path="/sprouty" element={guard(<SproutyCare />)} />
        <Route path="/sort" element={guard(<WasteSorter />)} />
        <Route path="/achievements" element={guard(<Achievements />)} />
        <Route path="/progress" element={guard(<Progress />)} />
        <Route path="/impact" element={guard(<Impact />)} />
        <Route path="/quiz" element={guard(<Quiz />)} />
        <Route path="/quiz/result" element={guard(<QuizResult />)} />
        <Route path="/quiz/timed" element={guard(<QuizTimed />)} />
        <Route path="/leaderboard" element={guard(<Leaderboard />)} />
        <Route path="/ranking" element={<Navigate to="/leaderboard" replace />} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/settings" element={guard(<Settings />)} />
        <Route path="/admin" element={guard(<Admin />)} />
        <Route path="/install" element={guard(<Install />)} />
      </Route>
      <Route
        path="*"
        element={
          <Suspense fallback={<div className="min-h-dvh bg-background" />}>
            <NotFound />
          </Suspense>
        }
      />
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
