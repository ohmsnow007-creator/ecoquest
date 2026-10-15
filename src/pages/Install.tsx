import { useState } from 'react';
import { Download, CheckCircle2, Loader2, Wifi, WifiOff, ShieldCheck, ShieldAlert, RefreshCw, Smartphone, Info } from 'lucide-react';
import { usePwa, promptInstall, applyUpdate, detectBrowser, type BrowserKind, type ServiceWorkerStatus } from '../services/pwaService';
import { PageHeader } from '../components/ui/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';

const GUIDES: Record<BrowserKind, { name: string; steps: string[] }> = {
  ios: {
    name: 'iPhone / iPad (Safari)',
    steps: ['แตะปุ่มแชร์ (สี่เหลี่ยมที่มีลูกศรชี้ขึ้น)', 'เลื่อนลงแล้วเลือก “เพิ่มไปยังหน้าจอโฮม”', 'แตะ “เพิ่ม” มุมขวาบน'],
  },
  'android-chrome': {
    name: 'Android (Chrome / Edge)',
    steps: ['แตะเมนู ⋮ มุมขวาบน', 'เลือก “ติดตั้งแอป” หรือ “เพิ่มลงในหน้าจอหลัก”', 'แตะ “ติดตั้ง” เพื่อยืนยัน'],
  },
  'android-samsung': {
    name: 'Android (Samsung Internet)',
    steps: ['แตะเมนู ≡ แถบด้านล่าง', 'เลือก “เพิ่มหน้าไปยัง” แล้วเลือก “หน้าจอหลัก”', 'แตะ “เพิ่ม” เพื่อยืนยัน'],
  },
  'android-firefox': {
    name: 'Android (Firefox)',
    steps: ['แตะเมนู ⋮', 'เลือก “ติดตั้ง” หรือ “เพิ่มไปยังหน้าจอหลัก”', 'ยืนยันการเพิ่ม'],
  },
  'desktop-chromium': {
    name: 'คอมพิวเตอร์ (Chrome / Edge)',
    steps: ['คลิกไอคอนติดตั้งด้านขวาของแถบที่อยู่ (ถ้ามี)', 'หรือเปิดเมนู ⋮ / … แล้วหาคำสั่ง “ติดตั้ง EcoQuest” หรือ “ติดตั้งไซต์นี้เป็นแอป”', 'คลิก “ติดตั้ง” เพื่อยืนยัน'],
  },
  'desktop-safari': {
    name: 'Mac (Safari 17 ขึ้นไป)',
    steps: ['เปิดเมนู “ไฟล์” (File)', 'เลือก “เพิ่มไปที่ Dock” (Add to Dock)', 'คลิก “เพิ่ม”'],
  },
  'desktop-firefox': {
    name: 'คอมพิวเตอร์ (Firefox)',
    steps: ['Firefox บนคอมพิวเตอร์ยังไม่รองรับการติดตั้งเว็บแอป', 'ใช้งานผ่านแท็บเบราว์เซอร์ได้ตามปกติ', 'หากต้องการติดตั้ง ให้เปิดลิงก์นี้ด้วย Chrome หรือ Edge'],
  },
  other: {
    name: 'เบราว์เซอร์อื่น',
    steps: ['เปิดเมนูของเบราว์เซอร์', 'หาคำสั่ง “ติดตั้ง” หรือ “เพิ่มลงในหน้าจอหลัก”', 'ถ้าไม่มีคำสั่งนี้ แสดงว่าเบราว์เซอร์ยังไม่รองรับ ใช้งานผ่านแท็บได้ตามปกติ'],
  },
};

const SW_TEXT: Record<ServiceWorkerStatus, { ok: boolean; text: string }> = {
  active: { ok: true, text: 'Service Worker ทำงานอยู่' },
  registering: { ok: false, text: 'กำลังเตรียม Service Worker…' },
  'dev-disabled': { ok: false, text: 'โหมดพัฒนา (dev server) ไม่เปิดใช้ Service Worker ทดสอบออฟไลน์ได้จาก build จริง' },
  insecure: { ok: false, text: 'การเชื่อมต่อนี้ไม่ใช่ HTTPS จึงใช้ Service Worker ไม่ได้ (ใช้ได้บน HTTPS หรือ localhost)' },
  unsupported: { ok: false, text: 'เบราว์เซอร์นี้ไม่รองรับ Service Worker' },
  error: { ok: false, text: 'ลงทะเบียน Service Worker ไม่สำเร็จ แอปยังใช้งานออนไลน์ได้ตามปกติ' },
};

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-2 space-y-2">
      {steps.map((s, i) => (
        <li key={s} className="flex gap-3 text-body">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-caption font-bold text-forest">{i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function Install() {
  const pwa = usePwa();
  const [dismissed, setDismissed] = useState(false);
  const browser = detectBrowser();
  const sw = SW_TEXT[pwa.swStatus];

  const install = async () => {
    const outcome = await promptInstall();
    setDismissed(outcome === 'dismissed');
  };

  return (
    <>
      <PageHeader title="ติดตั้งแอปและใช้งานออฟไลน์" back />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section aria-labelledby="install-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 id="install-title" className="flex items-center gap-2 text-section font-bold text-forest">
            <Smartphone size={19} className="text-primary" aria-hidden="true" /> เพิ่ม EcoQuest ลงหน้าจอหลัก
          </h2>

          <div role="status" className="mt-3">
            {pwa.install === 'installed' && (
              <p className="flex items-start gap-2 rounded-control bg-pale-mint p-3 text-body">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                ติดตั้งแล้ว เปิด EcoQuest ได้จากหน้าจอหลักหรือรายการแอปของอุปกรณ์
              </p>
            )}
            {pwa.install === 'installing' && (
              <p className="flex items-start gap-2 rounded-control bg-background p-3 text-body">
                <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-primary" aria-hidden="true" />
                คุณยืนยันแล้ว เบราว์เซอร์กำลังติดตั้ง ระบบจะแจ้งเมื่อเบราว์เซอร์ยืนยันว่าติดตั้งเสร็จ
              </p>
            )}
          </div>

          {pwa.install === 'can-prompt' && (
            <>
              <p className="text-body text-muted">เบราว์เซอร์นี้รองรับการติดตั้งโดยตรง กดปุ่มด้านล่างแล้วยืนยันในหน้าต่างของเบราว์เซอร์</p>
              <PrimaryButton className="mt-3" fullWidth icon={<Download size={18} />} onClick={install}>
                ติดตั้ง EcoQuest
              </PrimaryButton>
            </>
          )}

          {pwa.install === 'manual' && (
            <>
              {dismissed && <p className="mb-2 text-caption text-muted">ยกเลิกการติดตั้งแล้ว ติดตั้งภายหลังได้ด้วยขั้นตอนด้านล่าง</p>}
              <p className="text-body text-muted">ทำตามขั้นตอนสำหรับ <span className="font-semibold text-text">{GUIDES[browser].name}</span></p>
              <Steps steps={GUIDES[browser].steps} />
              <details className="mt-4 text-caption">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold">ขั้นตอนสำหรับเบราว์เซอร์อื่น</summary>
                <div className="space-y-4">
                  {(Object.keys(GUIDES) as BrowserKind[])
                    .filter((k) => k !== browser && k !== 'other')
                    .map((k) => (
                      <div key={k}>
                        <p className="font-semibold">{GUIDES[k].name}</p>
                        <Steps steps={GUIDES[k].steps} />
                      </div>
                    ))}
                </div>
              </details>
            </>
          )}
        </section>

        <section aria-labelledby="offline-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 id="offline-title" className="text-section font-bold text-forest">การใช้งานออฟไลน์</h2>
          <ul className="mt-3 space-y-2 text-body">
            <li className="flex items-center gap-2">
              {pwa.online ? <Wifi size={17} className="text-primary" aria-hidden="true" /> : <WifiOff size={17} className="text-warning" aria-hidden="true" />}
              {pwa.online ? 'ตอนนี้ออนไลน์อยู่' : 'ตอนนี้ออฟไลน์อยู่'}
            </li>
            <li className="flex items-start gap-2">
              {sw.ok ? <ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /> : <ShieldAlert size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />}
              <span data-testid="sw-status">{sw.text}</span>
            </li>
            <li className="flex items-start gap-2">
              {pwa.offlineReady ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /> : <Info size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />}
              <span data-testid="offline-ready">{pwa.offlineReady ? 'เก็บไฟล์แอปไว้ในเครื่องแล้ว เปิดแบบออฟไลน์ได้' : 'ยังไม่ได้เก็บไฟล์แอปไว้ในเครื่อง ต้องเปิดแบบออนไลน์ก่อนอย่างน้อยหนึ่งครั้ง'}</span>
            </li>
          </ul>

          {pwa.updateAvailable && (
            <div className="mt-3 rounded-control border border-primary bg-pale-mint p-3">
              <p className="text-body font-semibold">มีเวอร์ชันใหม่</p>
              <p className="text-caption text-muted">ข้อมูลการเล่นของคุณจะยังอยู่ หน้าเว็บจะโหลดใหม่หนึ่งครั้ง</p>
              <SecondaryButton className="mt-2" icon={<RefreshCw size={16} />} onClick={() => void applyUpdate()}>
                อัปเดตตอนนี้
              </SecondaryButton>
            </div>
          )}

          <h3 className="mt-4 text-caption font-semibold">ใช้ได้ตอนออฟไลน์</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-caption">
            <li>ภารกิจ ควิซ และคำอธิบาย (มากับตัวแอป)</li>
            <li>บันทึกความคืบหน้า XP เหรียญ และกิจกรรม Green Impact ลงเครื่องนี้</li>
            <li>โลกสีเขียว สถิติ และการตั้งค่า</li>
          </ul>
          <h3 className="mt-3 text-caption font-semibold">ต้องใช้อินเทอร์เน็ต</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-caption text-muted">
            <li>ลิงก์ไปยังแหล่งอ้างอิงภายนอก</li>
            <li>ฟอนต์ที่ยังไม่เคยโหลด (ถ้ายังไม่มีจะใช้ฟอนต์ของเครื่องแทน)</li>
          </ul>
          <p className="mt-3 text-caption text-muted">
            EcoQuest ไม่มีเซิร์ฟเวอร์ จึงไม่มีการซิงก์ข้อมูลข้ามอุปกรณ์ และ Leaderboard เป็นข้อมูลตัวอย่างในเครื่องเท่านั้น ไม่ว่าจะออนไลน์หรือออฟไลน์
          </p>
        </section>
      </div>
    </>
  );
}
