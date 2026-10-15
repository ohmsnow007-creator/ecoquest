import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Check, ShieldCheck } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { storageService } from '../services/storageService';
import { getLevelFromXp } from '../utils/xp';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { Avatar, AvatarPicker } from '../components/ui/AvatarPicker';
import { LevelBadge, XPBadge } from '../components/ui/Badges';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';

export function Settings() {
  const { profile, progress, updateProfile, setReducedMotion, resetAll } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [avatar, setAvatar] = useState(profile?.avatarId ?? 'avatar-leaf');
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!profile) return null;

  const dirty = name.trim() !== profile.displayName || avatar !== profile.avatarId;
  const reduced = profile.preferences.reducedMotion;

  const handleSave = () => {
    updateProfile(name.trim() || 'นักสำรวจ', avatar);
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
              <Avatar id={profile.avatarId} size="lg" onDark />
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
              maxLength={20}
              className="min-h-12 w-full rounded-control border border-border bg-surface px-4 text-body focus:border-primary focus:outline-none"
            />
            <p className="mt-4 mb-2 text-caption font-semibold">อวาตาร์</p>
            <AvatarPicker value={avatar} onChange={setAvatar} />
            <PrimaryButton className="mt-4" icon={saved ? <Check size={18} /> : undefined} disabled={!dirty && !saved} onClick={handleSave}>
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
