import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Size = 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'danger' | 'onDark';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-card hover:bg-forest',
  secondary: 'bg-surface text-text border border-border hover:bg-background',
  danger: 'bg-danger text-white hover:bg-danger/90',
  onDark: 'bg-lime text-forest hover:bg-mint',
};

const SIZE: Record<Size, string> = {
  md: 'min-h-11 px-5 text-body',
  lg: 'min-h-12 px-6 text-base',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', fullWidth = false): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors select-none',
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

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'ghost' | 'surface' | 'onDark';
}

const ICON_VARIANT = {
  ghost: 'text-text hover:bg-forest/5',
  surface: 'bg-surface text-text border border-border shadow-card hover:bg-background',
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
