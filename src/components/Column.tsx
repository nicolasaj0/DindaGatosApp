import { useMemo } from 'react';
import { Hospedagem, HospedagemStatus } from '../types';
import { Card } from './Card';
import { getStatusLabel } from '../utils';

interface ColumnProps {
  status: HospedagemStatus;
  items: Hospedagem[];
  onEdit: (hospedagem: Hospedagem) => void;
  onCheckOut?: (id: string) => void;
  onCheckIn?: (id: string) => void;
}

export function Column({ status, items, onEdit, onCheckOut, onCheckIn }: ColumnProps) {
  const count = useMemo(() => items.length, [items]);

  return (
    <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm transition backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">{getStatusLabel(status)}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
        </div>
      </div>
      <div className="space-y-3">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-6 text-center text-slate-400 dark:text-slate-500">
            <span className="text-2xl mb-1">🐾</span>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Nenhum hóspede nesta lista</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} hospedagem={item} onEdit={onEdit} onCheckOut={onCheckOut} onCheckIn={onCheckIn} />
          ))
        )}
      </div>
    </section>
  );
}
