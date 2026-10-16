import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton, PrimaryButton, SecondaryButton } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
}

export function Modal({ open, onClose, title, hideTitle = false, children, footer, dismissible = true }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = panelRef.current?.querySelector<HTMLElement>('button, [href], input, textarea, select');
    focusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, dismissible]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-evergreen/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissible ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            // Never taller than the screen: the title and buttons stay put, the content scrolls between them.
            className="safe-bottom relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-card bg-surface p-5 shadow-raised sm:max-h-[85dvh] sm:rounded-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" aria-hidden="true" />
            <div className={`flex items-start justify-between gap-3 ${hideTitle ? 'sr-only' : 'mb-3'}`}>
              <h2 id={titleId} className="text-section font-bold text-forest">{title}</h2>
              {dismissible && !hideTitle && (
                <IconButton aria-label="ปิด" onClick={onClose} className="-mt-2 -mr-2">
                  <X size={20} />
                </IconButton>
              )}
            </div>
            <div className="-mx-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-1">{children}</div>
            {footer && <div className="mt-4 flex shrink-0 gap-2 border-t border-border pt-4 *:flex-1 sm:justify-end sm:*:flex-none">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({ open, title, description, confirmLabel, cancelLabel = 'ยกเลิก', tone = 'primary', onConfirm, onCancel }: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
          <PrimaryButton tone={tone} onClick={onConfirm}>{confirmLabel}</PrimaryButton>
        </>
      }
    >
      <p className="text-body text-muted">{description}</p>
    </Modal>
  );
}
