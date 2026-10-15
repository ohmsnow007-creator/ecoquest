import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const LEAVES = [
  { x: -120, y: -90, r: -40 },
  { x: 120, y: -80, r: 35 },
  { x: -90, y: 40, r: -70 },
  { x: 100, y: 50, r: 80 },
  { x: -30, y: -120, r: 10 },
  { x: 40, y: -110, r: -20 },
];

export function LeafBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {LEAVES.map((l, i) => (
        <motion.span
          key={i}
          className="absolute text-emerald"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ x: l.x, y: l.y, opacity: [0, 1, 0], scale: 1, rotate: l.r }}
          transition={{ duration: 1.1, delay: 0.1 + i * 0.03, ease: 'easeOut' }}
        >
          <Leaf size={18} />
        </motion.span>
      ))}
    </div>
  );
}

