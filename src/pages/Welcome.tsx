import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useGame } from '../store/GameContext';

const avatars = [
  { id: 'avatar-leaf', emoji: '🌿', label: 'ใบไม้' },
  { id: 'avatar-tree', emoji: '🌳', label: 'ต้นไม้' },
  { id: 'avatar-flower', emoji: '🌻', label: 'ดอกไม้' },
  { id: 'avatar-earth', emoji: '🌍', label: 'โลก' },
  { id: 'avatar-water', emoji: '💧', label: 'หยดน้ำ' },
  { id: 'avatar-sun', emoji: '☀️', label: 'ดวงอาทิตย์' },
];

const goals = [
  { id: 'goal-waste', label: 'ลดขยะ', emoji: '♻️' },
  { id: 'goal-energy', label: 'ประหยัดพลังงาน', emoji: '⚡' },
  { id: 'goal-water', label: 'ประหยัดน้ำ', emoji: '💧' },
  { id: 'goal-transport', label: 'เดินทางยั่งยืน', emoji: '🚲' },
  { id: 'goal-nature', label: 'รักธรรมชาติ', emoji: '🌿' },
];

function MascotSvg() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Glow */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#86efac" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="110" r="80" fill="url(#glow)" />
      {/* Soil */}
      <ellipse cx="100" cy="155" rx="50" ry="12" fill="#8B6914" opacity="0.5" />
      {/* Body (seed/sprout shape) */}
      <ellipse cx="100" cy="135" rx="30" ry="28" fill="#C7E5A0" />
      <ellipse cx="100" cy="130" rx="28" ry="25" fill="#A8D88A" />
      {/* Face */}
      <circle cx="88" cy="128" r="4" fill="#2d5016" />
      <circle cx="112" cy="128" r="4" fill="#2d5016" />
      <circle cx="89" cy="126" r="1.5" fill="white" />
      <circle cx="113" cy="126" r="1.5" fill="white" />
      {/* Smile */}
      <path d="M92 138 Q100 146 108 138" stroke="#2d5016" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="82" cy="135" r="5" fill="#f9a8d4" opacity="0.3" />
      <circle cx="118" cy="135" r="5" fill="#f9a8d4" opacity="0.3" />
      {/* Leaf on head */}
      <path d="M100 108 Q85 85 95 70 Q100 80 100 108" fill="#22c55e" />
      <path d="M100 108 Q115 85 105 70 Q100 80 100 108" fill="#16a34a" />
      <line x1="100" y1="108" x2="100" y2="75" stroke="#15803d" strokeWidth="1.5" />
    </svg>
  );
}

export function Welcome() {
  const { createProfile } = useGame();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0].id);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleStart = () => {
    const displayName = name.trim() || 'นักสำรวจ';
    createProfile(displayName, selectedAvatar, selectedGoals);
    navigate('/');
  };

  return (
    <div className="flex flex-col" style={{
      minHeight: '100%',
      background: 'linear-gradient(180deg, #0d3320 0%, #14532d 40%, #166534 70%, #15803d 100%)',
    }}>
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-white animate-fade-in">
          {/* Speech bubble */}
          <div className="relative bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 mb-2">
            <p className="text-sm text-green-100 text-center font-medium">
              สวัสดี! ฉันคือ Sprouty<br />มาสร้างโลกสีเขียวด้วยกัน!
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/15 rotate-45 backdrop-blur-sm" />
          </div>

          <MascotSvg />

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-extrabold mb-1 tracking-tight">EcoQuest</h1>
            <p className="text-green-200 text-sm mb-1">ภารกิจพิชิตโลกสีเขียว</p>
          </div>

          <div className="w-full max-w-xs mt-6 space-y-2.5">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <Sparkles size={16} className="text-amber-300 shrink-0" />
              <p className="text-xs text-green-50">ทำภารกิจสะสม XP เพิ่มเลเวล</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <Sparkles size={16} className="text-amber-300 shrink-0" />
              <p className="text-xs text-green-50">ปลดล็อก Badge และฟื้นฟูโลกเสมือน</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <Sparkles size={16} className="text-amber-300 shrink-0" />
              <p className="text-xs text-green-50">เรียนรู้เรื่องความยั่งยืนอย่างสนุก</p>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-8 w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm active:scale-[0.97] transition-transform shadow-lg"
            style={{ background: 'linear-gradient(135deg, #86efac, #4ade80)', color: '#052e16' }}
          >
            เริ่มต้นเลย
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-white animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">ตั้งชื่อของคุณ</h2>
          <p className="text-sm text-green-200 mb-6">เลือก Avatar และตั้งชื่อนักสำรวจ</p>

          <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-6">
            {avatars.map((av) => (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                  selectedAvatar === av.id
                    ? 'bg-green-500/30 ring-2 ring-green-400 scale-105'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <span className="text-3xl">{av.emoji}</span>
                <span className="text-[11px] font-medium">{av.label}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="ชื่อของคุณ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full max-w-xs bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 mb-6 backdrop-blur-sm"
          />

          <div className="w-full max-w-xs flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex-1 border border-white/20 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              กลับ
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl font-bold active:scale-[0.97] transition-transform"
              style={{ background: 'linear-gradient(135deg, #86efac, #4ade80)', color: '#052e16' }}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-white animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">เลือกเป้าหมาย</h2>
          <p className="text-sm text-green-200 mb-6">เลือกได้หลายข้อ หรือข้ามก็ได้</p>

          <div className="w-full max-w-xs space-y-2 mb-8">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                  selectedGoals.includes(goal.id)
                    ? 'bg-green-500/30 ring-2 ring-green-400'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <span className="text-2xl">{goal.emoji}</span>
                <span className="font-medium text-sm">{goal.label}</span>
              </button>
            ))}
          </div>

          <div className="w-full max-w-xs flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-white/20 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              กลับ
            </button>
            <button
              onClick={handleStart}
              className="flex-1 py-3 rounded-xl font-bold active:scale-[0.97] transition-transform shadow-lg"
              style={{ background: 'linear-gradient(135deg, #86efac, #4ade80)', color: '#052e16' }}
            >
              เริ่มผจญภัย!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
