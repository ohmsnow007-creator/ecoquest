import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import { missions } from '../data/missions';
import { useGame } from '../store/GameContext';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import { CATEGORY_ICON } from '../data/icons';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { XPBadge } from '../components/ui/Badges';
import { PrimaryButton, buttonClasses } from '../components/ui/Button';
import { ErrorState } from '../components/ui/States';
import { EcoMascot } from '../components/ui/EcoMascot';
import { MISSION_TYPE_META } from '../components/ui/MissionCard';

export function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const { completeMission, canCompleteMission, getMissionStatus } = useGame();
  const [note, setNote] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  const mission = missions.find((m) => m.id === id);
  if (!mission) {
    return (
      <>
        <PageHeader title="ไม่พบภารกิจ" back="/missions" />
        <ErrorState
          title="ไม่พบภารกิจนี้"
          description="ภารกิจอาจถูกนำออกไปแล้ว หรือลิงก์ไม่ถูกต้อง"
          action={<Link to="/missions" className={buttonClasses('primary')}>กลับไปหน้าภารกิจ</Link>}
        />
      </>
    );
  }

  const status = getMissionStatus(mission.id);
  const canComplete = canCompleteMission(mission.id);
  const CatIcon = CATEGORY_ICON[mission.category];
  const TypeMeta = MISSION_TYPE_META[mission.type];

  const handleComplete = () => {
    if (completeMission(mission.id, note.trim() || undefined)) {
      setJustCompleted(true);
      setNote('');
    }
  };

  return (
    <>
      <PageHeader title={mission.title} subtitle={mission.description} back="/missions" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-caption font-medium text-primary">
              <CatIcon size={14} aria-hidden="true" /> {CATEGORY_LABELS[mission.category]}
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-caption font-medium border border-border">{DIFFICULTY_LABELS[mission.difficulty]}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-caption font-medium">
              <TypeMeta.icon size={14} aria-hidden="true" /> {TypeMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-caption font-medium">
              <Clock size={14} aria-hidden="true" /> {mission.durationMinutes} นาที
            </span>
            <XPBadge amount={mission.xp} />
          </div>

          {mission.type === 'self-reported' && (
            <div className="flex items-start gap-2 rounded-control border border-warning/40 bg-warning/10 p-3 text-caption">
              <Info size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
              <p>ภารกิจนี้เป็นการรายงานด้วยตนเอง ระบบไม่ได้ตรวจจับหรือยืนยันการกระทำจริง กรุณากดยืนยันเมื่อคุณทำจริงแล้วเท่านั้น</p>
            </div>
          )}

          <Card>
            <SectionTitle title="วิธีทำ" icon={<BookOpen size={18} className="text-primary" aria-hidden="true" />} />
            <ol className="space-y-3">
              {mission.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-body">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>

          <Card tone="mint">
            <SectionTitle title="สิ่งที่ได้เรียนรู้" icon={<Lightbulb size={18} className="text-primary" aria-hidden="true" />} className="mb-2" />
            <p className="text-body">{mission.learningPoint}</p>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            {justCompleted ? (
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 14 }}
              >
                <EcoMascot size={112} mood="cheer" title="Sprouty ดีใจที่คุณทำภารกิจสำเร็จ" />
                <h2 className="mt-2 text-section font-semibold">ภารกิจสำเร็จ!</h2>
                <XPBadge amount={mission.xp} plus className="mt-2" />
                <p className="mt-2 text-caption text-muted">
                  {mission.repeatPolicy === 'daily' ? 'กลับมาทำได้อีกครั้งพรุ่งนี้' : 'ภารกิจนี้ทำได้ครั้งเดียว'}
                </p>
                <Link to="/missions" className={`${buttonClasses('secondary', 'md', true)} mt-4`}>เลือกภารกิจอื่น</Link>
              </motion.div>
            ) : canComplete ? (
              <>
                <label htmlFor="mission-note" className="mb-1.5 block text-caption font-semibold">บันทึกสั้น ๆ (ไม่บังคับ)</label>
                <textarea
                  id="mission-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เล่าสิ่งที่คุณทำ..."
                  rows={3}
                  maxLength={200}
                  className="w-full resize-none rounded-control border border-border bg-surface px-3 py-2 text-body placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <PrimaryButton size="lg" fullWidth className="mt-3" icon={<CheckCircle2 size={18} />} onClick={handleComplete}>
                  {mission.type === 'self-reported' ? 'ฉันทำภารกิจนี้แล้ว' : 'ทำภารกิจสำเร็จ'}
                </PrimaryButton>
                <p className="mt-2 text-center text-caption text-muted">
                  {mission.repeatPolicy === 'daily' ? 'ทำซ้ำได้วันละครั้ง' : 'ทำได้ครั้งเดียว'}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center py-2 text-center">
                <CheckCircle2 size={28} className="text-success" aria-hidden="true" />
                <p className="mt-2 text-body font-semibold">
                  {status === 'completed-once' ? 'คุณทำภารกิจนี้สำเร็จแล้ว' : 'ทำสำเร็จแล้ววันนี้'}
                </p>
                <p className="mt-1 text-caption text-muted">
                  {status === 'completed-once' ? 'ภารกิจนี้ทำได้ครั้งเดียว' : 'กลับมาทำใหม่ได้พรุ่งนี้'}
                </p>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
