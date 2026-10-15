import type { MissionCategory } from '../types';

export type HairStyle =
  | 'long' | 'sprout' | 'pigtails' | 'curly' | 'bob' | 'cap' | 'bun' | 'spiky'
  | 'ponytail' | 'wavy' | 'headscarf' | 'puffs' | 'undercut';

export type Accessory = 'none' | 'glasses' | 'headphones' | 'freckles';

export interface CharacterLook {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  pants: string;
  accent: string;
  accessory?: Accessory;
}

export interface AvatarCharacter {
  id: string;
  name: string;
  look: CharacterLook;
}

// Character art palette (illustration-only colors). IDs never change: saved profiles refer to them.
export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  { id: 'avatar-leaf', name: 'มินท์', look: { skin: '#FFE0CC', hair: '#FF8A3D', hairStyle: 'long', shirt: '#C2EDD5', pants: '#A9D4F5', accent: '#34C77B' } },
  { id: 'avatar-tree', name: 'ไบรท์', look: { skin: '#E8B48C', hair: '#4A2E22', hairStyle: 'sprout', shirt: '#FFD66B', pants: '#5B7BD6', accent: '#10B981' } },
  { id: 'avatar-flower', name: 'แพรวา', look: { skin: '#FFDCC5', hair: '#2B2B33', hairStyle: 'pigtails', shirt: '#F9C2D0', pants: '#7FB3E8', accent: '#E8487A' } },
  { id: 'avatar-earth', name: 'เจได', look: { skin: '#B9774F', hair: '#1F1A1C', hairStyle: 'curly', shirt: '#9CCBFF', pants: '#39506B', accent: '#059669' } },
  { id: 'avatar-water', name: 'มีน', look: { skin: '#F5C7A9', hair: '#B87B32', hairStyle: 'bob', shirt: '#A6E6E2', pants: '#4E6FA8', accent: '#2D9CDB', accessory: 'glasses' } },
  { id: 'avatar-sun', name: 'ซันนี่', look: { skin: '#E9AE84', hair: '#5A3A2E', hairStyle: 'cap', shirt: '#FFFFFF', pants: '#4C7A5A', accent: '#F59E0B' } },
  { id: 'avatar-rain', name: 'ปุยฝ้าย', look: { skin: '#FCE3D2', hair: '#7A4A2C', hairStyle: 'bun', shirt: '#D4C4FF', pants: '#8FA6C8', accent: '#7C5CE0' } },
  { id: 'avatar-mountain', name: 'ภูมิ', look: { skin: '#C98B62', hair: '#3B2A20', hairStyle: 'spiky', shirt: '#B2E8AD', pants: '#6B5B95', accent: '#15803D' } },
  { id: 'avatar-ocean', name: 'ไอวี่', look: { skin: '#FFE6D5', hair: '#C2563A', hairStyle: 'ponytail', shirt: '#BFE3FF', pants: '#3E5C8A', accent: '#0EA5E9' } },
  { id: 'avatar-cloud', name: 'เคน', look: { skin: '#F2C4A0', hair: '#26211F', hairStyle: 'undercut', shirt: '#E2E8F0', pants: '#334155', accent: '#22C55E', accessory: 'headphones' } },
  { id: 'avatar-river', name: 'ซาร่า', look: { skin: '#D9A07A', hair: '#2F7D6D', hairStyle: 'headscarf', shirt: '#FDE68A', pants: '#5B6B8C', accent: '#0F766E' } },
  { id: 'avatar-blossom', name: 'ลูกพีช', look: { skin: '#FFE3D3', hair: '#E5B35C', hairStyle: 'wavy', shirt: '#FFC9B5', pants: '#8EC5E8', accent: '#F97316', accessory: 'freckles' } },
  { id: 'avatar-moss', name: 'โกโก้', look: { skin: '#8D5A3B', hair: '#1C1412', hairStyle: 'puffs', shirt: '#C7F0B8', pants: '#4B5D7A', accent: '#EAB308' } },
  { id: 'avatar-sky', name: 'นาวา', look: { skin: '#F0BE98', hair: '#3A2C2A', hairStyle: 'bob', shirt: '#C4B5FD', pants: '#475569', accent: '#8B5CF6', accessory: 'headphones' } },
  { id: 'avatar-pine', name: 'ไทม์', look: { skin: '#FCD9BD', hair: '#8B5A2B', hairStyle: 'undercut', shirt: '#A7F3D0', pants: '#365A4B', accent: '#059669', accessory: 'freckles' } },
  { id: 'avatar-coral', name: 'ลีโอ', look: { skin: '#A86B47', hair: '#2A1D18', hairStyle: 'spiky', shirt: '#FDBA74', pants: '#1E3A5F', accent: '#EF4444', accessory: 'glasses' } },
];

export const DEFAULT_AVATAR_ID = AVATAR_CHARACTERS[0].id;

export function getCharacter(id: string | undefined): AvatarCharacter {
  return AVATAR_CHARACTERS.find((a) => a.id === id) ?? AVATAR_CHARACTERS[0];
}

export function isKnownAvatar(id: unknown): id is string {
  return typeof id === 'string' && AVATAR_CHARACTERS.some((a) => a.id === id);
}

export interface ProfileColor {
  id: string;
  label: string;
  className: string;
}

export const PROFILE_COLORS: ProfileColor[] = [
  { id: 'mint', label: 'เขียวมิ้นต์', className: 'bg-mint' },
  { id: 'lime', label: 'เขียวมะนาว', className: 'bg-lime' },
  { id: 'sky', label: 'ฟ้าท้องฟ้า', className: 'bg-tag-sky' },
  { id: 'peach', label: 'ส้มพีช', className: 'bg-tag-peach' },
  { id: 'lavender', label: 'ม่วงลาเวนเดอร์', className: 'bg-tag-lavender' },
  { id: 'yellow', label: 'เหลืองดอกไม้', className: 'bg-tag-yellow' },
];

export const DEFAULT_PROFILE_COLOR = PROFILE_COLORS[0].id;

export function getProfileColor(id: string | undefined): ProfileColor {
  return PROFILE_COLORS.find((c) => c.id === id) ?? PROFILE_COLORS[0];
}

export function isKnownProfileColor(id: unknown): id is string {
  return typeof id === 'string' && PROFILE_COLORS.some((c) => c.id === id);
}

export interface Interest {
  id: string;
  label: string;
  category: MissionCategory;
  tone: string;
}

const TONES = ['bg-tag-lavender', 'bg-mint', 'bg-tag-yellow', 'bg-tag-sky', 'bg-tag-peach', 'bg-lime'];

export const INTERESTS: Interest[] = (
  [
    ['goal-waste', 'ลดขยะ', 'waste'],
    ['goal-recycle', 'แยกขยะรีไซเคิล', 'waste'],
    ['goal-energy', 'ประหยัดไฟ', 'energy'],
    ['goal-water', 'ประหยัดน้ำ', 'water'],
    ['goal-transport', 'เดินทางสีเขียว', 'transport'],
    ['goal-bike', 'ปั่นจักรยาน', 'transport'],
    ['goal-plastic', 'ลดพลาสติก', 'consumption'],
    ['goal-local', 'กินอาหารท้องถิ่น', 'consumption'],
    ['goal-repair', 'ซ่อมแทนซื้อใหม่', 'consumption'],
    ['goal-nature', 'ปลูกต้นไม้', 'nature'],
    ['goal-animals', 'ดูแลสัตว์', 'nature'],
    ['goal-learn', 'เรียนรู้ธรรมชาติ', 'nature'],
  ] as const
).map(([id, label, category], i) => ({ id, label, category, tone: TONES[i % TONES.length] }));

export const MAX_INTERESTS = 5;

export function interestCategories(ids: string[]): Set<MissionCategory> {
  return new Set(INTERESTS.filter((i) => ids.includes(i.id)).map((i) => i.category));
}
