import type { ImpactActivityType, ImpactType, ImpactUnit, WasteType } from '../types';

export interface ImpactActivityMeta {
  type: ImpactActivityType;
  label: string;
  unit: ImpactUnit;
  unitLabel: string;
  help: string;
  max: number;
}

export const IMPACT_ACTIVITIES: ImpactActivityMeta[] = [
  { type: 'electricity-saved', label: 'ไฟฟ้าที่ประหยัดได้', unit: 'kWh', unitLabel: 'kWh (หน่วย)', help: 'ดูจากมิเตอร์ไฟฟ้าหรือเทียบบิลค่าไฟ 1 หน่วย = 1 kWh', max: 10000 },
  { type: 'water-saved', label: 'น้ำที่ประหยัดได้', unit: 'L', unitLabel: 'ลิตร', help: 'ประมาณจากภาชนะที่รู้ปริมาตร หรือเทียบมิเตอร์น้ำ (1 ลูกบาศก์เมตร = 1,000 ลิตร)', max: 1_000_000 },
  { type: 'waste-sorted', label: 'ขยะที่แยกได้', unit: 'kg', unitLabel: 'กิโลกรัม', help: 'ชั่งด้วยตาชั่งในบ้านก่อนนำไปทิ้งหรือขาย', max: 10000 },
  { type: 'low-carbon-distance', label: 'ระยะทางที่เดิน/ปั่นแทนรถ', unit: 'km', unitLabel: 'กิโลเมตร', help: 'ระยะทางจากแผนที่หรือแอปนับก้าว', max: 10000 },
  { type: 'electricity-usage', label: 'การใช้ไฟฟ้ารายเดือน (จากบิล)', unit: 'kWh', unitLabel: 'kWh (หน่วย)', help: 'ดูจำนวนหน่วยในบิลค่าไฟของเดือนนั้น ใช้เทียบก่อน-หลัง', max: 100000 },
];

export function getActivityMeta(type: ImpactActivityType): ImpactActivityMeta {
  return IMPACT_ACTIVITIES.find((a) => a.type === type)!;
}

export const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  plastic: 'พลาสติก',
  paper: 'กระดาษ',
  glass: 'แก้ว',
  metal: 'โลหะ',
  organic: 'เศษอาหาร/อินทรีย์',
  other: 'อื่น ๆ',
};

/** Which quantity a mission's impact can be logged as (used to link a completed mission to the log form). */
export const LOGGABLE_BY_IMPACT: Partial<Record<ImpactType, ImpactActivityType>> = {
  'energy-saving': 'electricity-saved',
  'water-saving': 'water-saved',
  'waste-reduction': 'waste-sorted',
  'emission-reduction': 'low-carbon-distance',
};
