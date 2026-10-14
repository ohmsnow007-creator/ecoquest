import { useState } from 'react';
import { ArrowLeft, Download, Trash2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { storageService } from '../services/storageService';
import { getLevelFromXp } from '../utils/xp';

const avatars = [
  { id: 'avatar-leaf', emoji: '🌿', label: 'ใบไม้' },
  { id: 'avatar-tree', emoji: '🌳', label: 'ต้นไม้' },
  { id: 'avatar-flower', emoji: '🌻', label: 'ดอกไม้' },
  { id: 'avatar-earth', emoji: '🌍', label: 'โลก' },
  { id: 'avatar-water', emoji: '💧', label: 'หยดน้ำ' },
  { id: 'avatar-sun', emoji: '☀️', label: 'ดวงอาทิตย์' },
];

const avatarEmojis: Record<string, string> = {
  'avatar-leaf': '🌿', 'avatar-tree': '🌳', 'avatar-flower': '🌻',
  'avatar-earth': '🌍', 'avatar-water': '💧', 'avatar-sun': '☀️',
};

export function Settings() {
  const { profile, progress, updateProfile, resetAll } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatarId || 'avatar-leaf');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const level = getLevelFromXp(progress.totalXp);

  const handleSave = () => {
    const displayName = name.trim() || 'นักสำรวจ';
    updateProfile(displayName, selectedAvatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecoquest-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetAll();
    navigate('/');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dark-header px-4 pt-6 pb-6 rounded-b-[28px]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-green-300 font-medium text-sm mb-3 py-1">
          <ArrowLeft size={18} />
          <span>กลับ</span>
        </button>

        {/* Profile card */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'rgba(134, 239, 172, 0.2)', border: '3px solid rgba(134, 239, 172, 0.4)' }}>
            {avatarEmojis[profile.avatarId] || '🌿'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-green-900"
                style={{ background: 'linear-gradient(135deg, #86efac, #4ade80)' }}>
                Lvl {level}
              </span>
              <span className="text-xs text-green-300/60">{progress.totalXp} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 max-w-lg mx-auto">
        {/* Profile Edit */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-3 shadow-sm">
          <h2 className="font-bold text-green-800 text-sm mb-4">แก้ไขโปรไฟล์</h2>

          <label className="block text-xs text-gray-500 mb-1.5 font-medium">ชื่อ</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <label className="block text-xs text-gray-500 mb-2 font-medium">Avatar</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {avatars.map((av) => (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                  selectedAvatar === av.id
                    ? 'ring-2 ring-green-400 scale-105'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                style={selectedAvatar === av.id ? { background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' } : {}}
              >
                <span className="text-2xl">{av.emoji}</span>
                <span className="text-[10px] text-gray-500">{av.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full text-white py-2.5 rounded-xl font-bold text-sm active:scale-[0.97] transition-transform shadow-md"
            style={{ background: saved ? 'linear-gradient(135deg, #86efac, #4ade80)' : 'linear-gradient(135deg, #16a34a, #22c55e)' }}
          >
            {saved ? 'บันทึกแล้ว ✓' : 'บันทึก'}
          </button>
        </div>

        {/* Export */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-3 shadow-sm">
          <h2 className="font-bold text-green-800 text-sm mb-2">ข้อมูล</h2>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
            style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0369a1' }}
          >
            <Download size={16} />
            ส่งออกข้อมูล (JSON)
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-green-50 p-4 mb-3 shadow-sm">
          <h2 className="font-bold text-green-800 text-sm mb-2">เกี่ยวกับ</h2>
          <div className="space-y-1 text-xs text-gray-500">
            <p className="flex items-center gap-1.5">
              <Info size={12} className="text-green-500" />
              EcoQuest — ภารกิจพิชิตโลกสีเขียว
            </p>
            <p>เวอร์ชัน 1.0.0</p>
            <p>ผลงานโปรเจกต์มหาวิทยาลัย</p>
            <p>ข้อมูลทั้งหมดถูกเก็บในเครื่องของคุณเท่านั้น</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-rose-100 p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-rose-600 text-sm mb-2">โซนอันตราย</h2>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl font-semibold text-sm"
            >
              <Trash2 size={16} />
              รีเซ็ตข้อมูลทั้งหมด
            </button>
          ) : (
            <div className="bg-rose-50 rounded-xl p-3">
              <p className="text-xs text-rose-700 mb-3">
                การรีเซ็ตจะลบข้อมูลทั้งหมด: โปรไฟล์, XP, เลเวล, Badge, Streak, ประวัติภารกิจ และโลกเสมือน ไม่สามารถกู้คืนได้
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white border border-gray-200 py-2 rounded-xl text-sm font-medium text-gray-600"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-sm font-bold active:scale-[0.97] transition-transform"
                >
                  ลบทั้งหมด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
