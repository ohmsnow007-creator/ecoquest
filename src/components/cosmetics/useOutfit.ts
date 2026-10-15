import { useGame } from '../../store/GameContext';
import { wearableOutfit, type Outfit } from '../../data/cosmetics';

/** What the current player is wearing right now (only items that are still unlocked). */
export function useOutfit(): Outfit {
  const { profile, progress } = useGame();
  return wearableOutfit(profile?.preferences.outfit, progress);
}
