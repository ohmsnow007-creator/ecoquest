import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Size = 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'danger' | 'onDark';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-[0_6px_16px_rgb(14_127_89/0.28)] hover:bg-forest',
  secondary: 'bg-surface text-forest border border-border hover:border-primary/40 hover:bg-pale-mint',
  danger: 'bg-danger text-white hover:bg-danger/90',
  onDark: 'bg-lime text-forest shadow-[0_6px_16px_rgb(217_247_106/0.25)] hover:bg-mint',
};

const SIZE: Record<Size, string> = {
  md: 'min-h-11 px-5 text-body',
  lg: 'min-h-12 px-6 text-base',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', fullWidth = false): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,border-color,transform] select-none',
    'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
    VARIANT[variant],
    SIZE[size],
    fullWidth ? 'w-full' : '',
  ].join(' ');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  size?: Size;
}

export function PrimaryButton({ icon, iconRight, fullWidth, size, className = '', children, type = 'button', tone = 'primary', ...rest }: ButtonProps & { tone?: 'primary' | 'danger' | 'onDark' }) {
  return (
    <button type={type} className={`${buttonClasses(tone, size, fullWidth)} ${className}`} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function SecondaryButton({ icon, iconRight, fullWidth, size, className = '', children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`${buttonClasses('secondary', size, fullWidth)} ${className}`} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ChunkyButton({ icon, iconRight, fullWidth, className = '', children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-lime px-8 font-display text-base font-semibold text-forest shadow-[0_5px_0_0_rgb(18_60_46)] transition-[transform,box-shadow] select-none hover:brightness-110 active:translate-y-[3px] active:shadow-[0_2px_0_0_rgb(18_60_46)] disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'ghost' | 'surface' | 'onDark';
}

const ICON_VARIANT = {
  ghost: 'text-forest hover:bg-forest/5',
  surface: 'bg-surface text-forest border border-border shadow-card hover:bg-pale-mint',
  onDark: 'bg-white/10 text-white hover:bg-white/20',
};

export function IconButton({ variant = 'ghost', className = '', children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${ICON_VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
