import { HashRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { GameProvider, useGame } from '../store/GameContext';
import { Admin } from '../pages/Admin';
import { ToastNotification } from '../components/feedback/Toast';
import { CelebrationModal } from '../components/feedback/CelebrationModal';
import { CosmeticUnlockCelebration } from '../components/cosmetics/CosmeticUnlockCelebration';
import { Avatar } from '../components/ui/AvatarPicker';
import { EmptyState } from '../components/ui/States';
import { useOutfit } from '../components/cosmetics/useOutfit';
import { buttonClasses } from '../components/ui/Button';

/** Relative link back to the player app on the same site (works under /ecoquest/ and at the root). */
const MAIN_APP = './';

function AdminShell() {
  const { profile } = useGame();
  const outfit = useOutfit();

  return (
    <div className="min-h-dvh pb-10">
      <header className="safe-top bg-forest-hero text-white shadow-raised">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime text-forest" aria-hidden="true">
            <ShieldCheck size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-section leading-tight font-bold">EcoQuest Admin</p>
            <p className="text-caption text-mint">หน้าผู้ดูแลสำหรับสาธิต · ลิงก์นี้ไม่มีทางเข้าจากแอปหลัก</p>
          </div>
          {profile && (
            <span className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pr-3 pl-1 text-caption sm:inline-flex">
              <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="sm" outfit={outfit} />
              {profile.displayName}
            </span>
          )}
          <a href={MAIN_APP} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-lime px-4 text-caption font-semibold text-forest hover:bg-mint">
            เปิดแอป <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-4 pt-5 sm:px-6">
        {profile ? (
          <Admin standalone />
        ) : (
          <div className="rounded-card border border-border bg-surface p-4 shadow-card">
            <EmptyState
              title="ยังไม่มีผู้เล่นบนเครื่องนี้"
              description="หน้าผู้ดูแลจัดการข้อมูลผู้เล่นบนอุปกรณ์และเบราว์เซอร์เดียวกันกับแอปหลัก เปิดแอปเพื่อสร้างโปรไฟล์ก่อน แล้วกลับมาที่ลิงก์นี้"
              action={
                <a href={MAIN_APP} className={buttonClasses('primary')}>
                  ไปที่แอป EcoQuest
                </a>
              }
            />
          </div>
        )}
      </main>
      <ToastNotification />
      <CelebrationModal />
      <CosmeticUnlockCelebration />
    </div>
  );
}

export function AdminApp() {
  return (
    <HashRouter>
      <GameProvider>
        <MotionConfig reducedMotion="user">
          <AdminShell />
        </MotionConfig>
      </GameProvider>
    </HashRouter>
  );
}
