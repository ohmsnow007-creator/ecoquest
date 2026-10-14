import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './store/GameContext';
import './App.css';
import { Launcher } from './components/layout/Launcher';
import { AppShell } from './components/layout/AppShell';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { Missions } from './pages/Missions';
import { MissionDetail } from './pages/MissionDetail';
import { VirtualWorld } from './pages/VirtualWorld';
import { Achievements } from './pages/Achievements';
import { Progress } from './pages/Progress';
import { Impact } from './pages/Impact';
import { Settings } from './pages/Settings';
import { Quiz } from './pages/Quiz';
import { Ranking } from './pages/Ranking';

function AppRoutes() {
  const { profile } = useGame();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={profile ? <Dashboard /> : <Welcome />} />
        <Route path="/missions" element={profile ? <Missions /> : <Navigate to="/" />} />
        <Route path="/missions/:id" element={profile ? <MissionDetail /> : <Navigate to="/" />} />
        <Route path="/world" element={profile ? <VirtualWorld /> : <Navigate to="/" />} />
        <Route path="/achievements" element={profile ? <Achievements /> : <Navigate to="/" />} />
        <Route path="/progress" element={profile ? <Progress /> : <Navigate to="/" />} />
        <Route path="/impact" element={profile ? <Impact /> : <Navigate to="/" />} />
        <Route path="/quiz" element={profile ? <Quiz /> : <Navigate to="/" />} />
        <Route path="/ranking" element={profile ? <Ranking /> : <Navigate to="/" />} />
        <Route path="/settings" element={profile ? <Settings /> : <Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <GameProvider>
        <Launcher>
          <AppRoutes />
        </Launcher>
      </GameProvider>
    </HashRouter>
  );
}
