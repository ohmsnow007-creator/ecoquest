# EcoQuest — ภารกิจพิชิตโลกสีเขียว

เว็บแอปเกมมิฟิเคชันส่งเสริมพฤติกรรมรักษ์สิ่งแวดล้อม (React + TypeScript) ผลงานโปรเจกต์มหาวิทยาลัย
ทำงานแบบผู้เล่นคนเดียวบนอุปกรณ์เดียว ไม่มีเซิร์ฟเวอร์

## ฟีเจอร์

| หน้า | Route | สรุป |
|---|---|---|
| Welcome / สร้างโปรไฟล์ | `/welcome`, `/welcome/profile` | Splash, Onboarding, สร้างโปรไฟล์ 3 ขั้น (อวาตาร์ 8 ตัว) |
| My Green World | `/home` | Dashboard: Level/XP, ภารกิจแนะนำ, โลกสีเขียว, กิจกรรมล่าสุด |
| Eco Missions | `/missions`, `/missions/:id` | ภารกิจ 24 รายการ 6 หมวด ค้นหา/กรอง, เริ่ม → ยืนยันว่าทำสำเร็จ |
| โลกของฉัน | `/world` | โลกเติบโตตามจำนวนภารกิจที่ทำจริง |
| Achievements | `/achievements` | เหรียญ 19 รายการ พร้อมเงื่อนไขและวันที่ปลดล็อก |
| Green Impact | `/impact` | บันทึกกิจกรรม (self-reported) คำนวณ CO2e เฉพาะที่มีค่าอ้างอิง |
| Eco Quiz | `/quiz`, `/quiz/result` | คำถาม 33 ข้อพร้อมเฉลยและแหล่งอ้างอิง |
| Leaderboard | `/leaderboard` | อันดับรายสัปดาห์/ทั้งหมด (ผู้เล่นอื่นเป็นข้อมูลตัวอย่าง) |
| Profile | `/profile` | สถิติ ประวัติ แก้ไขชื่อ/อวาตาร์ |
| Settings | `/settings` | ความชอบ เสียง/การเคลื่อนไหว ส่งออก/รีเซ็ตข้อมูล แหล่งอ้างอิง |
| ติดตั้ง & ออฟไลน์ | `/install` | ปุ่มติดตั้ง (เมื่อเบราว์เซอร์รองรับ) หรือขั้นตอนตามเบราว์เซอร์ และสถานะออฟไลน์ |
| สถิติ | `/progress` | กราฟและประวัติทั้งหมด |

Route ที่ไม่มีอยู่จะแสดงหน้า "ไม่พบหน้านี้" Route ที่ต้องมีโปรไฟล์จะพาไป `/welcome` เมื่อยังไม่มีโปรไฟล์

## เริ่มใช้งาน

```bash
npm install
npm run dev        # http://localhost:5173/ecoquest/
npm test           # Vitest
npm run lint       # oxlint
npm run build      # tsc -b แล้ว vite build
npm run preview    # เปิด build จริง (ใช้ทดสอบ Service Worker/ออฟไลน์)
```

เข้าจากมือถือในวง Wi-Fi เดียวกัน: เปิด `http://<IP-ของ-PC>:5173/ecoquest/`
หมายเหตุ: ผ่าน HTTP บน IP ในวง LAN เบราว์เซอร์จะไม่เปิด Service Worker (ต้องเป็น HTTPS หรือ localhost) แอปยังใช้ได้ แต่ไม่มีแคชออฟไลน์และติดตั้งแบบ PWA ไม่ได้

## Tech Stack

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4 · React Router 7 (HashRouter) · Framer Motion · Recharts · Lucide · vite-plugin-pwa (Workbox) · Vitest + Testing Library

## สถาปัตยกรรม

```
src/
├── App.tsx, main.tsx        # Router, providers, ลงทะเบียน Service Worker
├── config/                  # ค่ากลาง: levels.ts (30 เลเวล), quizResults.ts, app.ts
├── data/                    # นิยามคงที่: missions, badges, quizzes, emissionFactors, demoLeaderboard ...
├── services/
│   ├── storageService.ts    # จุดเดียวที่แตะ localStorage: อ่าน/ตรวจสอบ/ย้าย schema/บันทึก/ส่งออก/รีเซ็ต
│   ├── rewardService.ts     # ประเมินรางวัลภารกิจและควิซ (pure) → state ถัดไปทั้งก้อน
│   ├── impactCalculator.ts  # คำนวณ CO2e จาก factor ที่มีแหล่งอ้างอิงเท่านั้น
│   ├── leaderboardService.ts# interface สำหรับต่อ backend ในอนาคต + เวอร์ชัน local/demo
│   ├── pwaService.ts        # สถานะติดตั้ง/Service Worker/ออนไลน์
│   └── soundService.ts
├── store/GameContext.tsx    # state กลางของทั้งแอป; ทุกหน้าอ่าน/เขียนผ่านที่นี่
├── utils/                   # xp, badges, activity, playerStats, streak, world, ...
├── components/{layout,ui,feedback,illustrations,impact}/
├── pages/                   # 1 ไฟล์ต่อ 1 หน้า (lazy-loaded)
└── test/                    # unit + integration + end-to-end flows
```

โครงสร้างไฟล์ไม่ได้ย้ายตามรายการแนะนำในสเปกทุกชื่อ แต่แยกหน้าที่ตามหลักเดียวกัน (นิยามข้อมูล / service / state / UI)

### ระบบหลัก (สเปกส่วนที่ 4)

| ระบบ | ที่อยู่ | หมายเหตุ |
|---|---|---|
| Player Store | `PlayerProfile` + `PlayerProgress` | เก็บ id, ชื่อ, อวาตาร์, createdAt/updatedAt, preferences, totalXp — **ไม่เก็บ Level** (คำนวณจาก XP) |
| Mission Store | `data/missions.ts` แยกจาก `progress.inProgress` / `progress.completions` | completion แต่ละรายการมี event id ของตัวเอง |
| Reward Service | `rewardService.evaluate*` → `GameContext.applyReward` | ตรวจ event → กันรับซ้ำ → สร้าง record → XP → Level → Achievement → บันทึก **ก่อน** อัปเดตหน้าจอ ถ้าบันทึกไม่สำเร็จจะไม่มีอะไรเปลี่ยน (ไม่มีครึ่งสำเร็จ) |
| XP & Level | `config/levels.ts` + `utils/xp.ts` | ตารางเดียว ทดสอบ XP=0, ก่อนเกณฑ์, ตรงเกณฑ์, ข้ามหลายเลเวล, XP มหาศาล |
| Achievement | `utils/badges.ts` | ตรวจหลัง event, บันทึกครั้งเดียวพร้อมวันที่, เปิดหน้าซ้ำไม่แจ้งเตือนซ้ำ |
| Activity History | `utils/activity.ts` | สร้างจาก record ที่บันทึกจริง ทุกรายการมี id เรียงใหม่→เก่า ไม่เก็บข้อมูลอ่อนไหว |
| Storage | `storageService` | ไม่มี component ใดเขียน localStorage โดยตรง |
| Migration | `schemaVersion` + `sanitize*` | ตรวจทุก field ก่อนใช้, ข้าม record เสีย, ย้ายข้อมูลควิซรุ่นเก่า, JSON เสียจะถูกสำรองไว้ที่ `<key>_corrupt_backup` แทนการเขียนทับ |
| State Sync | `GameContext` + `utils/playerStats.ts` | ทุกหน้าใช้ตัวเลขจากแหล่งเดียวกัน |

ชื่อเมธอดที่สเปกยกตัวอย่าง (getPlayer, completeMission, saveQuizAttempt …) ตรงกับ: `storageService.getProfile/getProgress/saveProfile/saveProgress/exportData/resetAll` และ `useGame().updateProfile/completeMission/submitQuizAttempt/addImpactRecord/resetProgress`

## PWA และออฟไลน์

- Manifest: ชื่อเต็ม/สั้น, theme/background color, `display: standalone`, ไอคอน PNG 64/192/512 + maskable + apple-touch-icon (สร้างใหม่ได้ด้วย `npm run generate-pwa-assets`)
- Service Worker (Workbox): precache app shell และ static assets, fallback ไป `index.html`, ลบแคชเวอร์ชันเก่าอัตโนมัติ, ฟอนต์ Google แคชแยกชื่อ `ecoquest-font-*-v1`
- **ไม่แคชข้อมูลผู้เล่น** — ข้อมูลอยู่ใน localStorage เท่านั้น Service Worker แคชเฉพาะไฟล์ของแอป
- เมื่อมีเวอร์ชันใหม่ แอปแสดงแถบ "มีเวอร์ชันใหม่" ให้ผู้ใช้กดอัปเดตเอง (ไม่โหลดใหม่กลางภารกิจ)
- ปุ่มติดตั้งแสดงเฉพาะเมื่อเบราว์เซอร์ส่ง `beforeinstallprompt` จริง และขึ้นว่า "ติดตั้งแล้ว" เฉพาะเมื่อได้ `appinstalled` หรือเปิดในโหมดแอป
- Service Worker ไม่ทำงานใน `npm run dev` ให้ทดสอบด้วย `npm run build && npm run preview`

## ข้อจำกัด (Local Demo Limitations)

- **ผู้ใช้คนเดียว ต่ออุปกรณ์ ต่อเบราว์เซอร์** — ข้อมูลอยู่ใน localStorage
- **ข้อมูลหายได้** เมื่อเคลียร์ข้อมูลเบราว์เซอร์, ใช้โหมดไม่ระบุตัวตน หรือเบราว์เซอร์ลบพื้นที่เก็บข้อมูลเอง ใช้ "ส่งออกข้อมูล (JSON)" ในหน้าตั้งค่าเพื่อสำรอง (ยังไม่มีการนำเข้า)
- **ไม่มีการซิงก์ข้ามอุปกรณ์** และไม่มีบัญชีออนไลน์
- **Leaderboard เป็นข้อมูลตัวอย่าง** — ผู้เล่นอื่นเป็นค่าคงที่ที่ติดป้าย "ข้อมูลตัวอย่าง" มีเพียงแถวของคุณที่มาจากการเล่นจริง
- **การยืนยันภารกิจไม่ใช่หลักฐาน** — ภารกิจชีวิตจริงเป็น self-reported ระบบไม่ได้ตรวจจับการกระทำจริง
- **CO2e** คำนวณเฉพาะกิจกรรมที่มีค่าอ้างอิงที่ตรวจสอบได้ (ปัจจุบัน: ไฟฟ้า TGO 0.4750 kgCO2e/kWh มีผล 1 ม.ค. 2569 และน้ำประปา TGO 0.7836 kgCO2e/m³ ตาราง CFP อัปเดต เม.ย. 2569) กิจกรรมอื่นแสดงเป็นปริมาณเท่านั้น และไม่มีการแปลง XP เป็น CO2e
- คำอธิบายผลกระทบของภารกิจบางข้อยังมีตัวเลขที่ไม่ได้ระบุแหล่งอ้างอิง (อยู่ในรายการแก้ไขต่อ)
- Streak และ "รายสัปดาห์" ใช้วันที่ของเครื่อง หากตั้งเวลาเครื่องผิด ผลจะคลาดเคลื่อน
- ไม่มี API keys หรือ secrets ใน client code และไม่มีการส่งข้อมูลผู้ใช้ออกภายนอก (ยกเว้นการโหลดฟอนต์จาก Google Fonts)

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` จะ build และ deploy เมื่อ push ไปที่ `main` แล้วเปิดที่ `https://<username>.github.io/ecoquest/`

## License

MIT
