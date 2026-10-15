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
 * Waste and walking/cycling distance have no verified factor yet (TGO's CFO/CFP tables list fuels and
 * materials, not "km not driven" or "kg sorted"), so they stay as quantities only.
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
  {
    id: 'th-tap-water-mwa-cfp-2026',
    activityType: 'water-saved',
    unit: 'L',
    // TGO lists 0.7836 kgCO2e per m³; the app records litres, so it is divided by 1,000 (1 m³ = 1,000 L).
    kgCO2ePerUnit: 0.7836 / 1000,
    name: 'น้ำประปา การประปานครหลวง (0.7836 kgCO2e/m³ แปลงเป็นต่อลิตร)',
    publisher: 'องค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน) – TGO',
    source: 'ตาราง Emission Factor CFP ของ TGO ลำดับ 44 “น้ำประปา-การประปานครหลวง” (Thai National LCI Database, MTEC-NSTDA, Update April 2026)',
    sourceUrl: 'https://thaicarbonlabel.tgo.or.th/index.php?lang=TH&mod=Y0hKdlpIVmpkSE5mWlcxcGMzTnBiMjQ9',
    publisherUrl: 'https://thaicarbonlabel.tgo.or.th/',
    publishedDate: '2026-04-01',
    effectiveFrom: '2026-04-01',
    retrievedAt: '2026-10-15',
    isSample: false,
    caveat:
      'เป็นค่าการปล่อยตลอดการผลิตน้ำประปาของการประปานครหลวง (กรุงเทพฯ และปริมณฑล) ถ้าใช้น้ำของการประปาส่วนภูมิภาค ค่าจะต่ำกว่า (0.5167 kgCO2e/m³) ผลที่ได้เป็นค่าประมาณ ไม่ใช่การวัดจริง',
  },
];

export function getFactorFor(activityType: ImpactActivityType): EmissionFactor | undefined {
  return EMISSION_FACTORS.find((f) => f.activityType === activityType);
}

export function getFactorById(id: string | undefined): EmissionFactor | undefined {
  return id ? EMISSION_FACTORS.find((f) => f.id === id) : undefined;
}
