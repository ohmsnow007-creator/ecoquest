import { useMemo, useState } from 'react';
import { Bell, Medal, TrendingUp } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { storageService } from '../../services/storageService';
import { buildActivityFeed, formatRelativeTime, levelUpText } from '../../utils/activity';
import { Modal } from '../ui/Modal';

// Notifications are the player's real milestones (badges, level-ups); "unread" means newer than the last time the panel was opened.
export function NotificationBell() {
  const { progress } = useGame();
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => storageService.getInboxSeenAt());

  const items = useMemo(
    () => buildActivityFeed(progress).filter((e) => e.type === 'badge' || e.type === 'level').slice(0, 20),
    [progress],
  );
  const unread = items.filter((e) => !seenAt || new Date(e.at) > new Date(seenAt)).length;

  const openPanel = () => {
    setOpen(true);
    const now = new Date().toISOString();
    storageService.setInboxSeenAt(now);
    setSeenAt(now);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        aria-label={unread > 0 ? `การแจ้งเตือน มี ${unread} รายการใหม่` : 'การแจ้งเตือน'}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-card hover:bg-background"
      >
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.625rem] font-bold text-white" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="การแจ้งเตือน">
        {items.length === 0 ? (
          <p className="py-6 text-center text-body text-muted">ยังไม่มีการแจ้งเตือน ปลดล็อกเหรียญตราหรือเลื่อนเลเวลแล้วจะแสดงที่นี่</p>
        ) : (
          <ul className="max-h-[60dvh] divide-y divide-border overflow-y-auto">
            {items.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-forest" aria-hidden="true">
                  {e.type === 'badge' ? <Medal size={18} /> : <TrendingUp size={18} />}
                </span>
                <div className="min-w-0">
                  <p className="text-body font-medium">
                    {e.type === 'badge' ? `ปลดล็อกเหรียญ "${e.title}"` : levelUpText(e)}
                  </p>
                  <p className="text-caption text-muted">{formatRelativeTime(e.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
