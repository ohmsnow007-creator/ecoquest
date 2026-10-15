import { useId } from 'react';

/** Sprouty as a glossy seed with two leaves, sitting in soil (intro screen artwork). */
export function SproutySeed({ size = 220, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" className={className} role="img" aria-label="Sprouty เมล็ดพันธุ์ยิ้มแย้มที่มีใบไม้สองใบ">
      <defs>
        <radialGradient id={`${id}-body`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FBFBD6" />
          <stop offset="45%" stopColor="#E9EE9A" />
          <stop offset="100%" stopColor="#B9C95A" />
        </radialGradient>
        <linearGradient id={`${id}-leafL`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9BD86A" />
          <stop offset="100%" stopColor="#4E9A3A" />
        </linearGradient>
        <linearGradient id={`${id}-leafR`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B4E77C" />
          <stop offset="100%" stopColor="#5DAA43" />
        </linearGradient>
        <radialGradient id={`${id}-soil`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#7A5636" />
          <stop offset="100%" stopColor="#3E2A1B" />
        </radialGradient>
      </defs>

      {/* soil */}
      <ellipse cx="120" cy="214" rx="96" ry="22" fill={`url(#${id}-soil)`} />
      <ellipse cx="120" cy="206" rx="58" ry="9" fill="#2B1C12" opacity={0.35} />

      {/* stem + leaves */}
      <path d="M120 92 C121 78 122 70 124 60" stroke="#6FB64E" strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M123 66 C104 32 66 34 58 52 C74 74 106 78 123 66Z" fill={`url(#${id}-leafL)`} />
      <path d="M123 66 C104 54 84 50 66 52" stroke="#3E7F2E" strokeWidth={2} fill="none" opacity={0.35} />
      <path d="M125 60 C140 22 182 16 192 34 C178 60 146 70 125 60Z" fill={`url(#${id}-leafR)`} />
      <path d="M125 60 C146 46 166 38 186 36" stroke="#3E7F2E" strokeWidth={2} fill="none" opacity={0.35} />
      <ellipse cx="160" cy="34" rx="12" ry="5" fill="#FFFFFF" opacity={0.35} transform="rotate(-20 160 34)" />

      {/* seed body */}
      <path d="M120 88 C164 88 186 128 184 160 C182 192 154 208 120 208 C86 208 58 192 56 160 C54 128 76 88 120 88Z" fill={`url(#${id}-body)`} />
      <ellipse cx="92" cy="118" rx="20" ry="12" fill="#FFFFFF" opacity={0.55} transform="rotate(-30 92 118)" />

      {/* face */}
      <ellipse cx="98" cy="152" rx="7.5" ry="9" fill="#3A2A1E" />
      <ellipse cx="142" cy="152" rx="7.5" ry="9" fill="#3A2A1E" />
      <circle cx="101" cy="148" r="2.6" fill="#FFFFFF" />
      <circle cx="145" cy="148" r="2.6" fill="#FFFFFF" />
      <ellipse cx="84" cy="168" rx="10" ry="6" fill="#F6A6A0" opacity={0.6} />
      <ellipse cx="156" cy="168" rx="10" ry="6" fill="#F6A6A0" opacity={0.6} />
      <path d="M110 170 Q120 180 130 170" stroke="#3A2A1E" strokeWidth={3.5} strokeLinecap="round" fill="none" />
    </svg>
  );
}
