/**
 * Sample players for the offline leaderboard. They are NOT real users: every row is shown with a
 * "ข้อมูลตัวอย่าง" label, and these values never change at runtime so they can be checked.
 * Kept apart from player data; nothing here is ever saved to storage.
 */
export interface DemoPlayer {
  id: string;
  name: string;
  avatarId: string;
  profileColor: string;
  allTimeXp: number;
  weeklyXp: number;
  badgeCount: number;
  topBadge?: string;
  /** When the sample player reached their current total (used for the tie-breaker). */
  lastXpAt: string;
}

export const DEMO_PLAYERS: DemoPlayer[] = [
  { id: 'demo-earthlover', name: 'EarthLover (ตัวอย่าง)', avatarId: 'avatar-flower', profileColor: 'peach', allTimeXp: 2850, weeklyXp: 160, badgeCount: 9, topBadge: 'Green Week', lastXpAt: '2026-10-10T08:00:00.000Z' },
  { id: 'demo-sunflower', name: 'Sunflower (ตัวอย่าง)', avatarId: 'avatar-sun', profileColor: 'yellow', allTimeXp: 2640, weeklyXp: 210, badgeCount: 8, topBadge: 'Eco Champion', lastXpAt: '2026-10-11T08:00:00.000Z' },
  { id: 'demo-maxgreen', name: 'MaxGreen (ตัวอย่าง)', avatarId: 'avatar-mountain', profileColor: 'lime', allTimeXp: 2480, weeklyXp: 95, badgeCount: 7, lastXpAt: '2026-10-09T08:00:00.000Z' },
  { id: 'demo-baimai', name: 'ใบไม้เขียว (ตัวอย่าง)', avatarId: 'avatar-leaf', profileColor: 'mint', allTimeXp: 2320, weeklyXp: 140, badgeCount: 7, lastXpAt: '2026-10-12T08:00:00.000Z' },
  { id: 'demo-ecogirl', name: 'EcoGirl (ตัวอย่าง)', avatarId: 'avatar-rain', profileColor: 'lavender', allTimeXp: 2150, weeklyXp: 60, badgeCount: 6, lastXpAt: '2026-10-08T08:00:00.000Z' },
  { id: 'demo-fasai', name: 'ฟ้าใส (ตัวอย่าง)', avatarId: 'avatar-water', profileColor: 'sky', allTimeXp: 1980, weeklyXp: 120, badgeCount: 5, lastXpAt: '2026-10-07T08:00:00.000Z' },
  { id: 'demo-treebear', name: 'TreeBear (ตัวอย่าง)', avatarId: 'avatar-tree', profileColor: 'lime', allTimeXp: 1620, weeklyXp: 75, badgeCount: 4, lastXpAt: '2026-10-06T08:00:00.000Z' },
  { id: 'demo-zerowaste', name: 'ZeroWaste (ตัวอย่าง)', avatarId: 'avatar-earth', profileColor: 'mint', allTimeXp: 1480, weeklyXp: 120, badgeCount: 4, lastXpAt: '2026-10-05T08:00:00.000Z' },
  { id: 'demo-rakpa', name: 'รักป่า (ตัวอย่าง)', avatarId: 'avatar-mountain', profileColor: 'peach', allTimeXp: 640, weeklyXp: 40, badgeCount: 2, lastXpAt: '2026-10-04T08:00:00.000Z' },
  { id: 'demo-numfon', name: 'น้ำฝน (ตัวอย่าง)', avatarId: 'avatar-rain', profileColor: 'sky', allTimeXp: 210, weeklyXp: 20, badgeCount: 1, lastXpAt: '2026-10-03T08:00:00.000Z' },
];
