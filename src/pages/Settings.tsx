import { startTransition, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Trash2, UserX, Check, Plus, ChevronRight, RotateCcw, ShieldCheck, ExternalLink, User, HardDrive, Smartphone, BellRing, Volume2, PartyPopper, Wind, Settings2, type LucideIcon } from 'lucide-react';
import { INTERESTS, MAX_INTERESTS, PROFILE_COLORS } from '../data/avatars';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { quizzes } from '../data/quizzes';
import { APP_INFO } from '../config/app';
import { useGame, type BooleanPreference } from '../store/GameContext';
import { storageService } from '../services/storageService';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/ui/AvatarPicker';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 id={id} className="mb-2 text-section font-bold text-forest">{title}</h2>
      {children}
    </section>
  );
}

// Presentation only: an icon per settings row, looked up by the row's existing id.
const ROW_ICON: Record<string, LucideIcon> = {
  'pref-toasts': BellRing,
  'pref-sound': Volume2,
  'pref-celebrations': PartyPopper,
  'pref-motion': Wind,
};

function ToggleRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  const Icon = ROW_ICON[id] ?? Settings2;
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl bg-pale-mint text-primary" aria-hidden="true">
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p id={`${id}-label`} className="text-body font-semibold text-forest">{label}</p>
        <p id={`${id}-hint`} className="text-caption text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'} focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      >
        <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-card transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

const STORAGE_KEY_LABELS: Record<string, string> = {
  ecoquest_profile: 'โปรไฟล์',
  ecoquest_progress: 'ความคืบหน้า ภารกิจ ควิซ และบันทึกผลกระทบ',
  ecoquest_inbox_seen: 'สถานะการแจ้งเตือน',
  ecoquest_profile_corrupt_backup: 'สำเนาโปรไฟล์ที่อ่านไม่ได้ (สำรองไว้)',
  ecoquest_progress_corrupt_backup: 'สำเนาความคืบหน้าที่อ่านไม่ได้ (สำรองไว้)',
};

type Confirm = null | 'reset-game' | 'delete-account';

export function Settings() {
  const { profile, progress, updateProfile, setPreference, resetProgress, resetAll, notify } = useGame();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<Confirm>(null);
  if (!profile) return null;

  const prefs = profile.preferences;
  const pref = (key: BooleanPreference, fallback: boolean) => prefs[key] ?? fallback;
  const goals = prefs.selectedGoalIds;
  const usage = storageService.getUsage();
  const quizSources = [...new Set(quizzes.map((q) => q.source?.name).filter((s): s is string => !!s))];

  const toggleGoal = (id: string) => {
    const next = goals.includes(id) ? goals.filter((g) => g !== id) : goals.length < MAX_INTERESTS ? [...goals, id] : goals;
    if (next !== goals) updateProfile({ goalIds: next });
  };

  const handleExport = () => {
    const blob = new Blob([storageService.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecoquest-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetGame = () => {
    setConfirm(null);
    if (resetProgress()) {
      notify('รีเซ็ตเกมแล้ว โปรไฟล์ของคุณยังอยู่', 'info');
      navigate('/home', { replace: true });
    }
  };

  // Deletes the profile and every record on this device, then goes straight to creating a new level-1 character.
  const handleDeleteAccount = () => {
    setConfirm(null);
    // One transition for both: otherwise the route guard sees "no profile" first and redirects to /welcome.
    startTransition(() => {
      resetAll();
      navigate('/welcome/profile', { replace: true });
    });
  };

  return (
    <>
      <PageHeader title="ตั้งค่า" back />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Link to="/profile" className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-card hover:border-primary/40">
            <Avatar id={profile.avatarId} color={prefs.profileColor} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-semibold">{profile.displayName}</span>
              <span className="flex items-center gap-1 text-caption text-muted"><User size={13} aria-hidden="true" /> แก้ไขชื่อและอวาตาร์ที่หน้าโปรไฟล์</span>
            </span>
            <ChevronRight size={18} className="text-muted" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setConfirm('delete-account')}
            className="-mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-card border border-danger/30 bg-surface px-4 text-body font-semibold text-danger hover:bg-danger/5"
          >
            <UserX size={18} aria-hidden="true" /> ลบบัญชี
          </button>

          <Link to="/install" className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-card hover:border-primary/40">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pale-mint text-primary" aria-hidden="true">
              <Smartphone size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-semibold">ติดตั้งแอปและใช้งานออฟไลน์</span>
              <span className="block text-caption text-muted">เพิ่มลงหน้าจอหลัก และดูสถานะการใช้งานออฟไลน์</span>
            </span>
            <ChevronRight size={18} className="text-muted" aria-hidden="true" />
          </Link>

          <Section id="prefs-title" title="ความชอบ">
            <p className="mb-2 text-caption text-muted">เรื่องที่สนใจ (สูงสุด {MAX_INTERESTS}) ใช้แนะนำภารกิจในหน้าหลักและหน้าภารกิจ บันทึกทันทีเมื่อกด</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="เรื่องที่สนใจ">
              {INTERESTS.map((interest) => {
                const active = goals.includes(interest.id);
                const blocked = !active && goals.length >= MAX_INTERESTS;
                return (
                  <button
                    key={interest.id}
                    type="button"
                    aria-pressed={active}
                    aria-disabled={blocked}
                    onClick={() => !blocked && toggleGoal(interest.id)}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-caption font-medium ${active ? `${interest.tone} ring-2 ring-primary` : 'bg-background ring-1 ring-border'} ${blocked ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    {interest.label}
                    {active ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section id="notif-title" title="การแจ้งเตือน">
            <ToggleRow
              id="pref-toasts"
              label="แจ้งเตือนในแอป"
              hint="ข้อความสั้นมุมจอเมื่อเริ่มภารกิจหรือได้รับ XP (ข้อความแจ้งข้อผิดพลาดจะแสดงเสมอ) แอปนี้ไม่มีการแจ้งเตือนแบบพุช"
              checked={pref('inAppToasts', true)}
              onChange={(v) => setPreference('inAppToasts', v)}
            />
          </Section>

          <Section id="motion-title" title="เสียงและการเคลื่อนไหว">
            <div className="divide-y divide-border">
              <ToggleRow
                id="pref-sound"
                label="เสียงเอฟเฟกต์"
                hint="เล่นเสียงสั้น ๆ เมื่อทำภารกิจสำเร็จหรือได้รับรางวัล"
                checked={pref('soundEffects', false)}
                onChange={(v) => setPreference('soundEffects', v)}
              />
              <ToggleRow
                id="pref-celebrations"
                label="หน้าต่างฉลองรางวัล"
                hint="แสดงป๊อปอัปเมื่อเลเวลอัปหรือปลดล็อกเหรียญ (รางวัลยังได้รับตามปกติ)"
                checked={pref('celebrations', true)}
                onChange={(v) => setPreference('celebrations', v)}
              />
              <ToggleRow
                id="pref-motion"
                label="ลดการเคลื่อนไหว"
                hint="ปิดแอนิเมชันส่วนใหญ่ในแอป (ระบบจะทำตามการตั้งค่าของอุปกรณ์ด้วย)"
                checked={prefs.reducedMotion}
                onChange={(v) => setPreference('reducedMotion', v)}
              />
            </div>
          </Section>

          <Section id="appearance-title" title="รูปลักษณ์">
            <p className="mb-2 text-caption text-muted">สีพื้นหลังอวาตาร์ของคุณ</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="สีโปรไฟล์">
              {PROFILE_COLORS.map((c) => {
                const active = prefs.profileColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => updateProfile({ profileColor: c.id })}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-caption font-medium ${active ? 'border-primary bg-pale-mint' : 'border-border'}`}
                  >
                    <Avatar id={profile.avatarId} color={c.id} size="sm" />
                    {c.label}
                    {active && <Check size={15} className="text-primary" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section id="data-title" title="จัดการข้อมูล">
            <p className="flex items-start gap-2 text-caption text-muted">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {APP_INFO.dataHandling}
            </p>
            <div className="mt-3 rounded-control bg-pale-mint/60 p-3">
              <p className="flex items-center gap-1.5 text-caption font-semibold">
                <HardDrive size={14} aria-hidden="true" /> พื้นที่ที่ใช้: <span data-testid="storage-usage">{formatBytes(usage.bytes)}</span>
              </p>
              <ul className="mt-1 space-y-0.5 text-[0.75rem] text-muted">
                {usage.keys.map((k) => (
                  <li key={k.key} className="flex justify-between gap-2">
                    <span>{STORAGE_KEY_LABELS[k.key] ?? k.key}</span>
                    <span>{formatBytes(k.bytes)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <SecondaryButton fullWidth className="mt-3" icon={<Download size={17} />} onClick={handleExport}>
              ส่งออกข้อมูล (JSON)
            </SecondaryButton>
            <div className="mt-4 rounded-control border border-danger/25 bg-danger/5 p-3">
              <p className="mb-2 text-caption font-semibold text-danger">ส่วนที่ต้องระวัง — ย้อนกลับไม่ได้</p>
              <SecondaryButton fullWidth icon={<RotateCcw size={17} />} onClick={() => setConfirm('reset-game')}>
                รีเซ็ตเกม
              </SecondaryButton>
              <PrimaryButton tone="danger" fullWidth className="mt-2" icon={<Trash2 size={17} />} onClick={() => setConfirm('delete-account')}>
                ลบบัญชีและข้อมูลทั้งหมด
              </PrimaryButton>
            </div>
          </Section>

          <Section id="about-title" title="เกี่ยวกับ">
            <dl className="space-y-1 text-caption">
              <div className="flex justify-between gap-3"><dt className="text-muted">แอป</dt><dd className="text-right">{APP_INFO.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">เวอร์ชัน</dt><dd>{APP_INFO.version}</dd></div>
            </dl>
            <p className="mt-3 text-caption">{APP_INFO.purpose}</p>

            <h3 className="mt-4 text-caption font-semibold">แหล่งข้อมูลค่าการปล่อยก๊าซ (ใช้ในหน้าผลกระทบ)</h3>
            <ul className="mt-1 space-y-2 text-caption">
              {EMISSION_FACTORS.map((f) => (
                <li key={f.id}>
                  <p>{f.name}: {f.kgCO2ePerUnit} kgCO2e/{f.unit}</p>
                  <p className="text-muted">{f.publisher} · มีผล {f.effectiveFrom}</p>
                  <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary">
                    ดูแหล่งที่มา <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-[0.75rem] text-muted">กิจกรรมอื่นที่ยังไม่มีค่าอ้างอิงจะไม่ถูกคำนวณเป็น CO2e</p>

            <details className="mt-3 text-caption">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold">แหล่งอ้างอิงของคำถามควิซ ({quizSources.length})</summary>
              <ul className="list-disc space-y-0.5 pl-5 text-muted">
                {quizSources.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </details>
          </Section>
        </div>
      </div>

      <ConfirmationDialog
        open={confirm === 'reset-game'}
        title="รีเซ็ตเกม?"
        description={`XP (${progress.totalXp.toLocaleString('th-TH')}), เลเวล เหรียญตรา Streak ประวัติภารกิจ ผลควิซ และบันทึกผลกระทบจะถูกลบและเริ่มนับใหม่ โปรไฟล์ ชื่อ อวาตาร์ และการตั้งค่าจะยังอยู่ ไม่สามารถกู้คืนได้`}
        confirmLabel="รีเซ็ตเกม"
        tone="danger"
        onConfirm={handleResetGame}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmationDialog
        open={confirm === 'delete-account'}
        title={`ลบบัญชี “${profile.displayName}”?`}
        description="ชื่อ ตัวละคร การตั้งค่า XP เลเวล เหรียญตรา ประวัติภารกิจ ผลควิซ และบันทึกผลกระทบทั้งหมดจะถูกลบออกจากเครื่องนี้ แล้วไปหน้าสร้างตัวละครใหม่ที่เลเวล 1 ไม่สามารถกู้คืนได้ หากต้องการเก็บไว้ ให้ส่งออกข้อมูลก่อน"
        confirmLabel="ลบบัญชี"
        tone="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
