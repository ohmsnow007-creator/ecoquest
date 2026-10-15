// Central level table. Level N needs `minXp` total XP; the step to the next level grows as 50 × N^1.5.
export const MAX_LEVEL = 30;

const stepToNext = (level: number) => Math.floor(50 * Math.pow(level, 1.5));

const TITLES: { from: number; title: string }[] = [
  { from: 1, title: 'ต้นกล้า' },
  { from: 3, title: 'นักสำรวจสีเขียว' },
  { from: 5, title: 'นักอนุรักษ์' },
  { from: 8, title: 'ผู้พิทักษ์โลก' },
  { from: 12, title: 'แชมเปี้ยนสีเขียว' },
  { from: 18, title: 'ตำนานรักษ์โลก' },
];

export interface LevelConfig {
  level: number;
  minXp: number;
  title: string;
}

export const LEVELS: LevelConfig[] = (() => {
  const out: LevelConfig[] = [];
  let minXp = 0;
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const title = [...TITLES].reverse().find((t) => level >= t.from)!.title;
    out.push({ level, minXp, title });
    minXp += stepToNext(level);
  }
  return out;
})();

export function xpStepForLevel(level: number): number {
  return stepToNext(level);
}
