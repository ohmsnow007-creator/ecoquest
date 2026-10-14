import type { WorldStage } from '../types';

export const worldStages: WorldStage[] = [
  {
    id: 'stage-1',
    title: 'ดินแดนรกร้าง',
    description: 'พื้นที่เริ่มต้นที่ยังไม่ได้รับการดูแล ดินแห้งแล้ง ไม่มีสิ่งมีชีวิต',
    requiredXp: 0,
    visualKey: 'barren',
    unlockedMessage: 'เริ่มต้นการเดินทาง! พื้นที่นี้รอคอยการฟื้นฟูจากคุณ',
  },
  {
    id: 'stage-2',
    title: 'หน่อเล็ก ๆ',
    description: 'เริ่มมีหญ้าและต้นกล้าเล็ก ๆ ผุดขึ้นจากดิน',
    requiredXp: 50,
    visualKey: 'sprouts',
    unlockedMessage: 'ต้นกล้าแรกผุดขึ้นแล้ว! ความพยายามของคุณเริ่มเห็นผล',
  },
  {
    id: 'stage-3',
    title: 'สวนเขียวขจี',
    description: 'ต้นไม้เริ่มเติบโต มีดอกไม้บาน และผีเสื้อบินวนเวียน',
    requiredXp: 150,
    visualKey: 'garden',
    unlockedMessage: 'สวนเริ่มเขียวขจี! ผีเสื้อและแมลงเริ่มกลับมา',
  },
  {
    id: 'stage-4',
    title: 'ป่าน้อย',
    description: 'ต้นไม้ใหญ่ขึ้น สัตว์เล็ก ๆ อย่างกระรอกและนกเริ่มเข้ามาอาศัย',
    requiredXp: 350,
    visualKey: 'youngForest',
    unlockedMessage: 'ป่าน้อยก่อตัวขึ้น! นกและกระรอกมาสร้างรังแล้ว',
  },
  {
    id: 'stage-5',
    title: 'ป่าสมบูรณ์',
    description: 'ป่าหนาแน่น มีลำธาร สัตว์ป่าหลากหลายชนิด ระบบนิเวศสมดุล',
    requiredXp: 600,
    visualKey: 'matureForest',
    unlockedMessage: 'ป่าสมบูรณ์แล้ว! ลำธารไหลเย็น สัตว์ป่ามากมายอาศัยอยู่',
  },
  {
    id: 'stage-6',
    title: 'อุทยานแห่งชีวิต',
    description: 'ระบบนิเวศเขียวชอุ่มสมบูรณ์ เป็นแหล่งรวมความหลากหลายทางชีวภาพ',
    requiredXp: 1000,
    visualKey: 'paradise',
    unlockedMessage: 'ยอดเยี่ยม! คุณสร้างอุทยานแห่งชีวิตสำเร็จ! ระบบนิเวศสมบูรณ์แบบ',
  },
];
