import { motion } from 'framer-motion';
import { Leaf, Sprout } from 'lucide-react';
import { GreenWorldScene } from './GreenWorldScene';
import { WorldBuddy } from './WorldBuddy';
import { worldStages } from '../../data/worldStages';

interface Props {
  stage: number;
  title: string;
  /** Short line in the bubble at the top (why the world looks like this). */
  caption?: string;
  /** id for the stage title, so a section can be labelled by it. */
  titleId?: string;
  className?: string;
}

/**
 * The green world as shown on Home and on the world page: the live scene, a soft lime rim, leafy vines,
 * a caption bubble, the stage chip with progress dots, and the little planet buddy (tap it, or leave it to doze).
 */
export function WorldStageView({ stage, title, caption, titleId, className = 'h-60 sm:h-72 lg:h-80' }: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <GreenWorldScene key={stage} stage={stage} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-lime/25 ring-inset" />
      <WorldVine className="absolute top-0 left-0" />
      <WorldVine className="absolute top-0 right-0 -scale-x-100" delay={1.2} />
      {caption && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 flex w-[calc(100%-84px)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl border-2 border-mint/70 bg-surface/95 px-3 py-2 text-left text-caption font-medium text-forest shadow-card"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#DCFCE7] text-primary">
            <Leaf size={15} aria-hidden="true" />
          </span>
          <span className="min-w-0">{caption}</span>
        </motion.p>
      )}
      <span className="absolute bottom-3 left-3 rounded-2xl bg-forest/90 px-3 py-1.5 text-white shadow-card ring-1 ring-lime/30 backdrop-blur">
        <span className="flex items-center gap-1 text-[0.75rem] leading-tight text-mint">
          <Sprout size={12} aria-hidden="true" /> ระดับ {stage}
        </span>
        <span id={titleId} className="block text-caption leading-tight font-semibold">{title}</span>
        <span className="mt-1 flex gap-0.5" aria-label={`ระดับโลก ${stage} จาก ${worldStages.length - 1}`}>
          {worldStages.slice(1).map((s) => (
            <span key={s.stage} className={`h-1.5 w-2.5 rounded-full ${s.stage <= stage ? 'bg-lime' : 'bg-white/20'}`} />
          ))}
        </span>
      </span>
      <span className="absolute right-2 bottom-1">
        <WorldBuddy />
      </span>
    </div>
  );
}

/** A small leafy vine hanging from a corner of the world, swaying gently. */
function WorldVine({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={60} height={60} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <g className="scene-sway" style={{ transformOrigin: '6px 0px', animationDelay: `${delay}s` }}>
        <path d="M4 0 C10 16 18 26 30 34" stroke="#5DAA43" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M10 12 C2 12 0 20 4 22 C10 22 12 16 10 12Z" fill="#7CCB4F" />
        <path d="M18 22 C20 14 28 14 28 18 C28 24 22 26 18 22Z" fill="#4FAF6A" />
        <path d="M26 32 C20 34 20 42 24 42 C30 42 30 36 26 32Z" fill="#9BE15D" />
        <circle cx="31" cy="35" r="3" fill="#FDE68A" />
      </g>
    </svg>
  );
}
