import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Medal, Shirt, TrendingUp, Undo2, Trash2, AlertTriangle } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { PinPad } from '../components/admin/PinPad';
import { badges } from '../data/badges';
import { COSMETICS, getCosmeticStatus, SLOT_LABELS } from '../data/cosmetics';
import { MAX_LEVEL } from '../config/levels';
import { getLevelFromXp } from '../utils/xp';
import { adminGrants, adminXp, earnedXp } from '../utils/admin';
import { PageHeader } from '../components/ui/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';

// Stays unlocked while the app is open (handy during a presentation); a reload locks it again.
let unlockedThisSession = false;

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

export function Admin() {
  const navigate = useNavigate();
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
      <PageHeader title="โหมดผู้ดูแล (สาธิต)" back />

      {!unlocked ? (
        <PinPad onUnlock={unlock} onCancel={() => navigate('/settings')} />
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
