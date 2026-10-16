import type { QuizCategory, QuizDifficulty } from '../types';

export type QuizOptionId = 'a' | 'b' | 'c' | 'd';

export interface QuizOption {
  id: QuizOptionId;
  text: string;
}

export interface QuizSource {
  name: string;
  url?: string;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  question: string;
  options: QuizOption[];
  correctAnswerId: QuizOptionId;
  explanation: string;
  /** Required whenever the question relies on a published figure or fact. */
  source?: QuizSource;
}

export const QUIZ_CATEGORY_LABELS: Record<QuizCategory, string> = {
  waste: 'การจัดการขยะ',
  energy: 'พลังงาน',
  water: 'น้ำ',
  carbon: 'คาร์บอนฟุตพรินต์',
  lifestyle: 'พฤติกรรมยั่งยืน',
};

export const QUIZ_DIFFICULTY_LABELS: Record<QuizDifficulty, string> = { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก' };

export const QUIZ_SET_SIZE = 10;
export const MINUTES_PER_QUESTION = 1;

const TGO_FACTOR: QuizSource = {
  name: 'องค์การบริหารจัดการก๊าซเรือนกระจก (TGO) – ค่า Emission Factor ไฟฟ้า 0.4750 kgCO₂e/kWh (ประกาศ พ.ย. 2568)',
  url: 'https://www.nationthailand.com/news/policy/40059019',
};

const o = (a: string, b: string, c: string, d: string): QuizOption[] => [
  { id: 'a', text: a },
  { id: 'b', text: b },
  { id: 'c', text: c },
  { id: 'd', text: d },
];

export const quizzes: QuizQuestion[] = [
  // Easy, everyday questions (no calculations) so everyone can enjoy each category.
  {
    id: 'q-easy-waste-01', category: 'waste', difficulty: 'easy',
    question: 'ขยะชิ้นไหนควรทิ้งลงถังสีเหลือง (ขยะรีไซเคิล)?',
    options: o('ขวดน้ำพลาสติก', 'เปลือกกล้วย', 'ทิชชู่ใช้แล้ว', 'ถ่านไฟฉาย'), correctAnswerId: 'a',
    explanation: 'ขวดพลาสติกรีไซเคิลได้ ส่วนเปลือกกล้วยเป็นขยะอินทรีย์ (ถังเขียว) ทิชชู่ใช้แล้วเป็นขยะทั่วไป (ถังน้ำเงิน) และถ่านไฟฉายเป็นขยะอันตราย (ถังแดง)',
    source: { name: 'กรมควบคุมมลพิษ – การคัดแยกขยะตามสีถัง' },
  },
  {
    id: 'q-easy-waste-02', category: 'waste', difficulty: 'easy',
    question: 'เปลือกกล้วยควรทิ้งลงถังสีอะไร?',
    options: o('ถังสีเขียว', 'ถังสีเหลือง', 'ถังสีน้ำเงิน', 'ถังสีแดง'), correctAnswerId: 'a',
    explanation: 'เปลือกผลไม้เป็นขยะอินทรีย์ ย่อยสลายได้ ทิ้งถังสีเขียว หรือนำไปทำปุ๋ยหมักได้',
    source: { name: 'กรมควบคุมมลพิษ – การคัดแยกขยะตามสีถัง' },
  },
  {
    id: 'q-easy-waste-03', category: 'waste', difficulty: 'easy',
    question: 'ไปซื้อของที่ตลาด วิธีไหนช่วยลดขยะพลาสติกได้?',
    options: o('ขอถุงพลาสติกเพิ่ม', 'พกถุงผ้าไปเอง', 'ซื้อของแยกใส่หลายถุง', 'ทิ้งถุงทันทีที่ถึงบ้าน'), correctAnswerId: 'b',
    explanation: 'พกถุงผ้าหรือถุงเดิมไปใช้ซ้ำ ช่วยลดถุงพลาสติกใช้ครั้งเดียวทิ้ง',
  },
  {
    id: 'q-easy-waste-04', category: 'waste', difficulty: 'easy',
    question: 'ก่อนทิ้งขวดน้ำพลาสติก ควรทำอะไรก่อน?',
    options: o('ใส่เศษอาหารลงไป', 'เทน้ำออกให้หมด', 'เผาให้ละลาย', 'ฝังดิน'), correctAnswerId: 'b',
    explanation: 'เทน้ำออกและบีบให้แบน ขวดจะสะอาด ไม่ส่งกลิ่น และรีไซเคิลได้ง่ายขึ้น',
  },
  {
    id: 'q-easy-energy-01', category: 'energy', difficulty: 'easy',
    question: 'เมื่อออกจากห้อง ควรทำอย่างไร?',
    options: o('เปิดไฟทิ้งไว้', 'ปิดไฟและพัดลม', 'เปิดแอร์ให้เย็นรอ', 'เปิดทีวีทิ้งไว้'), correctAnswerId: 'b',
    explanation: 'ปิดไฟและเครื่องใช้ไฟฟ้าเมื่อไม่มีคนใช้ เป็นวิธีประหยัดไฟที่ง่ายที่สุด',
  },
  {
    id: 'q-easy-energy-02', category: 'energy', difficulty: 'easy',
    question: 'แหล่งพลังงานใดเป็นพลังงานหมุนเวียน ใช้แล้วไม่หมดไป?',
    options: o('ถ่านหิน', 'น้ำมัน', 'แสงอาทิตย์', 'ก๊าซธรรมชาติ'), correctAnswerId: 'c',
    explanation: 'แสงอาทิตย์เป็นพลังงานหมุนเวียน ส่วนถ่านหิน น้ำมัน และก๊าซธรรมชาติเป็นเชื้อเพลิงฟอสซิลที่ใช้แล้วหมดไป',
  },
  {
    id: 'q-easy-energy-03', category: 'energy', difficulty: 'easy',
    question: 'ชาร์จมือถือเต็มแล้ว ควรทำอย่างไรกับที่ชาร์จ?',
    options: o('เสียบทิ้งไว้ทั้งคืน', 'ถอดปลั๊กออก', 'ชาร์จต่อไปเรื่อย ๆ', 'ไม่ต้องทำอะไร'), correctAnswerId: 'b',
    explanation: 'ที่ชาร์จที่เสียบทิ้งไว้ยังกินไฟเล็กน้อย ถอดปลั๊กช่วยประหยัดไฟและปลอดภัยกว่า',
  },
  {
    id: 'q-easy-energy-04', category: 'energy', difficulty: 'easy',
    question: 'วันที่แดดดี ตากผ้าแบบไหนประหยัดไฟที่สุด?',
    options: o('ใช้เครื่องอบผ้า', 'ตากแดดตามธรรมชาติ', 'เป่าด้วยไดร์เป่าผม', 'เปิดแอร์ให้ผ้าแห้ง'), correctAnswerId: 'b',
    explanation: 'แสงแดดและลมทำให้ผ้าแห้งได้ฟรีโดยไม่ใช้ไฟฟ้า',
  },
  {
    id: 'q-easy-water-01', category: 'water', difficulty: 'easy',
    question: 'ขณะแปรงฟัน ควรทำอย่างไรกับก๊อกน้ำ?',
    options: o('เปิดทิ้งไว้ตลอด', 'ปิดก๊อกไว้ เปิดเฉพาะตอนใช้', 'เปิดให้แรงที่สุด', 'เปิดน้ำอุ่น'), correctAnswerId: 'b',
    explanation: 'ปิดก๊อกระหว่างแปรงฟันช่วยไม่ให้น้ำสะอาดไหลทิ้งไปเปล่า ๆ',
  },
  {
    id: 'q-easy-water-02', category: 'water', difficulty: 'easy',
    question: 'ถ้าเห็นก๊อกน้ำรั่วหยดตลอด ควรทำอย่างไร?',
    options: o('ปล่อยไว้', 'แจ้งผู้ใหญ่หรือซ่อมให้เรียบร้อย', 'เอาผ้ามาปิด', 'เปิดให้แรงขึ้น'), correctAnswerId: 'b',
    explanation: 'น้ำที่หยดทีละนิดรวมกันทั้งวันเสียน้ำได้มาก ซ่อมก๊อกรั่วช่วยประหยัดน้ำ',
  },
  {
    id: 'q-easy-water-03', category: 'water', difficulty: 'easy',
    question: 'น้ำฝนที่รองเก็บไว้ นำไปใช้ทำอะไรได้ดี?',
    options: o('รดต้นไม้', 'ดื่มทันทีโดยไม่ต้มกรอง', 'เทลงท่อทิ้ง', 'ปล่อยให้ยุงวางไข่'), correctAnswerId: 'a',
    explanation: 'น้ำฝนใช้รดต้นไม้หรือทำความสะอาดได้ ช่วยประหยัดน้ำประปา และควรปิดฝาภาชนะกันยุง',
  },
  {
    id: 'q-easy-water-04', category: 'water', difficulty: 'easy',
    question: 'การอาบน้ำแบบไหนช่วยประหยัดน้ำ?',
    options: o('อาบนาน ๆ เปิดน้ำทิ้งไว้', 'อาบให้กระชับ ปิดน้ำระหว่างถูสบู่', 'เปิดน้ำทุกก๊อกพร้อมกัน', 'อาบหลายรอบต่อวัน'), correctAnswerId: 'b',
    explanation: 'อาบน้ำให้กระชับและปิดน้ำตอนถูสบู่ ช่วยลดน้ำที่ใช้ได้มาก',
  },
  {
    id: 'q-easy-carbon-01', category: 'carbon', difficulty: 'easy',
    question: 'สิ่งใดช่วยดูดซับก๊าซคาร์บอนไดออกไซด์จากอากาศ?',
    options: o('ต้นไม้', 'พลาสติก', 'รถยนต์', 'โฟม'), correctAnswerId: 'a',
    explanation: 'ต้นไม้ใช้คาร์บอนไดออกไซด์ในการสังเคราะห์แสง และเก็บคาร์บอนไว้ในลำต้น',
  },
  {
    id: 'q-easy-carbon-02', category: 'carbon', difficulty: 'easy',
    question: 'ข้อใดเป็นผลของภาวะโลกร้อน?',
    options: o('น้ำแข็งขั้วโลกละลาย', 'ต้นไม้ออกผลเป็นพลาสติก', 'ดวงจันทร์ใหญ่ขึ้น', 'วันหนึ่งยาวขึ้น'), correctAnswerId: 'a',
    explanation: 'โลกที่ร้อนขึ้นทำให้น้ำแข็งละลาย น้ำทะเลสูงขึ้น และอากาศแปรปรวนบ่อยขึ้น',
    source: { name: 'IPCC AR6 Synthesis Report (2023)' },
  },
  {
    id: 'q-easy-carbon-03', category: 'carbon', difficulty: 'easy',
    question: 'ข้อใดเป็นพลังงานสะอาด?',
    options: o('กังหันลม', 'ปล่องควันโรงงาน', 'การเผาขยะ', 'ท่อไอเสียรถ'), correctAnswerId: 'a',
    explanation: 'กังหันลมผลิตไฟฟ้าจากลม ไม่ต้องเผาเชื้อเพลิงระหว่างผลิตไฟ',
  },
  {
    id: 'q-easy-carbon-04', category: 'carbon', difficulty: 'easy',
    question: 'ข้อใดช่วยลดภาวะโลกร้อนได้?',
    options: o('เปิดไฟทิ้งไว้ทั้งวัน', 'ปลูกต้นไม้และประหยัดพลังงาน', 'เผาขยะในบ้าน', 'ใช้ของครั้งเดียวทิ้ง'), correctAnswerId: 'b',
    explanation: 'ปลูกต้นไม้และใช้พลังงานอย่างประหยัด ช่วยลดก๊าซเรือนกระจกได้',
  },
  {
    id: 'q-easy-life-01', category: 'lifestyle', difficulty: 'easy',
    question: 'ตักอาหารแบบไหนช่วยลดขยะอาหาร?',
    options: o('ตักเยอะ ๆ ไว้ก่อน', 'ตักพอดีกิน ไม่พอค่อยเติม', 'ตักทุกอย่างแล้วทิ้ง', 'กินคำเดียวพอ'), correctAnswerId: 'b',
    explanation: 'ตักแต่พอดีแล้วค่อยเติม ช่วยให้อาหารไม่เหลือทิ้ง',
  },
  {
    id: 'q-easy-life-02', category: 'lifestyle', difficulty: 'easy',
    question: 'เสื้อผ้าเก่าที่ยังใส่ได้ ควรทำอย่างไร?',
    options: o('ทิ้งถังขยะ', 'บริจาคหรือส่งต่อ', 'เผาทิ้ง', 'ทิ้งลงแม่น้ำ'), correctAnswerId: 'b',
    explanation: 'ส่งต่อให้คนอื่นใช้ช่วยลดขยะ และลดทรัพยากรที่ต้องใช้ผลิตเสื้อตัวใหม่',
  },
  {
    id: 'q-easy-life-03', category: 'lifestyle', difficulty: 'easy',
    question: 'ข้อใดเป็นการใช้ซ้ำ (Reuse)?',
    options: o('ใช้ขวดแก้วเก่าเป็นแจกันดอกไม้', 'ซื้อแก้วใหม่ทุกวัน', 'ทิ้งกล่องทันทีหลังใช้', 'ใช้ช้อนพลาสติกครั้งเดียว'), correctAnswerId: 'a',
    explanation: 'การใช้ซ้ำคือการนำของเดิมกลับมาใช้อีก เช่น ขวดแก้วเป็นแจกัน กล่องเป็นที่เก็บของ',
  },
  {
    id: 'q-easy-life-04', category: 'lifestyle', difficulty: 'easy',
    question: 'สัตว์ใดช่วยผสมเกสรดอกไม้ ทำให้พืชออกผล?',
    options: o('ผึ้ง', 'ปลาทอง', 'หนู', 'จระเข้'), correctAnswerId: 'a',
    explanation: 'ผึ้งและแมลงหลายชนิดช่วยผสมเกสร ทำให้ผักและผลไม้หลายชนิดออกผล',
  },
  // การจัดการขยะ
  {
    id: 'q-waste-01', category: 'waste', difficulty: 'medium',
    question: 'NOAA ประมาณว่าขวดพลาสติกเครื่องดื่มอาจใช้เวลาย่อยสลายในทะเลนานประมาณเท่าใด?',
    options: o('ประมาณ 10 ปี', 'ประมาณ 50 ปี', 'ประมาณ 450 ปี', 'ประมาณ 5,000 ปี'), correctAnswerId: 'c',
    explanation: 'เป็นค่าประมาณที่ขึ้นกับสภาพแวดล้อม และพลาสติกไม่ได้หายไปจริง แต่แตกตัวเป็นไมโครพลาสติก การลดการใช้ตั้งแต่ต้นทางจึงสำคัญ',
    source: { name: 'NOAA Marine Debris Program – “How Long Until It’s Gone?”' },
  },
  {
    id: 'q-waste-02', category: 'waste', difficulty: 'easy',
    question: 'สัญลักษณ์รีไซเคิลหมายเลข 1 (PET) มักพบบนบรรจุภัณฑ์ใด?',
    options: o('ถุงพลาสติกหูหิ้ว', 'ขวดน้ำดื่มใส', 'กล่องโฟม', 'ท่อน้ำ PVC'), correctAnswerId: 'b',
    explanation: 'PET (Polyethylene Terephthalate) ใช้ทำขวดน้ำดื่มและขวดน้ำอัดลมใส ส่วนโฟมคือหมายเลข 6 และ PVC คือหมายเลข 3',
    source: { name: 'ASTM D7611 – Resin Identification Coding System' },
  },
  {
    id: 'q-waste-04', category: 'waste', difficulty: 'easy',
    question: 'ก่อนทิ้งกล่องนมหรือขวดเครื่องดื่มลงถังรีไซเคิล ควรทำอย่างไร?',
    options: o('ทิ้งทั้งที่ยังมีน้ำเหลือ', 'เทให้หมด ล้างเล็กน้อย แล้วทำให้แห้ง', 'ใส่ถุงรวมกับเศษอาหาร', 'เผาก่อนทิ้ง'), correctAnswerId: 'b',
    explanation: 'บรรจุภัณฑ์ที่สะอาดและแห้งคัดแยกง่ายกว่า และไม่ทำให้วัสดุรีไซเคิลอื่นปนเปื้อน',
  },
  {
    id: 'q-waste-05', category: 'waste', difficulty: 'easy',
    question: 'ตามหลัก 3R ข้อใดช่วยลดขยะได้ดีที่สุด เพราะไม่เกิดขยะตั้งแต่แรก?',
    options: o('Reduce – ลดการใช้', 'Reuse – ใช้ซ้ำ', 'Recycle – นำกลับมาผลิตใหม่', 'ทิ้งรวมทุกอย่าง'), correctAnswerId: 'a',
    explanation: 'การลดตั้งแต่ต้นทางมาก่อนการใช้ซ้ำและการรีไซเคิล เพราะไม่ต้องใช้ทรัพยากรและพลังงานในการจัดการขยะเลย',
  },
  {
    id: 'q-waste-06', category: 'waste', difficulty: 'medium',
    question: 'เศษผักและเปลือกผลไม้เหมาะกับการจัดการแบบใดมากที่สุด?',
    options: o('ทิ้งรวมกับขวดพลาสติก', 'ทำปุ๋ยหมัก', 'เผาในบ้าน', 'ใส่ถุงพลาสติกหลายชั้น'), correctAnswerId: 'b',
    explanation: 'ขยะอินทรีย์ย่อยสลายได้และเปลี่ยนเป็นปุ๋ยหมักได้ ช่วยลดปริมาณขยะที่ต้องนำไปฝังกลบ',
  },
  {
    id: 'q-waste-07', category: 'waste', difficulty: 'medium',
    question: 'ถ่านไฟฉายและหลอดไฟที่ใช้แล้วควรทิ้งอย่างไร?',
    options: o('ทิ้งรวมกับขยะทั่วไป', 'ทิ้งลงท่อระบายน้ำ', 'แยกทิ้งในถังหรือจุดรับขยะอันตราย', 'ฝังดินในสวน'), correctAnswerId: 'c',
    explanation: 'ถ่านและหลอดไฟบางชนิดมีสารที่เป็นอันตรายต่อดินและน้ำ จึงควรแยกทิ้งให้ถูกนำไปจัดการเฉพาะทาง',
  },
  {
    id: 'q-waste-08', category: 'waste', difficulty: 'hard',
    question: 'ทำไมพลาสติกที่ปนเปื้อนเศษอาหารมากมักรีไซเคิลได้ยาก?',
    options: o('เพราะพลาสติกจะละลายทันที', 'เพราะต้องทำความสะอาดเพิ่มและคุณภาพวัสดุลดลง', 'เพราะเศษอาหารทำให้พลาสติกกลายเป็นแก้ว', 'เพราะผิดกฎหมายทุกกรณี'), correctAnswerId: 'b',
    explanation: 'การปนเปื้อนทำให้ต้องล้างและคัดแยกเพิ่ม และอาจทำให้วัสดุทั้งชุดคุณภาพต่ำจนนำไปผลิตใหม่ไม่ได้',
  },

  // พลังงาน
  {
    id: 'q-energy-01', category: 'energy', difficulty: 'medium',
    question: 'ในปี 2566 (2023) พลังงานหมุนเวียนชนิดใดผลิตไฟฟ้าได้มากที่สุดในโลก?',
    options: o('พลังงานแสงอาทิตย์', 'พลังงานลม', 'พลังงานน้ำ', 'พลังงานชีวมวล'), correctAnswerId: 'c',
    explanation: 'พลังงานน้ำยังเป็นแหล่งไฟฟ้าหมุนเวียนที่ใหญ่ที่สุดในปีนั้น แม้แสงอาทิตย์และลมจะเติบโตเร็วมาก',
    source: { name: 'International Energy Agency (IEA) – Renewables 2023' },
  },
  {
    id: 'q-energy-02', category: 'energy', difficulty: 'easy',
    question: 'หลอด LED 10 วัตต์ เปิด 8 ชั่วโมง ใช้ไฟฟ้ากี่หน่วย (kWh)?',
    options: o('0.08 หน่วย', '0.8 หน่วย', '8 หน่วย', '80 หน่วย'), correctAnswerId: 'a',
    explanation: '10 W × 8 ชม. = 80 Wh = 0.08 kWh ดูน้อย แต่ถ้าเปิดทิ้งทุกวันก็สะสมเป็นจำนวนมากได้',
  },
  {
    id: 'q-energy-03', category: 'energy', difficulty: 'easy',
    question: 'ถ้าเปิดต่อเนื่องนานเท่ากัน อุปกรณ์ใดใช้ไฟฟ้ามากที่สุด?',
    options: o('เครื่องปรับอากาศ 1,000 วัตต์', 'พัดลม 50 วัตต์', 'หลอด LED 10 วัตต์', 'ที่ชาร์จมือถือ 10 วัตต์'), correctAnswerId: 'a',
    explanation: 'พลังงานไฟฟ้า = กำลังไฟ (วัตต์) × เวลา อุปกรณ์ที่มีกำลังไฟสูงจึงใช้ไฟมากกว่าเมื่อเปิดนานเท่ากัน',
  },
  {
    id: 'q-energy-04', category: 'energy', difficulty: 'medium',
    question: 'การตั้งอุณหภูมิเครื่องปรับอากาศให้สูงขึ้นเล็กน้อยช่วยประหยัดไฟได้เพราะอะไร?',
    options: o('เครื่องปรับอากาศทำงานหนักน้อยลง', 'ทำให้ไฟฟ้าราคาถูกลง', 'ทำให้หลอดไฟดับเอง', 'ไม่มีผลใด ๆ'), correctAnswerId: 'a',
    explanation: 'เมื่อความต่างของอุณหภูมิในห้องกับค่าที่ตั้งน้อยลง คอมเพรสเซอร์ไม่ต้องทำงานหนักเท่าเดิม จึงใช้ไฟน้อยลง',
  },
  {
    id: 'q-energy-05', category: 'energy', difficulty: 'easy',
    question: '“1 หน่วย” ในบิลค่าไฟฟ้า เท่ากับเท่าใด?',
    options: o('1 วัตต์', '1 กิโลวัตต์-ชั่วโมง (kWh)', '1 แอมแปร์', '1 โวลต์'), correctAnswerId: 'b',
    explanation: 'ไฟฟ้า 1 หน่วยคือ 1 kWh เช่น อุปกรณ์ 1,000 วัตต์ เปิด 1 ชั่วโมง',
  },
  {
    id: 'q-energy-06', category: 'energy', difficulty: 'medium',
    question: 'ฉลากประหยัดไฟฟ้าเบอร์ 5 บนเครื่องใช้ไฟฟ้าบอกอะไร?',
    options: o('เป็นรุ่นที่ 5 ของสินค้า', 'มีประสิทธิภาพการใช้พลังงานสูงตามเกณฑ์', 'ใช้ไฟ 5 หน่วยต่อวัน', 'มีอายุการใช้งาน 5 ปี'), correctAnswerId: 'b',
    explanation: 'ฉลากเบอร์ 5 แสดงว่าเครื่องใช้ไฟฟ้าผ่านเกณฑ์ประสิทธิภาพพลังงาน ช่วยให้เลือกซื้อรุ่นที่ใช้ไฟน้อยกว่าได้',
    source: { name: 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (กฟผ.) – โครงการฉลากประหยัดไฟฟ้าเบอร์ 5' },
  },
  {
    id: 'q-energy-07', category: 'energy', difficulty: 'hard',
    question: 'พัดลม 50 วัตต์ เปิด 10 ชั่วโมงต่อวัน ใช้ไฟฟ้าวันละกี่หน่วย?',
    options: o('0.05 หน่วย', '0.5 หน่วย', '5 หน่วย', '50 หน่วย'), correctAnswerId: 'b',
    explanation: '50 W × 10 ชม. = 500 Wh = 0.5 kWh หรือ 0.5 หน่วยต่อวัน',
  },

  // น้ำ
  {
    id: 'q-water-01', category: 'water', difficulty: 'medium',
    question: 'น้ำจืดคิดเป็นประมาณกี่เปอร์เซ็นต์ของน้ำทั้งหมดบนโลก?',
    options: o('ประมาณ 3%', 'ประมาณ 15%', 'ประมาณ 30%', 'ประมาณ 50%'), correctAnswerId: 'a',
    explanation: 'น้ำส่วนใหญ่บนโลกเป็นน้ำเค็มในมหาสมุทร และน้ำจืดส่วนใหญ่อยู่ในรูปน้ำแข็งและน้ำใต้ดิน น้ำจืดที่ใช้ได้ง่ายจึงมีน้อยมาก',
    source: { name: 'U.S. Geological Survey (USGS) – Where is Earth’s Water?' },
  },
  {
    id: 'q-water-03', category: 'water', difficulty: 'easy',
    question: 'น้ำ 1 ลูกบาศก์เมตร (1 หน่วยในบิลค่าน้ำ) เท่ากับกี่ลิตร?',
    options: o('10 ลิตร', '100 ลิตร', '1,000 ลิตร', '10,000 ลิตร'), correctAnswerId: 'c',
    explanation: '1 ลูกบาศก์เมตร = 1,000 ลิตร ช่วยให้อ่านบิลค่าน้ำและประเมินการใช้น้ำของบ้านได้',
  },
  {
    id: 'q-water-04', category: 'water', difficulty: 'easy',
    question: 'การปิดก๊อกน้ำขณะแปรงฟันช่วยอะไรได้มากที่สุด?',
    options: o('ทำให้ฟันขาวขึ้น', 'ลดน้ำที่ไหลทิ้งโดยไม่ได้ใช้', 'ทำให้น้ำเย็นลง', 'เพิ่มแรงดันน้ำ'), correctAnswerId: 'b',
    explanation: 'น้ำที่ไหลระหว่างแปรงฟันส่วนใหญ่ไม่ได้ถูกใช้ การปิดก๊อกจึงลดน้ำทิ้งได้ทันที',
  },
  {
    id: 'q-water-05', category: 'water', difficulty: 'medium',
    question: 'ก๊อกน้ำรั่วจนเสียน้ำ 2 ลิตรต่อชั่วโมง ใน 1 วันจะเสียน้ำกี่ลิตร?',
    options: o('24 ลิตร', '48 ลิตร', '120 ลิตร', '200 ลิตร'), correctAnswerId: 'b',
    explanation: '2 ลิตร × 24 ชั่วโมง = 48 ลิตรต่อวัน การซ่อมจุดรั่วเล็ก ๆ จึงช่วยประหยัดน้ำได้มาก',
  },
  {
    id: 'q-water-06', category: 'water', difficulty: 'medium',
    question: 'น้ำที่ใช้ล้างผักผลไม้ (ไม่มีสบู่) นำไปใช้ต่อแบบใดเหมาะสม?',
    options: o('ใช้ดื่ม', 'ใช้รดน้ำต้นไม้', 'ใช้ปรุงอาหาร', 'ใช้ล้างแผล'), correctAnswerId: 'b',
    explanation: 'น้ำที่ใช้แล้วแต่ไม่มีสารเคมีสามารถนำไปรดน้ำต้นไม้ได้ เป็นการใช้น้ำซ้ำอย่างปลอดภัย',
  },
  {
    id: 'q-water-07', category: 'water', difficulty: 'hard',
    question: 'ฝักบัวไหล 8 ลิตรต่อนาที ถ้าลดเวลาอาบน้ำจาก 10 นาทีเหลือ 5 นาที จะประหยัดน้ำได้กี่ลิตรต่อครั้ง?',
    options: o('8 ลิตร', '20 ลิตร', '40 ลิตร', '80 ลิตร'), correctAnswerId: 'c',
    explanation: 'ลดลง 5 นาที × 8 ลิตร/นาที = 40 ลิตรต่อครั้ง (อัตราไหลจริงขึ้นกับฝักบัวแต่ละบ้าน)',
  },

  // คาร์บอนฟุตพรินต์
  {
    id: 'q-transport-01', category: 'carbon', difficulty: 'easy',
    question: 'การเดินทางระยะใกล้แบบใดไม่มีการเผาไหม้เชื้อเพลิงจากตัวยานพาหนะ?',
    options: o('ขับรถยนต์คนเดียว', 'นั่งแท็กซี่', 'เดินหรือปั่นจักรยาน', 'ขี่มอเตอร์ไซค์น้ำมัน'), correctAnswerId: 'c',
    explanation: 'การเดินและปั่นจักรยานใช้แรงคน ไม่มีไอเสียจากการเผาเชื้อเพลิงระหว่างเดินทาง',
  },
  {
    id: 'q-transport-02', category: 'carbon', difficulty: 'hard',
    question: 'จากข้อมูลปี 2016 ภาคการขนส่งปล่อยก๊าซเรือนกระจกประมาณกี่เปอร์เซ็นต์ของทั้งโลก?',
    options: o('ประมาณ 5%', 'ประมาณ 16%', 'ประมาณ 30%', 'ประมาณ 50%'), correctAnswerId: 'b',
    explanation: 'ภาคพลังงานโดยรวมปล่อยมากที่สุด และการขนส่งเป็นส่วนสำคัญราว 16% ของการปล่อยทั้งหมดในปีนั้น',
    source: { name: 'Our World in Data – Emissions by sector (ข้อมูล Climate Watch / WRI ปี 2016)' },
  },
  {
    id: 'q-carbon-01', category: 'carbon', difficulty: 'easy',
    question: 'หน่วย “CO₂e” หมายถึงอะไร?',
    options: o('ปริมาณออกซิเจนในอากาศ', 'ก๊าซเรือนกระจกหลายชนิดที่คิดเทียบเป็นคาร์บอนไดออกไซด์', 'ปริมาณฝุ่น PM2.5', 'อุณหภูมิเฉลี่ยของโลก'), correctAnswerId: 'b',
    explanation: 'ก๊าซเรือนกระจกแต่ละชนิดมีผลต่อโลกร้อนต่างกัน จึงแปลงให้อยู่ในหน่วยเดียวกันคือคาร์บอนไดออกไซด์เทียบเท่า',
  },
  {
    id: 'q-carbon-02', category: 'carbon', difficulty: 'medium',
    question: '“คาร์บอนฟุตพรินต์ของผลิตภัณฑ์” คืออะไร?',
    options: o('น้ำหนักของผลิตภัณฑ์', 'ปริมาณก๊าซเรือนกระจกที่ปล่อยตลอดวัฏจักรชีวิตของผลิตภัณฑ์', 'จำนวนต้นไม้ที่ใช้ผลิต', 'ราคาของผลิตภัณฑ์'), correctAnswerId: 'b',
    explanation: 'คิดตั้งแต่การได้มาซึ่งวัตถุดิบ การผลิต การขนส่ง การใช้งาน จนถึงการจัดการซาก',
    source: { name: 'องค์การบริหารจัดการก๊าซเรือนกระจก (TGO) – คาร์บอนฟุตพริ้นท์ของผลิตภัณฑ์' },
  },
  {
    id: 'q-carbon-03', category: 'carbon', difficulty: 'hard',
    question: 'ใช้ค่า Emission Factor ไฟฟ้าของ TGO = 0.4750 kgCO₂e/kWh ถ้าประหยัดไฟได้ 10 หน่วย จะหลีกเลี่ยงการปล่อยได้ประมาณเท่าไร?',
    options: o('0.475 kgCO₂e', '4.75 kgCO₂e', '47.5 kgCO₂e', '475 kgCO₂e'), correctAnswerId: 'b',
    explanation: '10 kWh × 0.4750 kgCO₂e/kWh = 4.75 kgCO₂e เป็นค่าประมาณจากค่าเฉลี่ยของระบบไฟฟ้า ไม่ใช่การวัดจริง',
    source: TGO_FACTOR,
  },
  {
    id: 'q-carbon-04', category: 'carbon', difficulty: 'medium',
    question: 'หน่วยงานใดของไทยดูแลการรับรองฉลากคาร์บอนฟุตพริ้นท์ของผลิตภัณฑ์?',
    options: o('การประปานครหลวง', 'องค์การบริหารจัดการก๊าซเรือนกระจก (TGO)', 'กรมอุตุนิยมวิทยา', 'การท่าเรือแห่งประเทศไทย'), correctAnswerId: 'b',
    explanation: 'TGO ดูแลโครงการฉลากคาร์บอนฟุตพริ้นท์และเผยแพร่ค่า Emission Factor สำหรับการคำนวณในประเทศไทย',
    source: { name: 'องค์การบริหารจัดการก๊าซเรือนกระจก (TGO) – โครงการฉลากคาร์บอน' },
  },
  {
    id: 'q-carbon-05', category: 'carbon', difficulty: 'medium',
    question: 'ทำไมรถไฟฟ้าและรถโดยสารสาธารณะมักปล่อยก๊าซต่อคนน้อยกว่ารถยนต์ส่วนตัว?',
    options: o('เพราะวิ่งช้ากว่าเสมอ', 'เพราะขนผู้โดยสารจำนวนมากในเที่ยวเดียว', 'เพราะไม่ใช้พลังงานเลย', 'เพราะสร้างจากโลหะ'), correctAnswerId: 'b',
    explanation: 'พลังงานที่ใช้ต่อเที่ยวถูกแบ่งให้ผู้โดยสารหลายคน การปล่อยต่อคนต่อกิโลเมตรจึงมักต่ำกว่าการขับรถคนเดียว',
  },

  // พฤติกรรมยั่งยืน
  {
    id: 'q-consumption-01', category: 'lifestyle', difficulty: 'hard',
    question: 'WWF ประมาณว่าการผลิตเสื้อยืดผ้าฝ้าย 1 ตัว ต้องใช้น้ำประมาณเท่าใด?',
    options: o('ประมาณ 100 ลิตร', 'ประมาณ 700 ลิตร', 'ประมาณ 2,700 ลิตร', 'ประมาณ 10,000 ลิตร'), correctAnswerId: 'c',
    explanation: 'น้ำส่วนใหญ่ใช้ในการปลูกฝ้าย การใช้เสื้อผ้าให้นานขึ้นหรือซื้อมือสองช่วยลดความต้องการทรัพยากรนี้',
    source: { name: 'WWF – The Impact of a Cotton T-Shirt (2013)' },
  },
  {
    id: 'q-consumption-02', category: 'lifestyle', difficulty: 'medium',
    question: 'FAO ประเมินว่าอาหารที่ผลิตเพื่อการบริโภคทั่วโลกสูญเสียหรือถูกทิ้งประมาณเท่าใด?',
    options: o('ประมาณ 1 ใน 10', 'ประมาณ 1 ใน 5', 'ประมาณ 1 ใน 3', 'ประมาณครึ่งหนึ่ง'), correctAnswerId: 'c',
    explanation: 'การตักอาหารแต่พอดีและวางแผนการซื้อช่วยลดอาหารเหลือทิ้งได้',
    source: { name: 'FAO – Global Food Losses and Food Waste (2011)' },
  },
  {
    id: 'q-nature-03', category: 'lifestyle', difficulty: 'medium',
    question: 'สัตว์ผสมเกสร เช่น ผึ้ง สำคัญต่ออาหารของมนุษย์อย่างไร?',
    options: o('ช่วยให้พืชอาหารหลักหลายชนิดติดผลได้ดีขึ้น', 'ช่วยผลิตปุ๋ยเคมี', 'ช่วยกำจัดวัชพืชทั้งหมด', 'ไม่มีผลต่ออาหาร'), correctAnswerId: 'a',
    explanation: 'IPBES รายงานว่าพืชอาหารหลักของโลกราว 3 ใน 4 ชนิดได้ประโยชน์จากสัตว์ผสมเกสร การปลูกดอกไม้และลดยาฆ่าแมลงจึงช่วยได้',
    source: { name: 'IPBES – Assessment Report on Pollinators, Pollination and Food Production (2016)' },
  },
  {
    id: 'q-life-01', category: 'lifestyle', difficulty: 'easy',
    question: 'ข้อใดเป็นการลดพลาสติกแบบใช้ครั้งเดียวทิ้ง?',
    options: o('พกกระบอกน้ำส่วนตัว', 'ซื้อน้ำขวดเล็กหลายขวด', 'ขอหลอดเพิ่ม', 'ห่อของด้วยถุงพลาสติกหลายชั้น'), correctAnswerId: 'a',
    explanation: 'กระบอกน้ำใช้ซ้ำได้หลายครั้ง แทนขวดและแก้วที่ใช้เพียงครั้งเดียวแล้วกลายเป็นขยะ',
  },
  {
    id: 'q-life-02', category: 'lifestyle', difficulty: 'easy',
    question: 'การซ่อมของใช้แทนการซื้อใหม่ช่วยสิ่งแวดล้อมอย่างไร?',
    options: o('เพิ่มขยะ', 'ลดการใช้ทรัพยากรผลิตของใหม่และลดขยะ', 'ทำให้ของพังเร็วขึ้น', 'ไม่มีผลใด ๆ'), correctAnswerId: 'b',
    explanation: 'ของที่ใช้ได้นานขึ้นแปลว่าต้องผลิตของใหม่น้อยลง และมีของถูกทิ้งเป็นขยะน้อยลง',
  },
  {
    id: 'q-life-03', category: 'lifestyle', difficulty: 'medium',
    question: 'การเลือกซื้อผักผลไม้ตามฤดูกาลจากแหล่งใกล้บ้านมักช่วยในเรื่องใด?',
    options: o('เพิ่มระยะทางขนส่ง', 'ลดระยะทางขนส่งและการเก็บรักษานาน', 'ทำให้ต้องใช้บรรจุภัณฑ์มากขึ้น', 'ทำให้อาหารเสียเร็วขึ้นเสมอ'), correctAnswerId: 'b',
    explanation: 'สินค้าท้องถิ่นตามฤดูกาลมักเดินทางสั้นกว่าและไม่ต้องเก็บรักษานาน แต่ผลจริงขึ้นกับวิธีผลิตและขนส่งของแต่ละสินค้า',
  },
];

export function getQuestion(id: string): QuizQuestion | undefined {
  return quizzes.find((q) => q.id === id);
}
