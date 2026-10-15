import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { SproutySeed } from '../illustrations/SproutySeed';
import { SecondaryButton } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-6' : 'py-10'}`}>
      <span className={`block ${compact ? 'w-24' : 'w-32'}`}>
        <SproutySeed size={compact ? 96 : 128} className="h-auto w-full" mood="sleepy" title="Sprouty กำลังรอคุณ" />
      </span>
      <h3 className="mt-3 text-card font-semibold text-forest">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-body text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'chart';
  label?: string;
}

function Bone({ className }: { className: string }) {
  return <div className={`skeleton rounded-control bg-pale-mint ${className}`} />;
}

export function LoadingSkeleton({ variant = 'page', label = 'กำลังโหลด' }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-live="polite" className="w-full">
      <span className="sr-only">{label}</span>
      {variant === 'page' && (
        <div className="space-y-4 py-6">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72 max-w-full" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Bone className="h-24" />
            <Bone className="h-24" />
            <Bone className="h-24" />
            <Bone className="h-24" />
          </div>
          <Bone className="h-48" />
        </div>
      )}
      {variant === 'card' && <Bone className="h-28" />}
      {variant === 'chart' && <Bone className="h-56" />}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  title = 'เกิดข้อผิดพลาด',
  description = 'ไม่สามารถแสดงส่วนนี้ได้ ข้อมูลของคุณยังถูกเก็บไว้ในเครื่องตามเดิม',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger" aria-hidden="true">
        <AlertTriangle size={26} />
      </span>
      <h3 className="mt-3 text-card font-semibold text-forest">{title}</h3>
      <p className="mt-1 max-w-sm text-body text-muted">{description}</p>
      <div className="mt-4 flex gap-2">
        {onRetry && (
          <SecondaryButton icon={<RotateCcw size={16} />} onClick={onRetry}>
            ลองอีกครั้ง
          </SecondaryButton>
        )}
        {action}
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EcoQuest UI error:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      // A page's code chunk failed to download (offline before it was cached, or replaced by an update).
      // React.lazy keeps the failed import, so only a reload can fetch it again.
      const chunkFailed = /dynamically imported module|Importing a module script failed|Loading chunk/i.test(error.message);
      if (chunkFailed) {
        return (
          <ErrorState
            title="โหลดหน้านี้ไม่สำเร็จ"
            description={
              typeof navigator !== 'undefined' && !navigator.onLine
                ? 'คุณออฟไลน์อยู่และหน้านี้ยังไม่ได้ถูกเก็บไว้ในเครื่อง ลองอีกครั้งเมื่อเชื่อมต่ออินเทอร์เน็ต ข้อมูลของคุณยังอยู่ครบ'
                : 'ไฟล์ของหน้านี้โหลดไม่สำเร็จ ลองโหลดหน้าใหม่ ข้อมูลของคุณยังอยู่ครบ'
            }
            onRetry={() => window.location.reload()}
          />
        );
      }
      return <ErrorState onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
