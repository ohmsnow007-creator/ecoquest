import { Link } from 'react-router-dom';
import { WifiOff, RefreshCw } from 'lucide-react';
import { usePwa, applyUpdate } from '../../services/pwaService';

/** Polite, non-blocking notices for offline mode and a waiting app update. */
export function ConnectionBanner() {
  const { online, updateAvailable } = usePwa();
  if (online && !updateAvailable) return null;

  return (
    <div role="status" className="safe-top sticky top-0 z-30 border-b border-border bg-tag-yellow/90 px-4 py-2 text-caption text-forest backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-1">
        {!online && (
          <span className="flex items-center gap-1.5">
            <WifiOff size={15} aria-hidden="true" />
            ออฟไลน์อยู่ — ยังเล่นและบันทึกลงเครื่องนี้ได้ตามปกติ
            <Link to="/install" className="font-semibold underline underline-offset-2">รายละเอียด</Link>
          </span>
        )}
        {updateAvailable && (
          <button type="button" onClick={() => void applyUpdate()} className="inline-flex min-h-9 items-center gap-1.5 font-semibold underline underline-offset-2">
            <RefreshCw size={14} aria-hidden="true" /> มีเวอร์ชันใหม่ แตะเพื่ออัปเดต
          </button>
        )}
      </div>
    </div>
  );
}
