import type { WorldStage } from '../types';

// Stages advance on missions actually completed (not XP), so the world reflects things the player did.
export const worldStages: WorldStage[] = [
  {
    id: 'stage-0',
    stage: 0,
    title: 'พื้นที่เริ่มต้น',
    description: 'ผืนดินแห้งที่ยังรอการดูแล ทำภารกิจแรกเพื่อเริ่มปลูกต้นกล้า',
    requiredMissions: 0,
    unlockedMessage: 'เริ่มต้นการเดินทาง! พื้นที่นี้รอการฟื้นฟูจากคุณ',
  },
  {
    id: 'stage-1',
    stage: 1,
    title: 'เริ่มมีต้นกล้า',
    description: 'ดินเริ่มชุ่มชื้น หญ้าและต้นกล้าเล็ก ๆ ผุดขึ้นมา',
    requiredMissions: 1,
    unlockedMessage: 'ต้นกล้าแรกผุดขึ้นแล้วจากภารกิจแรกของคุณ',
  },
  {
    id: 'stage-2',
    stage: 2,
    title: 'ต้นไม้และพุ่มไม้',
    description: 'ต้นไม้ต้นแรกเติบโต มีพุ่มไม้และเนินหญ้าเขียว',
    requiredMissions: 5,
    unlockedMessage: 'ครบ 5 ภารกิจ ต้นไม้และพุ่มไม้เติบโตขึ้นแล้ว',
  },
  {
    id: 'stage-3',
    stage: 3,
    title: 'สวนสีเขียว',
    description: 'สวนเต็มไปด้วยดอกไม้ มีบ่อน้ำใส และผีเสื้อบินวนเวียน',
    requiredMissions: 12,
    unlockedMessage: 'สวนสีเขียวเบ่งบาน ผีเสื้อเริ่มกลับมา',
  },
  {
    id: 'stage-4',
    stage: 4,
    title: 'ระบบนิเวศอุดมสมบูรณ์',
    description: 'ป่าเขียวชอุ่ม มีลำธาร น้ำตก นก และสัตว์เล็ก ๆ อาศัยอยู่ร่วมกัน',
    requiredMissions: 25,
    unlockedMessage: 'โลกของคุณกลายเป็นระบบนิเวศที่อุดมสมบูรณ์แล้ว',
  },
];
