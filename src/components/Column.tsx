import { useMemo } from 'react';
import { Hospedagem, HospedagemStatus, TipoServico } from '../types';
import { Card } from './Card';
import { getStatusLabel, labelStatus } from '../utils';
import { ClipboardList } from 'lucide-react';

interface ColumnProps {
  status: HospedagemStatus;
  items: Hospedagem[];
  onEdit: (hospedagem: Hospedagem) => void;
  onCheckOut?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onOpenPagamentoModal?: (hospedagem: Hospedagem) => void;
  layoutMode: 'columns' | 'rows';
  serviceFilter?: TipoServico | 'todos';
}

export function Column({ status, items, onEdit, onCheckOut, onCheckIn, onOpenPagamentoModal, layoutMode, serviceFilter }: ColumnProps) {
  const count = useMemo(() => items.length, [items]);
  const isRowMode = layoutMode === 'rows';

  const headerLabel = useMemo(() => {
    if (serviceFilter && serviceFilter !== 'todos') {
      return labelStatus(status, serviceFilter);
    }
    return getStatusLabel(status);
  }, [status, serviceFilter]);

  return (
    <section className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm transition-colors duration-150">
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-border-ledger pb-2.5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold font-display uppercase tracking-wider text-ink">{headerLabel}</p>
          <span className="inline-flex items-center justify-center rounded-card bg-parchment border border-border-ledger text-ink-subtle text-xs font-mono px-2 py-0.5 font-medium">
            {count}
          </span>
        </div>
      </div>

      <div
        className={
          isRowMode
            ? "flex flex-row gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth select-none"
            : "space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin"
        }
      >
        {count === 0 ? (
          <div className={`flex flex-col items-center justify-center rounded-card border border-dashed border-border-ledger bg-parchment p-6 text-center text-ink-muted ${isRowMode ? 'min-w-[280px] py-10' : 'w-full'}`}>
            <ClipboardList size={22} strokeWidth={1.5} className="mb-1 opacity-70 text-ink-muted" />
            <p className="text-xs font-body font-medium text-ink">Nenhum hóspede neste status</p>
            <p className="text-[11px] font-body text-ink-muted mt-0.5">Novos registros aparecerão aqui automaticamente 📋</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={isRowMode ? "min-w-[310px] sm:min-w-[340px] max-w-[360px] flex-shrink-0" : "w-full"}
            >
              <Card
                hospedagem={item}
                onEdit={onEdit}
                onCheckOut={onCheckOut}
                onCheckIn={onCheckIn}
                onOpenPagamentoModal={onOpenPagamentoModal}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
