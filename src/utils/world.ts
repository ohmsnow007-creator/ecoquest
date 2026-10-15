import { worldStages } from '../data/worldStages';
import type { MissionCategory, WorldStage } from '../types';
import { CATEGORY_LABELS } from '../types';

export interface WorldState {
  current: WorldStage;
  next: WorldStage | null;
  progress: number;
  missionsToNext: number;
}

export function getWorldState(missionsCompleted: number): WorldState {
  let current = worldStages[0];
  for (const stage of worldStages) {
    if (missionsCompleted >= stage.requiredMissions) current = stage;
  }
  const next = worldStages.find((s) => s.requiredMissions > missionsCompleted) ?? null;
  const range = next ? next.requiredMissions - current.requiredMissions : 0;
  return {
    current,
    next,
    progress: next && range > 0 ? (missionsCompleted - current.requiredMissions) / range : 1,
    missionsToNext: next ? next.requiredMissions - missionsCompleted : 0,
  };
}

// Plain-language reason the world looks the way it does, built from the player's own records.
export function explainWorld(missionsCompleted: number, byCategory: Record<MissionCategory, number>): string {
  if (missionsCompleted === 0) return 'ยังไม่มีภารกิจที่สำเร็จ ทำภารกิจแรกเพื่อปลูกต้นกล้าต้นแรกในโลกของคุณ';
  const top = (Object.keys(byCategory) as MissionCategory[]).sort((a, b) => byCategory[b] - byCategory[a])[0];
  const topText = byCategory[top] > 0 ? ` ส่วนใหญ่เป็นหมวด${CATEGORY_LABELS[top]} (${byCategory[top]} ครั้ง)` : '';
  return `โลกของคุณเติบโตจากภารกิจที่ทำสำเร็จ ${missionsCompleted} ครั้ง${topText}`;
}
