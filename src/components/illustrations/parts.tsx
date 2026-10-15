// Illustration-only colors (scenery that has no UI role). UI colors come from theme tokens.
export const ART = {
  sky: '#DDF4F0',
  skyTop: '#C9EDF6',
  sun: '#FFC93C',
  sunRay: '#FFB020',
  cloud: '#FFFFFF',
  trunk: '#B5562F',
  trunkDark: '#8E3F22',
  cheek: '#F7A6B8',
  sunsetTop: '#E9552B',
  sunsetMid: '#F49A3B',
  sunsetLow: '#FCD27D',
  space: '#082F2A',
  star: '#FFE58A',
};

export function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-9} cy={0} rx={2.6} ry={3.2} className="fill-forest" />
      <ellipse cx={9} cy={0} rx={2.6} ry={3.2} className="fill-forest" />
      <path d="M-5 6 Q0 11 5 6" className="stroke-forest" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <ellipse cx={-15} cy={6} rx={4.5} ry={3} fill={ART.cheek} opacity={0.8} />
      <ellipse cx={15} cy={6} rx={4.5} ry={3} fill={ART.cheek} opacity={0.8} />
    </g>
  );
}

export function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={ART.cloud}>
      <ellipse cx={0} cy={6} rx={22} ry={8} />
      <circle cx={-8} cy={0} r={9} />
      <circle cx={6} cy={-3} r={11} />
    </g>
  );
}

export function RoundTree({ x, y, s = 1, crown = 'fill-emerald', face = true }: { x: number; y: number; s?: number; crown?: string; face?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-7 0 L-5 -46 Q0 -52 5 -46 L7 0 Z" fill={ART.trunk} />
      <path d="M-3 -30 L-16 -44" stroke={ART.trunk} strokeWidth={5} strokeLinecap="round" />
      <path d="M3 -24 L15 -38" stroke={ART.trunk} strokeWidth={5} strokeLinecap="round" />
      <g className={crown}>
        <circle cx={0} cy={-70} r={30} />
        <circle cx={-26} cy={-56} r={20} />
        <circle cx={26} cy={-56} r={20} />
        <circle cx={-14} cy={-92} r={18} />
        <circle cx={16} cy={-90} r={19} />
      </g>
      <g className="fill-mint" opacity={0.35}>
        <circle cx={-12} cy={-84} r={8} />
        <circle cx={-30} cy={-60} r={6} />
      </g>
      {face && <Face x={0} y={-64} />}
    </g>
  );
}

export function PineTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-5} y={-14} width={10} height={16} fill={ART.trunkDark} />
      <path d="M0 -110 L34 -56 L20 -56 L42 -14 L-42 -14 L-20 -56 L-34 -56 Z" className="fill-primary" />
      <path d="M0 -110 L12 -90 L-4 -84 Z" className="fill-mint" opacity={0.4} />
      <Face x={0} y={-44} s={0.9} />
    </g>
  );
}

export function Sprout({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L0 -16" className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M0 -12 C-10 -22 -20 -18 -20 -12 C-12 -6 -4 -8 0 -12Z" className="fill-emerald" />
      <path d="M0 -14 C8 -26 20 -22 20 -16 C12 -10 4 -10 0 -14Z" className="fill-primary" />
    </g>
  );
}

export function Leaf({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
      d="M0 0 C6 -10 18 -10 22 0 C18 10 6 10 0 0Z"
      className="fill-emerald"
    />
  );
}

