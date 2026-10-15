import { EcoMascot } from './EcoMascot';

interface LogoProps {
  variant?: 'inline' | 'chunky';
}

export function Logo({ variant = 'inline' }: LogoProps) {
  if (variant === 'chunky') {
    return (
      <div className="flex flex-col items-center" role="img" aria-label="EcoQuest">
        <span className="rounded-full bg-mint/70 p-3 shadow-[0_0_0_10px_rgb(217_249_157/0.35)]">
          <EcoMascot size={120} mood="happy" title="" />
        </span>
        <p className="-mt-2 font-display text-[3.25rem] leading-[1.05] font-bold tracking-tight" aria-hidden="true">
          <span className="text-chunky block text-center text-lime">Eco</span>
          <span className="text-chunky block text-center text-warning">Quest</span>
        </p>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <EcoMascot size={34} title="" />
      <span className="font-display text-section font-bold">
        <span className="text-primary">Eco</span>
        <span className="text-sunset">Quest</span>
      </span>
    </span>
  );
}
