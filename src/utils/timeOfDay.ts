export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

/** Local clock → scene: 05–09 morning, 10–15 day, 16–18 evening, 19–04 night. */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 16) return 'day';
  if (hour >= 16 && hour < 19) return 'evening';
  return 'night';
}
