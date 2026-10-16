import { Lock, CheckCircle2, Info } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getWorldState, explainWorld } from '../utils/world';
import { getPlayerStats } from '../utils/playerStats';
import { worldStages } from '../data/worldStages';
import { GreenWorldScene } from '../components/world/GreenWorldScene';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressBar';
import { EcoMascot } from '../components/ui/EcoMascot';
import { SproutyTalk } from '../components/sprouty/PlayerSprouty';
import { useTimeOfDay } from '../components/sprouty/useTimeOfDay';
import { worldLine } from '../utils/sprouty';

export function VirtualWorld() {
  const { progress } = useGame();
  const stats = getPlayerStats(progress);
  const world = getWorldState(stats.missionsCompleted);
  const { current, next } = world;
  const line = worldLine(useTimeOfDay());

  return (
    <>
      <PageHeader title="โลกสีเขียวของฉัน" subtitle="โลกเสมือนเติบโตตามจำนวนภารกิจที่คุณทำสำเร็จ" />
      <SproutyTalk className="-mt-1 mb-4 max-w-md" text={line.text} mood={line.mood} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padded={false} className="overflow-hidden lg:col-span-2">
          <div className="relative h-60 sm:h-80">
            <GreenWorldScene key={current.stage} stage={current.stage} />
            <span className="absolute right-2 bottom-1">
              <EcoMascot size={72} mood={current.stage >= 3 ? 'cheer' : 'happy'} title="" />
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 sm:p-5">
            <ProgressRing value={world.progress} size={72} stroke={7} label="ความคืบหน้าสู่ระดับถัดไป">
              <span className="text-body font-bold">{Math.round(world.progress * 100)}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-caption text-muted">ระดับ {current.stage} จาก {worldStages.length - 1}</p>
              <h2 className="text-section font-bold text-forest">{current.title}</h2>
              <p className="text-caption text-muted">
                {next ? `อีก ${world.missionsToNext} ภารกิจถึง "${next.title}"` : 'โลกเสมือนของคุณเติบโตเต็มที่แล้ว'}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card tone="mint">
            <p className="text-body font-semibold">ทำไมโลกถึงเป็นแบบนี้</p>
            <p className="mt-1 text-body">{explainWorld(stats.missionsCompleted, stats.byCategory)}</p>
            <p className="mt-2 text-caption text-muted">{current.description}</p>
          </Card>
          <p className="flex items-start gap-2 px-1 text-caption text-muted">
            <Info size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            โลกเสมือนเป็นภาพจำลองเชิงสัญลักษณ์เพื่อสร้างแรงจูงใจ ไม่ได้แสดงว่ามีการลดคาร์บอนหรือฟื้นฟูธรรมชาติจริง
          </p>
        </div>

        <Card className="lg:col-span-3">
          <SectionTitle title="ระดับทั้งหมด" />
          <ol className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
            {worldStages.map((s) => {
              const unlocked = stats.missionsCompleted >= s.requiredMissions;
              const isCurrent = s.id === current.id;
              return (
                <li key={s.id} className={`rounded-control border p-3 ${isCurrent ? 'border-primary bg-pale-mint' : 'border-border bg-surface'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-2 text-body font-semibold ${unlocked ? '' : 'text-muted'}`}>
                      {unlocked ? <CheckCircle2 size={17} className="text-success" aria-hidden="true" /> : <Lock size={16} className="text-muted" aria-hidden="true" />}
                      {s.stage}. {s.title}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-muted">{s.requiredMissions === 0 ? 'จุดเริ่มต้น' : `ภารกิจสำเร็จ ${s.requiredMissions} ครั้ง`}</p>
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
