import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { buttonClasses } from '../components/ui/Button';

export function NotFound() {
  const { profile } = useGame();
  const { pathname } = useLocation();
  const home = profile ? '/home' : '/welcome';

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint text-primary" aria-hidden="true">
        <Compass size={30} />
      </span>
      <h1 className="mt-4 text-page font-bold text-forest">ไม่พบหน้านี้</h1>
      <p className="mt-1 max-w-sm text-body text-muted">
        ไม่มีหน้า <code className="rounded bg-surface px-1 break-all">{pathname}</code> ในแอป ข้อมูลการเล่นของคุณไม่ได้รับผลกระทบ
      </p>
      <Link to={home} replace className={`${buttonClasses('primary')} mt-5`}>
        {profile ? 'กลับหน้าหลัก' : 'ไปหน้าเริ่มต้น'}
      </Link>
    </main>
  );
}
