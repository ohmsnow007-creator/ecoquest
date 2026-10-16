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
  {
    id: 'stage-5',
    stage: 5,
    title: 'หมู่บ้านพลังงานสะอาด',
    description: 'กังหันลมหมุนบนเนินเขา บ้านหลังเล็กติดแผงโซลาร์ และสวนผักข้างบ้าน',
    requiredMissions: 40,
    unlockedMessage: 'หมู่บ้านพลังงานสะอาดเกิดขึ้นในโลกของคุณแล้ว',
  },
  {
    id: 'stage-6',
    stage: 6,
    title: 'ทะเลสาบแห่งชีวิต',
    description: 'บ่อน้ำกลายเป็นทะเลสาบ มีเป็ด ใบบัว ปลากระโดด และฝูงนกบินผ่าน',
    requiredMissions: 60,
    unlockedMessage: 'ทะเลสาบแห่งชีวิตเต็มไปด้วยสัตว์น้อยใหญ่',
  },
  {
    id: 'stage-7',
    stage: 7,
    title: 'ผืนป่าแห่งตำนาน',
    description: 'ต้นไม้ยักษ์อายุนับร้อยปี กวางป่า รุ้งคู่ และแสงระยิบระยับทั่วผืนป่า',
    requiredMissions: 90,
    unlockedMessage: 'สุดยอด! โลกของคุณกลายเป็นผืนป่าแห่งตำนาน',
  },
];
