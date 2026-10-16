import { useId } from 'react';

/*
 * Frames drawn around the round avatar. Plain frames are a coloured ring that hugs the avatar exactly;
 * special frames add decorations on the OUTER rim only, so they never cover the character's face.
 * The overlay is 140% of the avatar: in its 0–100 box the avatar's edge sits at r ≈ 35.7.
 */

export const FRAME_COLORS: Record<string, string> = {
  'frame-mint': '#7FD6B0',
  'frame-lime': '#C6EC5A',
  'frame-sky': '#7CC8F2',
  'frame-peach': '#F9B38A',
  'frame-lavender': '#B8A4F2',
};

const EDGE = 35.7;

/** Decorations at an angle (degrees, 0 = right, clockwise) just outside the avatar's edge. */
const at = (deg: number, r = EDGE + 6) => ({ x: 50 + r * Math.cos((deg * Math.PI) / 180), y: 50 + r * Math.sin((deg * Math.PI) / 180) });

function LeafFrame({ gid }: { gid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B7EB8F" />
          <stop offset="100%" stopColor="#2F9E5B" />
        </linearGradient>
      </defs>
      <circle cx={50} cy={50} r={EDGE + 1.8} fill="none" stroke={`url(#${gid})`} strokeWidth={3.6} />
      {[120, 150, 30, 60].map((deg, i) => {
        const p = at(deg);
        return (
          <g key={deg} transform={`translate(${p.x} ${p.y}) rotate(${deg + 90})`}>
            <g className="scene-sway" style={{ animationDelay: `${i * 0.6}s`, animationDuration: '3.6s' }}>
              <path d="M0 4 C-6 -2 -4 -9 0 -10 C4 -9 6 -2 0 4Z" fill={i % 2 ? '#4FAF6A' : '#7CCB4F'} />
              <path d="M0 3 L0 -8" stroke="#2F7A3E" strokeWidth={0.8} />
            </g>
          </g>
        );
      })}
    </>
  );
}

function FlowerFrame({ gid }: { gid: string }) {
  const colors = ['#F9A8D4', '#FDE68A', '#FFFFFF', '#C4B5FD', '#FDBA74'];
  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
      </defs>
      <circle cx={50} cy={50} r={EDGE + 1.8} fill="none" stroke={`url(#${gid})`} strokeWidth={3.6} />
      {[100, 130, 160, 20, 50].map((deg, i) => {
        const p = at(deg, EDGE + 5);
        return (
          <g key={deg} transform={`translate(${p.x} ${p.y})`} className="scene-twinkle" style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3.2s' }}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx={0} cy={-2.6} rx={1.9} ry={2.8} fill={colors[i]} stroke="#E07AA8" strokeWidth={0.3} transform={`rotate(${r})`} />
            ))}
            <circle r={1.5} fill="#F59E0B" />
          </g>
        );
      })}
    </>
  );
}

function GoldenFrame({ gid }: { gid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="45%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#C9962A" />
        </linearGradient>
      </defs>
      <circle cx={50} cy={50} r={EDGE + 2.2} fill="none" stroke={`url(#${gid})`} strokeWidth={4.4} />
      <circle cx={50} cy={50} r={EDGE + 4.6} fill="none" stroke="#FDE68A" strokeWidth={0.6} opacity={0.8} />
      {/* a slow orbit of sparkles around the rim */}
      <g className="scene-spin" style={{ transformOrigin: '50px 50px', transformBox: 'view-box', animationDuration: '14s' }}>
        {[0, 72, 144, 216, 288].map((deg) => {
          const p = at(deg, EDGE + 8);
          return <path key={deg} d={`M${p.x} ${p.y - 3} l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1Z`} fill="#FFF7D6" />;
        })}
      </g>
      {/* little golden tree crest at the bottom */}
      <g transform={`translate(50 ${50 + EDGE + 5})`}>
        <circle r={5.2} fill={`url(#${gid})`} stroke="#B7881F" strokeWidth={0.6} />
        <path d="M0 3 L0 -1 M0 -1 C-3 -1 -3 -4 0 -4 C3 -4 3 -1 0 -1" stroke="#2F7A3E" strokeWidth={1.1} fill="#4FAF6A" />
      </g>
    </>
  );
}

/** Draws the chosen frame around an avatar of any size (place inside a `relative` box the size of the avatar). */
export function AvatarFrame({ id }: { id: string }) {
  const gid = `frame-${useId().replace(/:/g, '')}`;
  const plain = FRAME_COLORS[id];
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-[20%] h-[140%] w-[140%] overflow-visible" aria-hidden="true">
      {plain ? (
        <>
          <circle cx={50} cy={50} r={EDGE + 1.7} fill="none" stroke={plain} strokeWidth={3.4} />
          <circle cx={50} cy={50} r={EDGE + 3.6} fill="none" stroke="#FFFFFF" strokeWidth={0.8} opacity={0.7} />
        </>
      ) : id === 'frame-leaf' ? (
        <LeafFrame gid={gid} />
      ) : id === 'frame-flower' ? (
        <FlowerFrame gid={gid} />
      ) : id === 'frame-golden' ? (
        <GoldenFrame gid={gid} />
      ) : null}
    </svg>
  );
}
