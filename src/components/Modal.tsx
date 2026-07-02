import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[90vh] sm:rounded-3xl border border-transparent dark:border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
