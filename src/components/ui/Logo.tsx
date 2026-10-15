import { Leaf } from 'lucide-react';
import { EcoMascot } from './EcoMascot';

interface LogoProps {
  variant?: 'inline' | 'chunky';
}

export function Logo({ variant = 'inline' }: LogoProps) {
  if (variant === 'chunky') {
    return (
      <div className="flex flex-col items-center" role="img" aria-label="EcoQuest">
        <span className="rounded-full bg-mint/80 p-3 shadow-[0_0_0_10px_rgb(168_240_207/0.22)]">
          <EcoMascot size={120} mood="happy" title="" />
        </span>
        <p className="-mt-2 font-display text-[3.25rem] leading-[1.05] font-bold tracking-tight" aria-hidden="true">
          <span className="text-chunky block text-center text-white">Eco</span>
          <span className="text-chunky block text-center text-lime">Quest</span>
        </p>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <EcoMascot size={34} title="" />
      <span className="inline-flex items-center gap-0.5 font-display text-section font-bold">
        <span className="text-forest">Eco</span>
        <span className="text-primary">Quest</span>
        <Leaf size={16} className="-mt-2 text-emerald" aria-hidden="true" />
      </span>
    </span>
  );
}
