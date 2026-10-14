import { useState, useEffect, type ReactNode } from 'react';
import { Leaf, Power, X, Minus } from 'lucide-react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function Launcher({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return <>{children}</>;
  }

  if (!isOpen) {
    return (
      <div className="launcher-bg">
        <div className="launcher-particles">
          <div className="particle p1" />
          <div className="particle p2" />
          <div className="particle p3" />
          <div className="particle p4" />
          <div className="particle p5" />
        </div>

        <div className="launcher-content animate-fade-in">
          <div className="launcher-logo">
            <div className="launcher-logo-ring">
              <Leaf size={48} strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="launcher-title">EcoQuest</h1>
          <p className="launcher-subtitle">ภารกิจพิชิตโลกสีเขียว</p>
          <p className="launcher-desc">
            เปลี่ยนนิสัยเล็ก ๆ ให้กลายเป็นการเปลี่ยนแปลงที่ยิ่งใหญ่
          </p>

          <button onClick={() => setIsOpen(true)} className="launcher-btn">
            <Power size={20} />
            <span>เปิดแอพ</span>
          </button>

          <div className="launcher-footer">
            <span>EcoQuest v1.0.0</span>
            <span>ผลงานโปรเจกต์มหาวิทยาลัย</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-desktop-bg">
      {/* Desktop window controls */}
      <div className="app-window-bar">
        <div className="window-bar-left">
          <Leaf size={16} />
          <span>EcoQuest — ภารกิจพิชิตโลกสีเขียว</span>
        </div>
        <div className="window-bar-right">
          <button className="window-btn minimize" onClick={() => {}}>
            <Minus size={14} />
          </button>
          <button className="window-btn close" onClick={() => setIsOpen(false)}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Phone frame */}
      <div className="phone-frame-wrapper">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            {children}
          </div>
          <div className="phone-home-indicator" />
        </div>
      </div>
    </div>
  );
}
