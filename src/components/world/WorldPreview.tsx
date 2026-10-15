interface WorldPreviewProps {
  stage: string;
  className?: string;
}

export function WorldPreview({ stage, className = '' }: WorldPreviewProps) {
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="ภาพโลกเสมือน" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stage === 'barren' ? '#87CEEB' : '#7EC8E3'} />
          <stop offset="100%" stopColor={stage === 'barren' ? '#B0D4E8' : '#B5E8D5'} />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stage === 'barren' ? '#C4A76C' : '#4ade80'} />
          <stop offset="100%" stopColor={stage === 'barren' ? '#A0855C' : '#166534'} />
        </linearGradient>
      </defs>

      <rect width="400" height="200" fill="url(#sky)" />

      {/* Sun */}
      <circle cx="340" cy="40" r="25" fill="#FFD93D" opacity="0.9" />
      <circle cx="340" cy="40" r="30" fill="#FFD93D" opacity="0.2" />

      {/* Clouds */}
      {stage !== 'barren' && (
        <>
          <ellipse cx="80" cy="35" rx="30" ry="12" fill="white" opacity="0.7" />
          <ellipse cx="100" cy="30" rx="25" ry="10" fill="white" opacity="0.6" />
          <ellipse cx="250" cy="50" rx="35" ry="14" fill="white" opacity="0.5" />
        </>
      )}

      {/* Ground */}
      <ellipse cx="200" cy="200" rx="250" ry="70" fill="url(#ground)" />

      {/* Hills */}
      {stage !== 'barren' && (
        <>
          <ellipse cx="100" cy="160" rx="80" ry="30" fill="#22c55e" opacity="0.4" />
          <ellipse cx="320" cy="165" rx="100" ry="35" fill="#16a34a" opacity="0.3" />
        </>
      )}

      {/* Barren cracks */}
      {stage === 'barren' && (
        <g stroke="#8B7355" strokeWidth="1.5" opacity="0.4">
          <path d="M150 165 L160 155 L170 160" fill="none" />
          <path d="M250 170 L255 158 L265 165" fill="none" />
          <path d="M100 175 L110 168" fill="none" />
        </g>
      )}

      {/* Sprouts stage */}
      {(stage === 'sprouts' || stage === 'garden' || stage === 'youngForest' || stage === 'matureForest' || stage === 'paradise') && (
        <>
          <line x1="120" y1="160" x2="120" y2="148" stroke="#16a34a" strokeWidth="2" />
          <ellipse cx="118" cy="146" rx="5" ry="3" fill="#4ade80" />
          <ellipse cx="123" cy="148" rx="5" ry="3" fill="#22c55e" />

          <line x1="200" y1="155" x2="200" y2="143" stroke="#16a34a" strokeWidth="2" />
          <ellipse cx="197" cy="141" rx="5" ry="3" fill="#4ade80" />
          <ellipse cx="204" cy="143" rx="5" ry="3" fill="#22c55e" />

          <line x1="280" y1="158" x2="280" y2="146" stroke="#16a34a" strokeWidth="2" />
          <ellipse cx="278" cy="144" rx="4" ry="3" fill="#86efac" />
          <ellipse cx="283" cy="146" rx="5" ry="3" fill="#4ade80" />
        </>
      )}

      {/* Garden stage - flowers */}
      {(stage === 'garden' || stage === 'youngForest' || stage === 'matureForest' || stage === 'paradise') && (
        <>
          <circle cx="90" cy="148" r="4" fill="#f472b6" />
          <circle cx="90" cy="148" r="2" fill="#fbbf24" />
          <line x1="90" y1="152" x2="90" y2="162" stroke="#16a34a" strokeWidth="1.5" />

          <circle cx="310" cy="150" r="4" fill="#c084fc" />
          <circle cx="310" cy="150" r="2" fill="#fbbf24" />
          <line x1="310" y1="154" x2="310" y2="164" stroke="#16a34a" strokeWidth="1.5" />

          <circle cx="180" cy="146" r="3" fill="#fb923c" />
          <circle cx="180" cy="146" r="1.5" fill="#fcd34d" />
          <line x1="180" y1="149" x2="180" y2="157" stroke="#16a34a" strokeWidth="1.5" />

          {/* Butterfly */}
          <g transform="translate(160, 120)">
            <ellipse cx="-5" cy="0" rx="5" ry="3" fill="#f472b6" opacity="0.8" />
            <ellipse cx="5" cy="0" rx="5" ry="3" fill="#f472b6" opacity="0.8" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#831843" strokeWidth="1" />
          </g>
        </>
      )}

      {/* Young Forest - small trees */}
      {(stage === 'youngForest' || stage === 'matureForest' || stage === 'paradise') && (
        <>
          <TreeSVG x={60} y={130} size={0.8} color="#22c55e" />
          <TreeSVG x={160} y={125} size={1} color="#16a34a" />
          <TreeSVG x={340} y={132} size={0.9} color="#22c55e" />

          {/* Bird */}
          <g transform="translate(230, 70)">
            <path d="M-8 0 Q-4 -4 0 0 Q4 -4 8 0" fill="none" stroke="#334155" strokeWidth="1.5" />
          </g>
          <g transform="translate(260, 55)">
            <path d="M-6 0 Q-3 -3 0 0 Q3 -3 6 0" fill="none" stroke="#334155" strokeWidth="1.5" />
          </g>
        </>
      )}

      {/* Mature Forest - big trees & stream */}
      {(stage === 'matureForest' || stage === 'paradise') && (
        <>
          <TreeSVG x={100} y={115} size={1.4} color="#166534" />
          <TreeSVG x={250} y={118} size={1.3} color="#14532d" />
          <TreeSVG x={300} y={120} size={1.2} color="#166534" />

          {/* Stream */}
          <path d="M0 170 Q100 165 200 172 Q300 178 400 170" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.5" />
          <path d="M0 173 Q100 168 200 175 Q300 181 400 173" fill="none" stroke="#7dd3fc" strokeWidth="2" opacity="0.3" />
        </>
      )}

      {/* Paradise - full ecosystem */}
      {stage === 'paradise' && (
        <>
          <TreeSVG x={40} y={118} size={1.5} color="#14532d" />
          <TreeSVG x={200} y={110} size={1.6} color="#166534" />
          <TreeSVG x={360} y={115} size={1.3} color="#14532d" />

          {/* Deer */}
          <g transform="translate(140, 148) scale(0.5)">
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="#D2691E" />
            <circle cx="-14" cy="-6" r="5" fill="#D2691E" />
            <line x1="-12" y1="-10" x2="-10" y2="-18" stroke="#8B4513" strokeWidth="1.5" />
            <line x1="-9" y1="-10" x2="-7" y2="-18" stroke="#8B4513" strokeWidth="1.5" />
            <line x1="-6" y1="7" x2="-6" y2="14" stroke="#8B4513" strokeWidth="2" />
            <line x1="6" y1="7" x2="6" y2="14" stroke="#8B4513" strokeWidth="2" />
          </g>

          {/* More birds */}
          <g transform="translate(100, 50)">
            <path d="M-6 0 Q-3 -3 0 0 Q3 -3 6 0" fill="none" stroke="#334155" strokeWidth="1.5" />
          </g>
          <g transform="translate(300, 40)">
            <path d="M-8 0 Q-4 -4 0 0 Q4 -4 8 0" fill="none" stroke="#334155" strokeWidth="1.5" />
          </g>

          {/* Rainbow hint */}
          <path d="M50 80 Q200 20 350 80" fill="none" stroke="url(#rainbow)" strokeWidth="3" opacity="0.3" />
          <defs>
            <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
}

function TreeSVG({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${size})`}>
      <rect x="-3" y="10" width="6" height="15" fill="#8B4513" rx="1" />
      <polygon points="0,-15 -18,10 18,10" fill={color} />
      <polygon points="0,-25 -14,0 14,0" fill={color} opacity="0.8" />
    </g>
  );
}
