import type { Badge, BadgeGroup } from '../types';

// IDs of badges that existed before are kept so previously unlocked badges stay unlocked.
export const badges: Badge[] = [
  // Missions
  { id: 'badge-first-mission', name: 'First Step', description: 'ก้าวแรกสู่การรักษ์โลก', icon: 'Sprout', group: 'missions', ruleType: 'total-completions', threshold: 1, rarity: 'common' },
  { id: 'badge-5-missions', name: 'Eco Explorer', description: 'นักสำรวจที่ลงมือทำจริง', icon: 'Compass', group: 'missions', ruleType: 'total-completions', threshold: 5, rarity: 'common' },
  { id: 'badge-15-missions', name: 'Eco Champion', description: 'ทำภารกิจอย่างตั้งใจจนเป็นนิสัย', icon: 'Shield', group: 'missions', ruleType: 'total-completions', threshold: 15, rarity: 'uncommon' },
  { id: 'badge-30-missions', name: 'Earth Guardian', description: 'ผู้พิทักษ์โลกตัวจริง', icon: 'Globe', group: 'missions', ruleType: 'total-completions', threshold: 30, rarity: 'rare' },
  { id: 'badge-50-missions', name: 'EcoQuest Legend', description: 'ตำนานแห่ง EcoQuest', icon: 'Crown', group: 'missions', ruleType: 'total-completions', threshold: 50, rarity: 'legendary' },
  { id: 'badge-waste-5', name: 'Recycling Hero', description: 'ฮีโร่แห่งการจัดการขยะ', icon: 'Recycle', group: 'missions', ruleType: 'category-completions', ruleCategory: 'waste', threshold: 5, rarity: 'uncommon' },
  { id: 'badge-energy-5', name: 'Energy Saver', description: 'นักประหยัดพลังงาน', icon: 'Zap', group: 'missions', ruleType: 'category-completions', ruleCategory: 'energy', threshold: 5, rarity: 'uncommon' },
  { id: 'badge-water-5', name: 'Water Keeper', description: 'ผู้รักษาสายน้ำ', icon: 'Droplets', group: 'missions', ruleType: 'category-completions', ruleCategory: 'water', threshold: 5, rarity: 'uncommon' },
  { id: 'badge-transport-5', name: 'Low-Carbon Traveler', description: 'นักเดินทางคาร์บอนต่ำ', icon: 'Bike', group: 'missions', ruleType: 'category-completions', ruleCategory: 'transport', threshold: 5, rarity: 'uncommon' },
  { id: 'badge-consumption-5', name: 'Mindful Consumer', description: 'ผู้บริโภคอย่างรู้คุณค่า', icon: 'ShoppingBag', group: 'missions', ruleType: 'category-completions', ruleCategory: 'consumption', threshold: 5, rarity: 'uncommon' },
  { id: 'badge-nature-5', name: 'Nature Lover', description: 'เพื่อนแท้ของธรรมชาติ', icon: 'TreePine', group: 'missions', ruleType: 'category-completions', ruleCategory: 'nature', threshold: 5, rarity: 'uncommon' },

  // Consistency
  { id: 'badge-streak-3', name: 'Consistent Hero', description: 'ทำต่อเนื่องจนเริ่มเป็นนิสัย', icon: 'Flame', group: 'consistency', ruleType: 'streak', threshold: 3, rarity: 'common' },
  { id: 'badge-streak-7', name: 'Green Week', description: 'ครบหนึ่งสัปดาห์สีเขียว', icon: 'CalendarCheck', group: 'consistency', ruleType: 'streak', threshold: 7, rarity: 'rare' },
  { id: 'badge-streak-30', name: 'Green Month', description: 'หนึ่งเดือนเต็มของความตั้งใจ', icon: 'CalendarHeart', group: 'consistency', ruleType: 'streak', threshold: 30, rarity: 'legendary' },

  // Learning
  { id: 'badge-quiz-1', name: 'Curious Mind', description: 'เริ่มต้นเรียนรู้เรื่องสิ่งแวดล้อม', icon: 'Lightbulb', group: 'learning', ruleType: 'quiz-correct', threshold: 1, rarity: 'common' },
  { id: 'badge-quiz-5', name: 'Knowledge Seeker', description: 'ผู้แสวงหาความรู้', icon: 'BookOpen', group: 'learning', ruleType: 'quiz-correct', threshold: 5, rarity: 'uncommon' },
  { id: 'badge-timed-8', name: 'Quick Thinker', description: 'ตอบไวและแม่นในควิซจับเวลา', icon: 'Timer', group: 'learning', ruleType: 'timed-best', threshold: 8, rarity: 'uncommon' },
  { id: 'badge-timed-15', name: 'Lightning Brain', description: 'สมองไวดั่งสายฟ้า', icon: 'Zap', group: 'learning', ruleType: 'timed-best', threshold: 15, rarity: 'epic' },
  { id: 'badge-quiz-15', name: 'Eco Scholar', description: 'ผู้รอบรู้เรื่องสิ่งแวดล้อม', icon: 'GraduationCap', group: 'learning', ruleType: 'quiz-correct', threshold: 15, rarity: 'epic' },

  // Virtual world
  { id: 'badge-world-2', name: 'Garden Starter', description: 'โลกเสมือนเริ่มมีต้นไม้และพุ่มไม้', icon: 'TreeDeciduous', group: 'world', ruleType: 'world-stage', threshold: 2, rarity: 'uncommon' },
  { id: 'badge-world-4', name: 'Ecosystem Builder', description: 'สร้างระบบนิเวศที่อุดมสมบูรณ์', icon: 'Mountain', group: 'world', ruleType: 'world-stage', threshold: 4, rarity: 'epic' },
];

export const BADGE_GROUP_LABELS: Record<BadgeGroup, string> = {
  missions: 'ภารกิจ',
  consistency: 'ความต่อเนื่อง',
  learning: 'การเรียนรู้',
  world: 'ดูแลโลกเสมือน',
};
