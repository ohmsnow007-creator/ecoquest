import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IconButton } from './Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean | string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, back, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  const goBack = () => {
    if (typeof back === 'string') navigate(back);
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <header className="safe-top pt-5 pb-4 lg:pt-10 lg:pb-6">
      {back && (
        <IconButton aria-label="ย้อนกลับ" variant="surface" onClick={goBack} className="mb-3">
          <ArrowLeft size={20} />
        </IconButton>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="text-caption font-semibold text-primary">{eyebrow}</p>}
          <h1 className="text-page font-bold lg:text-[1.875rem]">{title}</h1>
          {subtitle && <p className="mt-1 text-body text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
