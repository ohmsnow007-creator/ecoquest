import { useState, type FormEvent } from 'react';
import { ShieldCheck, Lock, Sparkles, Medal, Shirt, TrendingUp, Undo2, Trash2, KeyRound, AlertTriangle } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { storageService } from '../services/storageService';
import { badges } from '../data/badges';
import { COSMETICS, getCosmeticStatus, SLOT_LABELS } from '../data/cosmetics';
import { MAX_LEVEL } from '../config/levels';
import { getLevelFromXp } from '../utils/xp';
import { adminGrants, adminXp, earnedXp, hashPin, isValidPin } from '../utils/admin';
import { PageHeader } from '../components/ui/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';

// Stays unlocked while the app is open (handy during a presentation); a reload locks it again.
let unlockedThisSession = false;
const MAX_TRIES = 5;
const LOCKOUT_MS = 30_000;

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const existing = storageService.getAdminPinHash();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [tries, setTries] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!existing) {
      if (!isValidPin(pin)) return setError('PIN ต้องเป็นตัวเลข 4–6 หลัก');
      if (pin !== confirm) return setError('PIN สองช่องไม่ตรงกัน');
      if (!storageService.setAdminPinHash(hashPin(pin))) return setError('บันทึก PIN ไม่สำเร็จ');
      onUnlock();
      return;
    }
    if (Date.now() < lockedUntil) return setError('ใส่ผิดหลายครั้ง รอสักครู่แล้วลองใหม่');
    if (hashPin(pin) === existing) {
      onUnlock();
      return;
    }
    const n = tries + 1;
    setTries(n);
    setPin('');
    if (n >= MAX_TRIES) {
      setLockedUntil(Date.now() + LOCKOUT_MS);
      setTries(0);
      setError('ใส่ PIN ผิด 5 ครั้ง ล็อกไว้ 30 วินาที');
    } else {
      setError(`PIN ไม่ถูกต้อง (เหลืออีก ${MAX_TRIES - n} ครั้ง)`);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm rounded-card border border-border bg-surface p-5 text-center shadow-card">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-lime" aria-hidden="true">
        {existing ? <Lock size={24} /> : <KeyRound size={24} />}
      </span>
      <h2 className="mt-3 text-section font-bold text-forest">{existing ? 'ใส่ PIN ผู้ดูแล' : 'ตั้ง PIN ผู้ดูแล'}</h2>
      <p className="mt-1 text-caption text-muted">
        {existing ? 'สำหรับโหมดสาธิตบนเครื่องนี้' : 'ตัวเลข 4–6 หลัก ใช้เข้าหน้านี้ครั้งต่อไป'}
      </p>
      <label htmlFor="admin-pin" className="sr-only">PIN</label>
      <input
        id="admin-pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="PIN"
        className="mt-4 min-h-12 w-full rounded-control border border-border bg-surface px-4 text-center text-section tracking-[0.5em] focus:border-primary focus:outline-none"
      />
      {!existing && (
        <>
          <label htmlFor="admin-pin-2" className="sr-only">ยืนยัน PIN</label>
          <input
            id="admin-pin-2"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
            placeholder="ยืนยัน PIN"
            className="mt-2 min-h-12 w-full rounded-control border border-border bg-surface px-4 text-center text-section tracking-[0.5em] focus:border-primary focus:outline-none"
          />
        </>
      )}
      <p className="mt-2 min-h-5 text-caption text-danger" role="alert">{error}</p>
      <PrimaryButton type="submit" fullWidth className="mt-1 rounded-full">
        {existing ? 'เข้าสู่โหมดผู้ดูแล' : 'ตั้ง PIN และเข้าใช้งาน'}
      </PrimaryButton>
      <p className="mt-3 text-[0.75rem] text-muted">
        PIN นี้กันการกดเข้ามาโดยไม่ตั้งใจเท่านั้น ไม่ใช่ระบบความปลอดภัยจริง ลบได้ด้วย “ลบบัญชี” ในหน้าตั้งค่า
      </p>
    </form>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Medal; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="mb-3 flex items-center gap-2 text-section font-semibold text-forest">
        <Icon size={18} className="text-primary" aria-hidden="true" /> {title}
      </h2>
      {children}
    </section>
  );
}

export function Admin({ standalone = false }: { standalone?: boolean }) {
  const { profile, progress, admin, notify, markCosmeticsSeen } = useGame();
  const [unlocked, setUnlocked] = useState(unlockedThisSession);
  const [level, setLevel] = useState(10);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);
  if (!profile) return null;

  const unlock = () => {
    unlockedThisSession = true;
    setUnlocked(true);
  };
  const lock = () => {
    unlockedThisSession = false;
    setUnlocked(false);
  };
  const done = (ok: boolean, msg: string) => notify(ok ? msg : 'ไม่มีอะไรเปลี่ยน', ok ? 'info' : 'error');

  const grants = adminGrants(progress);
  const currentLevel = getLevelFromXp(progress.totalXp);
  const realLevel = getLevelFromXp(earnedXp(progress));
  const owned = new Set(progress.unlockedBadges.map((b) => b.badgeId));

  return (
    <>
      {!standalone && <PageHeader title="โหมดผู้ดูแล (สาธิต)" back />}

      {!unlocked ? (
        <PinGate onUnlock={unlock} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-card border border-warning/40 bg-tag-yellow p-4 text-caption text-forest lg:col-span-2" role="note">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                ทุกอย่างที่เพิ่มในหน้านี้เป็น <b>ค่าสาธิต</b> บนเครื่องนี้เท่านั้น จะมีป้าย “สาธิต” กำกับ ไม่นับใน Leaderboard
                และย้อนคืนได้ทุกเมื่อ ข้อมูลการเล่นจริงของผู้เล่นไม่ถูกแก้ไข
              </p>
            </div>

            <Section icon={TrendingUp} title="เลเวลและ XP">
              <dl className="grid grid-cols-3 gap-2 text-center text-caption">
                <div className="rounded-control bg-background p-2">
                  <dt className="text-muted">เลเวลที่แสดง</dt>
                  <dd className="text-section font-bold text-forest">{currentLevel}</dd>
                </div>
                <div className="rounded-control bg-background p-2">
                  <dt className="text-muted">เลเวลจากการเล่นจริง</dt>
                  <dd className="text-section font-bold text-forest">{realLevel}</dd>
                </div>
                <div className="rounded-control bg-background p-2">
                  <dt className="text-muted">XP จากผู้ดูแล</dt>
                  <dd className="text-section font-bold text-warning">{adminXp(progress).toLocaleString('th-TH')}</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-end gap-2">
                <label className="flex-1 text-caption font-semibold">
                  ตั้งเลเวลเป็น
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="mt-1 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-body"
                  >
                    {Array.from({ length: MAX_LEVEL - 1 }, (_, i) => i + 2).map((l) => (
                      <option key={l} value={l} disabled={l <= currentLevel}>
                        เลเวล {l}
                      </option>
                    ))}
                  </select>
                </label>
                <PrimaryButton className="rounded-full" disabled={level <= currentLevel} onClick={() => done(admin.grantLevel(level), `ตั้งเป็นเลเวล ${level} แล้ว (สาธิต)`)}>
                  ตั้งเลเวล
                </PrimaryButton>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[50, 200, 1000].map((n) => (
                  <SecondaryButton key={n} className="rounded-full" onClick={() => done(admin.grantXp(n), `เพิ่ม ${n} XP แล้ว (สาธิต)`)}>
                    +{n} XP
                  </SecondaryButton>
                ))}
              </div>
            </Section>

            <PrimaryButton
              fullWidth
              size="lg"
              className="rounded-full"
              icon={<Sparkles size={18} />}
              onClick={() => {
                // Skip one reveal per item here (there would be nine in a row); granting a single item still shows it.
                const ok = admin.grantEverything();
                if (ok) markCosmeticsSeen(COSMETICS.map((c) => c.id));
                done(ok, 'ปลดล็อกทุกอย่างแล้ว (สาธิต)');
              }}
            >
              ปลดล็อกทุกอย่าง (เลเวล 15 + เหรียญ + ของแต่ง)
            </PrimaryButton>
          </div>

          <div className="space-y-4">
            <Section icon={Medal} title={`เหรียญรางวัล (${badges.filter((b) => owned.has(b.id)).length}/${badges.length})`}>
              <ul className="max-h-72 divide-y divide-border overflow-y-auto pr-1">
                {badges.map((b) => {
                  const rec = progress.unlockedBadges.find((r) => r.badgeId === b.id);
                  return (
                    <li key={b.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="min-w-0 text-caption">
                        <span className="block truncate font-semibold">{b.name}</span>
                        <span className="text-muted">{rec ? (rec.source === 'admin' ? 'มอบโดยผู้ดูแล (สาธิต)' : 'ได้จากการเล่นจริง') : 'ยังไม่ได้'}</span>
                      </span>
                      {!rec && (
                        <SecondaryButton className="min-h-9 shrink-0 rounded-full px-3 text-caption" onClick={() => done(admin.grantBadge(b.id), `มอบเหรียญ ${b.name} แล้ว (สาธิต)`)}>
                          มอบ
                        </SecondaryButton>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section icon={Shirt} title="ของแต่ง">
              <ul className="divide-y divide-border">
                {COSMETICS.map((c) => {
                  const st = getCosmeticStatus(c, progress);
                  const viaAdmin = grants.some((g) => g.kind === 'cosmetic' && g.cosmeticId === c.id);
                  return (
                    <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="min-w-0 text-caption">
                        <span className="block truncate font-semibold">{c.name} · {SLOT_LABELS[c.slot]}</span>
                        <span className="text-muted">{st.unlocked ? (viaAdmin ? 'มอบโดยผู้ดูแล (สาธิต)' : 'ปลดล็อกจากการเล่นจริง') : st.condition}</span>
                      </span>
                      {!st.unlocked && (
                        <SecondaryButton className="min-h-9 shrink-0 rounded-full px-3 text-caption" onClick={() => done(admin.grantCosmetic(c.id), `มอบ ${c.name} แล้ว (สาธิต)`)}>
                          มอบ
                        </SecondaryButton>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section icon={Undo2} title={`ประวัติที่ผู้ดูแลเพิ่ม (${grants.length})`}>
              {grants.length === 0 ? (
                <p className="text-caption text-muted">ยังไม่มี ข้อมูลทั้งหมดมาจากการเล่นจริง</p>
              ) : (
                <>
                  <ul className="max-h-60 divide-y divide-border overflow-y-auto pr-1">
                    {[...grants].reverse().map((g) => (
                      <li key={g.id} className="flex items-center justify-between gap-2 py-2 text-caption">
                        <span className="min-w-0 truncate">
                          {g.kind === 'xp'
                            ? `+${g.amount.toLocaleString('th-TH')} XP`
                            : g.kind === 'badge'
                              ? `เหรียญ ${badges.find((b) => b.id === g.badgeId)?.name ?? g.badgeId}`
                              : `ของแต่ง ${COSMETICS.find((c) => c.id === g.cosmeticId)?.name ?? g.cosmeticId}`}
                        </span>
                        <button type="button" onClick={() => done(admin.revoke(g.id), 'ย้อนคืนแล้ว')} className="min-h-9 shrink-0 rounded-full px-3 font-semibold text-danger hover:bg-danger/10">
                          ย้อนคืน
                        </button>
                      </li>
                    ))}
                  </ul>
                  <PrimaryButton tone="danger" fullWidth className="mt-3 rounded-full" icon={<Trash2 size={16} />} onClick={() => setConfirmRevokeAll(true)}>
                    ย้อนคืนทั้งหมด
                  </PrimaryButton>
                </>
              )}
            </Section>

            <SecondaryButton fullWidth className="rounded-full" icon={<ShieldCheck size={16} />} onClick={lock}>
              ล็อกหน้าผู้ดูแล
            </SecondaryButton>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={confirmRevokeAll}
        title="ย้อนคืนค่าสาธิตทั้งหมด?"
        description="XP เหรียญ และของแต่งที่ผู้ดูแลเพิ่มจะถูกลบออกทั้งหมด เหลือเฉพาะผลจากการเล่นจริง ข้อมูลการเล่นจริงไม่ได้รับผลกระทบ"
        confirmLabel="ย้อนคืนทั้งหมด"
        tone="danger"
        onConfirm={() => {
          setConfirmRevokeAll(false);
          done(admin.revokeAll(), 'ย้อนคืนค่าสาธิตทั้งหมดแล้ว');
        }}
        onCancel={() => setConfirmRevokeAll(false)}
      />
    </>
  );
}
