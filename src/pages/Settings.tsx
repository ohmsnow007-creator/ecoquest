import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Check, ShieldCheck, ChevronDown, Plus } from 'lucide-react';
import { DEFAULT_AVATAR_ID, DEFAULT_PROFILE_COLOR, INTERESTS, MAX_INTERESTS, PROFILE_COLORS } from '../data/avatars';
import { NAME_MAX_LENGTH, validateDisplayName } from '../utils/profile';
import { useGame } from '../store/GameContext';
import { storageService } from '../services/storageService';
import { getLevelFromXp } from '../utils/xp';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { Avatar, AvatarSelector } from '../components/ui/AvatarPicker';
import { LevelBadge, XPBadge } from '../components/ui/Badges';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';

export function Settings() {
  const { profile, progress, updateProfile, setReducedMotion, resetAll } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [avatar, setAvatar] = useState(profile?.avatarId ?? DEFAULT_AVATAR_ID);
  const [color, setColor] = useState(profile?.preferences.profileColor ?? DEFAULT_PROFILE_COLOR);
  const [goals, setGoals] = useState<string[]>(profile?.preferences.selectedGoalIds ?? []);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!profile) return null;

  const nameResult = validateDisplayName(name);
  const savedGoals = profile.preferences.selectedGoalIds;
  const dirty =
    name.trim() !== profile.displayName ||
    avatar !== profile.avatarId ||
    color !== (profile.preferences.profileColor ?? DEFAULT_PROFILE_COLOR) ||
    goals.length !== savedGoals.length ||
    goals.some((g) => !savedGoals.includes(g));
  const reduced = profile.preferences.reducedMotion;

  const toggleGoal = (id: string) =>
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < MAX_INTERESTS ? [...prev, id] : prev));

  const handleSave = () => {
    if (!nameResult.ok) return;
    updateProfile({ name: nameResult.value, avatarId: avatar, profileColor: color, goalIds: goals });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  const handleReset = () => {
    setConfirmReset(false);
    resetAll();
    navigate('/welcome', { replace: true });
  };

  return (
    <>
      <PageHeader title="ตั้งค่า" back />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card tone="forest">
            <div className="flex items-center gap-4">
              <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="lg" onDark />
              <div className="min-w-0">
                <p className="truncate text-section font-semibold">{profile.displayName}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <LevelBadge level={getLevelFromXp(progress.totalXp)} variant="onDark" />
                  <XPBadge amount={progress.totalXp} variant="onDark" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle title="แก้ไขโปรไฟล์" />
            <label htmlFor="settings-name" className="mb-1.5 block text-caption font-semibold">ชื่อ</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX_LENGTH + 10}
              aria-invalid={!nameResult.ok}
              aria-describedby="settings-name-error"
              className={`min-h-12 w-full rounded-control border bg-surface px-4 text-body focus:outline-none ${nameResult.ok ? 'border-border focus:border-primary' : 'border-danger'}`}
            />
            <p id="settings-name-error" className="mt-1 text-caption text-danger" role={nameResult.ok ? undefined : 'alert'}>
              {nameResult.ok ? '' : nameResult.error}
            </p>

            <p className="mt-3 mb-2 text-caption font-semibold">อวาตาร์</p>
            <AvatarSelector value={avatar} onChange={setAvatar} color={color} layout="grid" />

            <label htmlFor="settings-color" className="mt-4 mb-1.5 block text-caption font-semibold">สีโปรไฟล์</label>
            <div className="relative">
              <select
                id="settings-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="min-h-12 w-full appearance-none rounded-control border border-border bg-surface pr-12 pl-4 text-body focus:border-primary focus:outline-none"
              >
                {PROFILE_COLORS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" aria-hidden="true" />
            </div>

            <p className="mt-4 mb-2 text-caption font-semibold">เรื่องที่สนใจ (สูงสุด {MAX_INTERESTS})</p>
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
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-caption font-medium ${active ? interest.tone : 'bg-background'} ${blocked ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    {interest.label}
                    {active ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <PrimaryButton className="mt-5" icon={saved ? <Check size={18} /> : undefined} disabled={(!dirty && !saved) || !nameResult.ok} onClick={handleSave}>
              {saved ? 'บันทึกแล้ว' : 'บันทึกการเปลี่ยนแปลง'}
            </PrimaryButton>
          </Card>

          <Card>
            <SectionTitle title="การแสดงผล" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p id="reduce-motion-label" className="text-body font-semibold">ลดการเคลื่อนไหว</p>
                <p className="text-caption text-muted">ปิดแอนิเมชันส่วนใหญ่ในแอป (ระบบจะทำตามการตั้งค่าของอุปกรณ์ด้วย)</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reduced}
                aria-labelledby="reduce-motion-label"
                onClick={() => setReducedMotion(!reduced)}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${reduced ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-card transition-transform ${reduced ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="ข้อมูลของคุณ" icon={<ShieldCheck size={18} className="text-primary" aria-hidden="true" />} />
            <p className="text-caption text-muted">ข้อมูลทั้งหมดเก็บใน localStorage ของเบราว์เซอร์นี้เท่านั้น ไม่มีการส่งออกไปยังเซิร์ฟเวอร์ใด</p>
            <SecondaryButton fullWidth className="mt-3" icon={<Download size={17} />} onClick={handleExport}>
              ส่งออกข้อมูล (JSON)
            </SecondaryButton>
          </Card>

          <Card>
            <SectionTitle title="เกี่ยวกับ" />
            <dl className="space-y-1 text-caption">
              <div className="flex justify-between"><dt className="text-muted">แอป</dt><dd>EcoQuest — ภารกิจพิชิตโลกสีเขียว</dd></div>
              <div className="flex justify-between"><dt className="text-muted">เวอร์ชัน</dt><dd>1.1.0</dd></div>
              <div className="flex justify-between"><dt className="text-muted">ประเภท</dt><dd>ผลงานโปรเจกต์มหาวิทยาลัย</dd></div>
            </dl>
          </Card>

          <Card className="border-danger/30">
            <SectionTitle title="รีเซ็ตข้อมูล" />
            <p className="text-caption text-muted">ลบโปรไฟล์ XP เหรียญตรา และประวัติทั้งหมดในเครื่องนี้ ไม่สามารถกู้คืนได้</p>
            <PrimaryButton tone="danger" fullWidth className="mt-3" icon={<Trash2 size={17} />} onClick={() => setConfirmReset(true)}>
              รีเซ็ตข้อมูลทั้งหมด
            </PrimaryButton>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmReset}
        title="ลบข้อมูลทั้งหมด?"
        description="โปรไฟล์ XP เลเวล เหรียญตรา Streak ประวัติภารกิจ และผลควิซทั้งหมดจะถูกลบออกจากเครื่องนี้ และไม่สามารถกู้คืนได้ หากต้องการเก็บไว้ ให้ส่งออกข้อมูลก่อน"
        confirmLabel="ลบทั้งหมด"
        tone="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
