import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 sm:p-4 transition-colors"
    >
      <div className="w-full max-w-2xl bg-parchment-elevated text-ink border border-border-ledger shadow-md flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[90vh] sm:rounded-card">
        <div className="flex items-center justify-between border-b border-border-ledger px-4 sm:px-6 py-3.5 flex-shrink-0">
          <h2 className="text-lg font-bold font-display text-ink tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-card border border-border-ledger p-1.5 text-ink-subtle hover:text-ink hover:border-border-ledger-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
