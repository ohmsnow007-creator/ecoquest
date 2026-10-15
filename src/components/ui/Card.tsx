import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article';
  tone?: 'surface' | 'forest' | 'mint' | 'lime';
  padded?: boolean;
}

const TONE = {
  surface: 'bg-surface border border-border text-text',
  forest: 'bg-forest text-white',
  mint: 'bg-mint/50 border border-mint text-text',
  lime: 'bg-lime text-forest',
};

export function Card({ as: Tag = 'div', tone = 'surface', padded = true, className = '', children, ...rest }: CardProps) {
  return (
    <Tag className={`rounded-card shadow-card ${TONE[tone]} ${padded ? 'p-4 sm:p-5' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

interface SectionTitleProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}

export function SectionTitle({ title, icon, action, id, className = '' }: SectionTitleProps) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <h2 id={id} className="flex items-center gap-2 text-section font-semibold">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}
