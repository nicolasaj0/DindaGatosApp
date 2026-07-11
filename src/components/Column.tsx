import { useMemo } from 'react';
import { Hospedagem, HospedagemStatus, TipoServico } from '../types';
import { Card } from './Card';
import { getStatusLabel, labelStatus } from '../utils';

interface ColumnProps {
  status: HospedagemStatus;
  items: Hospedagem[];
  onEdit: (hospedagem: Hospedagem) => void;
  onCheckOut?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  layoutMode: 'columns' | 'rows';
  serviceFilter?: TipoServico | 'todos';
}

export function Column({ status, items, onEdit, onCheckOut, onCheckIn, layoutMode, serviceFilter }: ColumnProps) {
  const count = useMemo(() => items.length, [items]);
  const isRowMode = layoutMode === 'rows';

  const headerLabel = useMemo(() => {
    if (serviceFilter && serviceFilter !== 'todos') {
      return labelStatus(status, serviceFilter);
    }
    return getStatusLabel(status);
  }, [status, serviceFilter]);

  return (
    <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-warmBg-900/80 p-5 shadow-sm transition backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold font-serif uppercase tracking-wider text-slate-650 dark:text-slate-350">{headerLabel}</p>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 font-bold">
            {count}
          </span>
        </div>
      </div>
      
      <div 
        className={
          isRowMode
            ? "flex flex-row gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scroll-smooth select-none"
            : "space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin"
        }
      >
        {count === 0 ? (
          <div className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-6 text-center text-slate-400 dark:text-slate-500 ${isRowMode ? 'min-w-[280px] py-12' : 'w-full'}`}>
            <span className="text-2xl mb-1">🐾</span>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Nenhum serviço nesta lista</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className={isRowMode ? "min-w-[310px] sm:min-w-[340px] max-w-[360px] flex-shrink-0" : "w-full"}
            >
              <Card hospedagem={item} onEdit={onEdit} onCheckOut={onCheckOut} onCheckIn={onCheckIn} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
