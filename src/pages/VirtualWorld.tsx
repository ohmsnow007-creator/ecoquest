import { Lock, CheckCircle2, Info } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getCurrentStage, getNextStage, getStageProgress } from '../utils/world';
import { worldStages } from '../data/worldStages';
import { WorldPreview } from '../components/world/WorldPreview';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressBar';
import { EcoMascot } from '../components/ui/EcoMascot';

export function VirtualWorld() {
  const { progress } = useGame();
  const stage = getCurrentStage(progress.totalXp);
  const next = getNextStage(progress.totalXp);
  const pct = getStageProgress(progress.totalXp);
  const stageIdx = worldStages.indexOf(stage);

  return (
    <>
      <PageHeader title="โลกสีเขียวของฉัน" subtitle="โลกเสมือนเติบโตตาม XP ที่คุณสะสม" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padded={false} className="overflow-hidden lg:col-span-2">
          <div className="relative h-56 sm:h-72">
            <WorldPreview stage={stage.visualKey} />
            <div className="absolute bottom-3 left-3">
              <EcoMascot size={72} mood={stageIdx >= 3 ? 'cheer' : 'happy'} title="Sprouty ในโลกของคุณ" />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 sm:p-5">
            <ProgressRing value={pct} size={72} stroke={7} label="ความคืบหน้าสู่ระดับถัดไป">
              <span className="text-body font-bold">{Math.round(pct * 100)}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-caption text-muted">ระดับ {stageIdx + 1} จาก {worldStages.length}</p>
              <h2 className="text-section font-semibold">{stage.title}</h2>
              <p className="text-caption text-muted">
                {next ? `อีก ${next.requiredXp - progress.totalXp} XP ถึง "${next.title}"` : 'โลกเสมือนของคุณเติบโตเต็มที่แล้ว'}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card tone="mint">
            <p className="text-body">{stage.description}</p>
          </Card>
          <p className="flex items-start gap-2 px-1 text-caption text-muted">
            <Info size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            โลกเสมือนเป็นภาพจำลองเชิงสัญลักษณ์เพื่อสร้างแรงจูงใจ ไม่ได้หมายความว่ามีการฟื้นฟูธรรมชาติจริง
          </p>
        </div>

        <Card className="lg:col-span-3">
          <SectionTitle title="ระดับทั้งหมด" />
          <ol className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {worldStages.map((s, i) => {
              const unlocked = progress.totalXp >= s.requiredXp;
              const current = s.id === stage.id;
              return (
                <li key={s.id} className={`rounded-control border p-3 ${current ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-2 text-body font-semibold ${unlocked ? '' : 'text-muted'}`}>
                      {unlocked ? <CheckCircle2 size={17} className="text-success" aria-hidden="true" /> : <Lock size={16} className="text-muted" aria-hidden="true" />}
                      {i + 1}. {s.title}
                    </span>
                    <span className="text-caption text-muted">{s.requiredXp} XP</span>
                  </div>
                  <p className="mt-1 text-caption text-muted">{s.description}</p>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    </>
  );
}
