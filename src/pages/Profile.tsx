import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Settings, Target, Medal, Flame, Sparkles, Brain, ListChecks, ChevronRight, ShieldCheck, History, BarChart3, Trophy, CalendarDays, ArrowRight } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getPlayerStats } from '../utils/playerStats';
import { getLevelConfig } from '../utils/xp';
import { buildActivityFeed, formatRelativeTime } from '../utils/activity';
import { getAllBadgeStatuses } from '../utils/badges';
import { validateDisplayName, NAME_MAX_LENGTH } from '../utils/profile';
import { missions } from '../data/missions';
import { CATEGORY_LABELS } from '../types';
import type { MissionCategory } from '../types';
import { CATEGORY_ICON } from '../data/icons';
import { Avatar, AvatarSelector } from '../components/ui/AvatarPicker';
import { LevelBadge, XPBadge } from '../components/ui/Badges';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { BadgeMedal } from '../components/illustrations/BadgeMedal';
import { IconButton } from '../components/ui/Button';

const FAVORITE_MIN_COMPLETIONS = 3;

function EditProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateProfile, notify } = useGame();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [avatar, setAvatar] = useState(profile?.avatarId ?? '');
  if (!profile) return null;

  const result = validateDisplayName(name);
  const changed = (result.ok ? result.value : name) !== profile.displayName || avatar !== profile.avatarId;
  const color = profile.preferences.profileColor;

  const save = () => {
    if (!result.ok) return;
    updateProfile({ name: result.value, avatarId: avatar });
    notify('บันทึกโปรไฟล์แล้ว', 'info');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="แก้ไขโปรไฟล์"
      footer={
        <>
          <SecondaryButton onClick={onClose}>ยกเลิก</SecondaryButton>
          <PrimaryButton onClick={save} disabled={!result.ok || !changed}>บันทึก</PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2" aria-label="เปรียบเทียบก่อนและหลังแก้ไข">
        <div className="rounded-control border border-border p-3 text-center">
          <p className="mb-2 text-caption text-muted">ปัจจุบัน</p>
          <Avatar id={profile.avatarId} color={color} size="md" />
          <p className="mt-1 truncate text-caption font-semibold">{profile.displayName}</p>
        </div>
        <div className={`rounded-control border p-3 text-center ${changed ? 'border-primary bg-pale-mint' : 'border-border'}`}>
          <p className="mb-2 text-caption text-muted">หลังบันทึก</p>
          <Avatar id={avatar} color={color} size="md" />
          <p className="mt-1 truncate text-caption font-semibold">{result.ok ? result.value : '—'}</p>
        </div>
      </div>

      <label htmlFor="profile-name" className="mt-4 mb-1.5 block text-caption font-semibold">ชื่อผู้เล่น</label>
      <input
        id="profile-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={NAME_MAX_LENGTH + 10}
        aria-invalid={!result.ok}
        aria-describedby="profile-name-error"
        className={`min-h-12 w-full rounded-control border bg-surface px-4 text-body focus:outline-none ${result.ok ? 'border-border focus:border-primary' : 'border-danger'}`}
      />
      <p id="profile-name-error" className="mt-1 text-caption text-danger" role={result.ok ? undefined : 'alert'}>
        {result.ok ? '' : result.error}
      </p>

      <p className="mt-3 mb-2 text-caption font-semibold">อวาตาร์</p>
      <AvatarSelector value={avatar} onChange={setAvatar} color={color} layout="grid" />
    </Modal>
  );
}

export function Profile() {
  const { profile, progress } = useGame();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(params.get('edit') === '1');
  const [editKey, setEditKey] = useState(0);
  if (!profile) return null;

  const stats = getPlayerStats(progress);
  const level = getLevelConfig(stats.xp);
  const feed = buildActivityFeed(progress).slice(0, 4);
  const unlocked = getAllBadgeStatuses(progress)
    .filter((s) => s.unlocked)
    .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''));
  const history = [...progress.completions].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 5);
  const favorite = (Object.keys(stats.byCategory) as MissionCategory[]).sort((a, b) => stats.byCategory[b] - stats.byCategory[a])[0];
  const showFavorite = stats.missionsCompleted >= FAVORITE_MIN_COMPLETIONS && stats.byCategory[favorite] > 0;
  const FavIcon = CATEGORY_ICON[favorite];

  const openEdit = () => {
    setEditKey((k) => k + 1);
    setEditing(true);
  };
  const closeEdit = () => {
    setEditing(false);
    if (params.has('edit')) setParams({}, { replace: true });
  };

  return (
    <>
      <header className="safe-top flex items-center justify-between gap-3 pt-5 pb-4 lg:pt-10 lg:pb-6">
        <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">โปรไฟล์ของฉัน</h1>
        <Link to="/settings" aria-label="ตั้งค่า" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-forest shadow-card hover:bg-pale-mint">
          <Settings size={19} aria-hidden="true" />
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-5 lg:col-span-2">
          {/* Identity */}
          <section aria-label="ข้อมูลผู้เล่น" className="bg-forest-hero rounded-hero p-4 text-white shadow-raised sm:p-5">
            <div className="flex items-center gap-4">
              <span className="rounded-full ring-4 ring-mint/80">
                <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="lg" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-section font-bold text-white">{profile.displayName}</p>
                  <IconButton aria-label="แก้ไขโปรไฟล์" variant="onDark" onClick={openEdit} className="-my-2">
                    <Pencil size={17} />
                  </IconButton>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <LevelBadge level={level.level} variant="onDark" />
                  <span className="text-caption font-medium text-mint">{level.title}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-caption text-white/75">
                  <CalendarDays size={13} aria-hidden="true" />
                  เริ่มเล่นเมื่อ {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={stats.levelProgress}
                label={`ความคืบหน้าสู่เลเวล ${level.level + 1}`}
                tone="lime"
                onDark
                showLabel
                valueText={stats.xpForNextLevel > 0 ? `${stats.xpInLevel}/${stats.xpForNextLevel} XP` : 'เลเวลสูงสุด'}
              />
            </div>
          </section>

          {/* Statistics */}
          <section aria-label="สถิติ" className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Target, value: stats.missionsCompleted, label: 'ภารกิจสำเร็จ' },
              { icon: Medal, value: stats.badgesUnlocked, label: 'เหรียญที่ได้รับ' },
              { icon: Flame, value: stats.streak, label: 'วันต่อเนื่อง' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-card border border-border bg-surface p-3 text-center shadow-card">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-pale-mint text-primary" aria-hidden="true"><Icon size={20} /></span>
                <p className="mt-1 text-[1.5rem] leading-tight font-bold text-forest">{value}</p>
                <p className="text-[0.75rem] text-muted">{label}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="totals-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
            <h2 id="totals-title" className="text-section font-bold text-forest">สถิติรวม</h2>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-control bg-pale-mint/60 p-3">
                <dt className="flex items-center gap-1 text-[0.75rem] text-muted"><Sparkles size={13} aria-hidden="true" /> XP สะสม</dt>
                <dd className="text-section font-bold text-forest">{stats.xp.toLocaleString('th-TH')}</dd>
              </div>
              <div className="rounded-control bg-pale-mint/60 p-3">
                <dt className="flex items-center gap-1 text-[0.75rem] text-muted"><ListChecks size={13} aria-hidden="true" /> ภารกิจทั้งหมด</dt>
                <dd className="text-section font-bold text-forest">{stats.missionsCompleted}</dd>
              </div>
              <div className="rounded-control bg-pale-mint/60 p-3">
                <dt className="flex items-center gap-1 text-[0.75rem] text-muted"><Brain size={13} aria-hidden="true" /> ทำควิซ</dt>
                <dd className="text-section font-bold text-forest">{stats.quizzesAnswered} ครั้ง</dd>
              </div>
            </dl>
            <Link to="/progress" className="mt-3 inline-flex min-h-11 items-center gap-1 text-caption font-semibold text-primary">
              <BarChart3 size={15} aria-hidden="true" /> ดูสถิติทั้งหมด <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </section>

          {/* Recent activity */}
          <section aria-labelledby="recent-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
            <h2 id="recent-title" className="text-section font-bold text-forest">กิจกรรมล่าสุด</h2>
            {feed.length === 0 ? (
              <p className="mt-2 text-body text-muted">ยังไม่มีกิจกรรม เริ่มภารกิจแรกจากหน้าภารกิจได้เลย</p>
            ) : (
              <ul className="mt-1 divide-y divide-border">
                {feed.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate text-body">
                      {e.type === 'mission' ? `ทำภารกิจ "${e.title}"` : e.type === 'quiz' ? `ทำ${e.title} ถูก ${e.correctCount}/${e.total}` : e.type === 'badge' ? `ได้รับเหรียญ "${e.title}"` : e.type === 'challenge' ? (e.kind === 'daily' ? 'ทำภารกิจประจำวันครบ' : `สำเร็จชาเลนจ์ "${e.title}"`) : `เลื่อนเป็นเลเวล ${e.level}`}
                    </span>
                    <span className="shrink-0 text-caption text-muted">{formatRelativeTime(e.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Mission history */}
          <section aria-labelledby="history-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
            <h2 id="history-title" className="flex items-center gap-2 text-section font-bold text-forest">
              <History size={18} className="text-primary" aria-hidden="true" /> ประวัติภารกิจ
            </h2>
            {history.length === 0 ? (
              <p className="mt-2 text-body text-muted">ยังไม่มีภารกิจที่ทำสำเร็จ</p>
            ) : (
              <ul className="mt-1 divide-y divide-border">
                {history.map((c) => {
                  const m = missions.find((x) => x.id === c.missionId);
                  return (
                    <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-body">{m?.title ?? c.missionId}</span>
                        <span className="block text-caption text-muted">
                          {new Date(c.completedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {c.completionType === 'self-reported' && ' · รายงานด้วยตนเอง'}
                        </span>
                      </span>
                      <XPBadge amount={c.xpAwarded} plus />
                    </li>
                  );
                })}
              </ul>
            )}
            {progress.completions.length > history.length && (
              <Link to="/progress#history" className="mt-2 inline-flex min-h-11 items-center gap-1 text-caption font-semibold text-primary">
                ดูประวัติทั้งหมด <ChevronRight size={15} aria-hidden="true" />
              </Link>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          {showFavorite && (
            <section aria-label="หมวดที่ชอบ" className="rounded-card border border-border bg-pale-mint p-4">
              <p className="text-caption text-muted">หมวดที่คุณทำบ่อยที่สุด</p>
              <p className="mt-1 flex items-center gap-2 text-section font-semibold">
                <FavIcon size={20} className="text-primary" aria-hidden="true" /> {CATEGORY_LABELS[favorite]}
              </p>
              <p className="text-caption text-muted">{stats.byCategory[favorite]} จาก {stats.missionsCompleted} ภารกิจ</p>
            </section>
          )}

          <section aria-labelledby="ach-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 id="ach-title" className="text-section font-bold text-forest">เหรียญรางวัล</h2>
              <Link to="/achievements" className="inline-flex min-h-11 items-center gap-0.5 text-caption font-semibold text-primary">
                ทั้งหมด <ChevronRight size={15} aria-hidden="true" />
              </Link>
            </div>
            {unlocked.length === 0 ? (
              <p className="text-body text-muted">ยังไม่มีเหรียญ ทำภารกิจแรกเพื่อรับ “First Step”</p>
            ) : (
              <ul className="mt-1 grid grid-cols-3 gap-2">
                {unlocked.slice(0, 3).map((s) => (
                  <li key={s.badge.id} className="flex flex-col items-center text-center">
                    <BadgeMedal badge={s.badge} unlocked size={52} />
                    <span className="mt-1 text-[0.75rem] leading-tight font-medium">{s.badge.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Link to="/leaderboard" className="flex items-center justify-between rounded-card border border-border bg-surface p-4 shadow-card hover:border-primary/40">
            <span className="flex items-center gap-2 text-body font-semibold">
              <Trophy size={18} className="text-warning" aria-hidden="true" /> Leaderboard
            </span>
            <ArrowRight size={18} className="text-muted" aria-hidden="true" />
          </Link>

          <Link to="/settings" className="flex items-center justify-between rounded-card border border-border bg-surface p-4 shadow-card hover:border-primary/40">
            <span className="flex items-center gap-2 text-body font-semibold">
              <Settings size={18} className="text-primary" aria-hidden="true" /> ตั้งค่า
            </span>
            <ArrowRight size={18} className="text-muted" aria-hidden="true" />
          </Link>

          <p className="flex items-start gap-2 px-1 text-caption text-muted">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            โปรไฟล์นี้เก็บอยู่ในเบราว์เซอร์ของอุปกรณ์นี้เท่านั้น ไม่มีการเผยแพร่หรือส่งข้อมูลออกไปภายนอก
          </p>
        </aside>
      </div>

      <EditProfileDialog key={editKey} open={editing} onClose={closeEdit} />
    </>
  );
}
