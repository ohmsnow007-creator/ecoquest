import { worldStages } from '../data/worldStages';
import type { WorldStage } from '../types';

export function getCurrentStage(totalXp: number): WorldStage {
  let current = worldStages[0];
  for (const stage of worldStages) {
    if (totalXp >= stage.requiredXp) {
      current = stage;
    } else {
      break;
    }
  }
  return current;
}

export function getNextStage(totalXp: number): WorldStage | null {
  for (const stage of worldStages) {
    if (totalXp < stage.requiredXp) {
      return stage;
    }
  }
  return null;
}

export function getStageProgress(totalXp: number): number {
  const current = getCurrentStage(totalXp);
  const next = getNextStage(totalXp);
  if (!next) return 1;
  const range = next.requiredXp - current.requiredXp;
  if (range <= 0) return 1;
  return (totalXp - current.requiredXp) / range;
}
