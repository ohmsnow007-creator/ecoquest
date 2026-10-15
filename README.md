# EcoQuest — ภารกิจพิชิตโลกสีเขียว

เว็บแอปเกมมิฟิเคชัน (Gamification) เพื่อส่งเสริมพฤติกรรมรักษ์สิ่งแวดล้อม พัฒนาด้วย React + TypeScript

ผลงานโปรเจกต์มหาวิทยาลัย

## Features

- **ภารกิจรักษ์โลก** — 18 กิจกรรมใน 6 หมวด: ขยะ, พลังงาน, น้ำ, เดินทาง, บริโภค, ธรรมชาติ
- **ควิซสิ่งแวดล้อม** — 15 คำถามพร้อมคำอธิบาย รับ XP เมื่อตอบถูก
- **ระบบ XP & Level** — สูตร `50 × level^1.5` พร้อม Streak นับวันต่อเนื่อง
- **ระบบยศ** — 5 ระดับ: นักสำรวจ → นักอนุรักษ์ → ผู้พิทักษ์โลก → แชมเปี้ยนสีเขียว → ตำนานรักษ์โลก
- **โลกเสมือน** — SVG แสดงสถานะโลก 6 ระดับ เปลี่ยนตาม XP ที่สะสม
- **เหรียญตรา** — 17 เหรียญตรา ปลดล็อกเมื่อทำตามเงื่อนไข
- **สถิติ & กราฟ** — Recharts แสดงกิจกรรมแยกหมวดหมู่
- **PWA** — ติดตั้งบนมือถือได้ ใช้งานออฟไลน์
- **Launcher (PC)** — แสดง Phone Frame บนเดสก์ท็อป ข้ามบนมือถือ
- **Framer Motion** — แอนิเมชันเปลี่ยนหน้าและอินเตอร์แอคชัน

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 + `@tailwindcss/vite` |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Animation | Framer Motion |
| Routing | React Router DOM v7 (HashRouter) |
| PWA | vite-plugin-pwa |
| Testing | Vitest + @testing-library/react + jsdom |
| Storage | localStorage (ข้อมูลอยู่ในเครื่องผู้ใช้เท่านั้น) |

## Getting Started

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

### เข้าถึงจากมือถือ (WiFi เดียวกัน)

```bash
npm run dev -- --host
```

เปิด `http://<IP-ของ-PC>:5173` บนมือถือ

### ทดสอบ

```bash
npm test
```

### Build

```bash
npm run build
```

## โครงสร้างโปรเจกต์

```
src/
├── components/
│   ├── layout/       # AppShell, Launcher, MobileNav
│   └── world/        # WorldPreview (SVG)
├── data/
│   ├── badges.ts     # เหรียญตรา 17 รายการ
│   ├── missions.ts   # ภารกิจ 18 รายการ
│   └── quizzes.ts    # คำถามควิซ 15 ข้อ
├── pages/            # Dashboard, Missions, Quiz, Ranking, Progress, Impact, Settings, ...
├── services/
│   └── storageService.ts  # จัดการ localStorage
├── store/
│   └── GameContext.tsx     # React Context (state management)
├── test/             # Vitest tests (45 test cases)
├── types/            # TypeScript interfaces
└── utils/            # xp, streak, world helpers
```

## Design System

- **Color tokens** — กำหนดใน `src/index.css` (`@theme`) เช่น `forest`, `primary`, `emerald`, `mint`, `lime`, `background`, `surface`, `text`, `muted`, `border`, `warning`, `danger`, `success` พาเลตต์เริ่มต้นของ Tailwind ถูกล้างออก จึงใช้ได้เฉพาะสีตามบทบาทเท่านั้น
- **Typography** — IBM Plex Sans Thai (fallback: Noto Sans Thai, Leelawadee UI, Tahoma) ขนาด `text-page`, `text-section`, `text-card`, `text-body`, `text-caption`
- **Shared components** — `src/components/ui/` (ปุ่ม, การ์ด, ProgressBar/Ring, XPBadge, LevelBadge, StatCard, MissionCard, AchievementBadge, EmptyState, LoadingSkeleton, ErrorState, Modal/ConfirmationDialog, SegmentedControl, FilterChips, ResponsiveChart, AvatarPicker, PageHeader, EcoMascot) และ `src/components/layout/` (AppShell, BottomNavigation, DesktopSidebar, Launcher)
- **Responsive** — มือถือใช้ Bottom Navigation, เดสก์ท็อป (≥1024px) ใช้ Sidebar และ Dashboard หลายคอลัมน์ ความกว้างเนื้อหาสูงสุด 1200px
- **Motion** — Framer Motion สำหรับ page fade, card entrance, XP toast, Level Up, Badge Unlock และ progress รองรับ `prefers-reduced-motion` และสวิตช์ "ลดการเคลื่อนไหว" ในหน้าตั้งค่า
- **Mascot** — Sprouty เป็น SVG ของโปรเจกต์เอง ไม่พึ่งพาภาพจากลิงก์ภายนอก

## สถาปัตยกรรม

- **State Management** — React Context API (`GameProvider`) จัดการ profile, progress, toast
- **Persistence** — localStorage ผ่าน `storageService` (centralized, ไม่เข้าถึงตรงจาก components)
- **Routing** — React Router DOM v7 (HashRouter สำหรับ GitHub Pages), protected routes redirect ถ้ายังไม่มี profile
- **Mobile-first** — ออกแบบสำหรับ 375px เป็นหลัก, bottom navigation 5 แท็บ
- **Desktop Launcher** — ตรวจจับ `(max-width: 768px)` ข้ามโหมด Phone Frame บนมือถือ

## ข้อจำกัดและความซื่อสัตย์

- ตัวเลขเป็น **คะแนนกิจกรรม** ไม่ใช่ค่า CO₂ ที่คำนวณได้แม่นยำ
- ภารกิจชีวิตจริงเป็น **self-reported** — ระบบไม่ได้ตรวจจับการกระทำจริง
- ผลกระทบจริงขึ้นอยู่กับบริบทและพฤติกรรมของแต่ละคน
- โลกเสมือนเป็นภาพจำลองเชิงสัญลักษณ์
- ข้อมูลทั้งหมดถูกเก็บใน localStorage ของเครื่องผู้ใช้เท่านั้น ไม่มีการส่งออกภายนอก
- ไม่มี API keys หรือ secrets ฝังใน client code

## Deploy (GitHub Pages)

โปรเจกต์ตั้งค่า GitHub Actions ไว้แล้วใน `.github/workflows/deploy.yml`

1. Push ไปที่ branch `main`
2. GitHub Actions จะ build และ deploy อัตโนมัติ
3. เปิดที่ `https://<username>.github.io/ecoquest/`

## License

MIT
