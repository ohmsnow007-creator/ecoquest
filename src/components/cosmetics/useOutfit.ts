import { useGame } from '../../store/GameContext';
import { wearableOutfit, type Outfit, type OutfitTarget } from '../../data/cosmetics';
import type { PlayerProfile } from '../../types';

/** The outfit chosen for the character or for Sprouty (Sprouty mirrors the character until dressed separately). */
export function chosenOutfit(profile: PlayerProfile | null, target: OutfitTarget): Outfit | undefined {
  if (!profile) return undefined;
  const prefs = profile.preferences;
  return target === 'sprouty' ? (prefs.sproutyOutfit ?? prefs.outfit) : prefs.outfit;
}

/** What the character (default) or Sprouty is wearing right now (only items that are still unlocked). */
export function useOutfit(target: OutfitTarget = 'avatar'): Outfit {
  const { profile, progress } = useGame();
  return wearableOutfit(chosenOutfit(profile, target), progress, target);
}
