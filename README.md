# EcoQuest — ภารกิจพิชิตโลกสีเขียว

แอปพลิเคชันเว็บสำหรับสร้างแรงบันดาลใจด้านสิ่งแวดล้อม ผ่านระบบ Gamification ที่ให้ผู้ใช้ทำภารกิจรักษ์โลก สะสม XP เลเวลอัป ปลดล็อกเหรียญตรา และฟื้นฟูโลกเสมือน

ผลงานโปรเจกต์มหาวิทยาลัย

## ฟีเจอร์หลัก

- **ภารกิจรักษ์โลก** — 18 ภารกิจใน 6 หมวดหมู่ (ขยะ, พลังงาน, น้ำ, การเดินทาง, การบริโภค, ธรรมชาติ)
- **ระบบ XP & เลเวล** — สะสมคะแนนจากการทำภารกิจ เลเวลอัปตามสูตร `XP = 50 * level^1.5`
- **Streak** — นับวันติดต่อกันที่ทำภารกิจอย่างน้อย 1 รายการ
- **เหรียญตรา** — 17 เหรียญตราจากทั่วไปถึงตำนาน ปลดล็อกจากความสำเร็จต่าง ๆ
- **โลกเสมือน** — SVG แสดงสถานะโลก 6 ระดับ จากรกร้างถึงอุทยานแห่งชีวิต
- **หน้าผลกระทบ** — สรุปกิจกรรมพร้อมข้อจำกัดและวิธีคำนวณ
- **ตั้งค่า** — แก้ไขโปรไฟล์, ส่งออก JSON, รีเซ็ตข้อมูล

## เทคโนโลยี

| เทคโนโลยี | เวอร์ชัน |
|---|---|
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| Tailwind CSS | 4 |
| React Router DOM | 7 |
| Lucide React | Icons |

## ติดตั้งและรัน

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# build สำหรับ production
npm run build

# preview production build
npm run preview

# ตรวจสอบ lint
npm run lint

# ตรวจสอบ TypeScript
npx tsc -b --noEmit
```

## โครงสร้างโปรเจกต์

```
src/
├── types/           # TypeScript types และ constants
├── data/            # ข้อมูล missions, badges, worldStages
├── utils/           # ฟังก์ชัน xp, streak, badges, world
├── services/        # storageService (LocalStorage)
├── store/           # GameContext (React Context API)
├── components/
│   ├── layout/      # AppShell, MobileNav
│   ├── feedback/    # Toast notifications
│   └── world/       # WorldPreview (SVG)
├── pages/           # หน้าทั้งหมด 9 หน้า
│   ├── Welcome      # Onboarding 3 ขั้นตอน
│   ├── Dashboard    # หน้าหลัก
│   ├── Missions     # รายการภารกิจ
│   ├── MissionDetail # รายละเอียดภารกิจ
│   ├── VirtualWorld # โลกเสมือน
│   ├── Achievements # เหรียญตรา
│   ├── Progress     # สถิติ
│   ├── Impact       # ผลกระทบ
│   └── Settings     # ตั้งค่า
├── App.tsx          # Routes และ providers
└── main.tsx         # Entry point
```

## สถาปัตยกรรม

- **State Management** — React Context API (`GameProvider`) จัดการ profile, progress, toast
- **Persistence** — LocalStorage ผ่าน `storageService` (centralized, ไม่เข้าถึงตรงจาก components)
- **Routing** — React Router DOM v7, protected routes redirect ไปหน้า Welcome ถ้ายังไม่มี profile
- **Mobile-first** — ออกแบบสำหรับ 375px เป็นหลัก, bottom navigation 5 แท็บ

## ข้อจำกัดและข้อควรทราบ

- ข้อมูลทั้งหมดเก็บใน LocalStorage ของเบราว์เซอร์ ไม่มี backend
- กิจกรรมชีวิตจริงเป็นแบบ **self-reported** — ระบบไม่ได้ตรวจจับการกระทำจริง
- ตัวชี้วัดเป็น **คะแนนกิจกรรม** ไม่ใช่ค่า CO2 ที่คำนวณได้แม่นยำ
- โลกเสมือนเป็นภาพจำลองเชิงสัญลักษณ์ ไม่ได้หมายความว่ามีการฟื้นฟูธรรมชาติจริง
- ไม่มีการส่งข้อมูลผู้ใช้ไปภายนอก
- ไม่มี API keys หรือ secrets ฝังใน client code

## Test Flows

1. **Welcome Flow** — สร้างโปรไฟล์ เลือก avatar และเป้าหมาย
2. **Mission Completion** — เปิดภารกิจ อ่านวิธีทำ กดยืนยัน ได้ XP
3. **XP & Level** — XP สะสม เลเวลอัปเมื่อถึงเกณฑ์
4. **Streak** — ทำภารกิจติดต่อกันหลายวัน
5. **Badge Unlock** — ทำตามเงื่อนไขเหรียญตรา ปลดล็อกอัตโนมัติ
6. **World Progression** — โลกเสมือนเปลี่ยนตาม XP สะสม
7. **Data Persistence** — ปิดเปิดเบราว์เซอร์ ข้อมูลยังอยู่
8. **Reset** — รีเซ็ตข้อมูลทั้งหมดจากหน้าตั้งค่า

## License

สงวนสิทธิ์สำหรับโปรเจกต์การศึกษา
