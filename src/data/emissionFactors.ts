import type { ImpactActivityType, ImpactUnit } from '../types';

export interface EmissionFactor {
  id: string;
  activityType: ImpactActivityType;
  unit: ImpactUnit;
  kgCO2ePerUnit: number;
  name: string;
  publisher: string;
  source: string;
  sourceUrl: string;
  publisherUrl: string;
  publishedDate: string;
  effectiveFrom: string;
  retrievedAt: string;
  /** Always false here: sample or made-up factors are not allowed in this registry. */
  isSample: false;
  caveat: string;
}

/*
 * Only factors with a traceable publisher, value and date are listed. Activities without a verified
 * factor are still shown as quantities, but no CO2e is calculated for them.
 * Candidate to verify before adding: TGO tap-water factor (0.7948 kgCO2e/m³, seen on TGO's official
 * Facebook page without a publication date).
 */
export const EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'th-grid-electricity-scope2-2026',
    activityType: 'electricity-saved',
    unit: 'kWh',
    kgCO2ePerUnit: 0.475,
    name: 'ค่าการปล่อยก๊าซเรือนกระจกจากการใช้ไฟฟ้า (Scope 2) ประเทศไทย',
    publisher: 'องค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน) – TGO',
    source: 'ประกาศ Emission Factor ไฟฟ้าของ TGO รายงานโดย The Nation (30 พ.ย. 2568)',
    sourceUrl: 'https://www.nationthailand.com/news/policy/40059019',
    publisherUrl: 'https://www.tgo.or.th/2023/index.php/th/page/emission-factor-10',
    publishedDate: '2025-11-30',
    effectiveFrom: '2026-01-01',
    retrievedAt: '2026-10-15',
    isSample: false,
    caveat: 'เป็นค่าเฉลี่ยของไฟฟ้าจากระบบสายส่ง ผลที่ได้คือค่าประมาณของการปล่อยที่หลีกเลี่ยงได้ ไม่ใช่การวัดจริง',
  },
];

export function getFactorFor(activityType: ImpactActivityType): EmissionFactor | undefined {
  return EMISSION_FACTORS.find((f) => f.activityType === activityType);
}

export function getFactorById(id: string | undefined): EmissionFactor | undefined {
  return id ? EMISSION_FACTORS.find((f) => f.id === id) : undefined;
}
