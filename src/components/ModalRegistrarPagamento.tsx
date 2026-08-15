import { useState, useEffect } from 'react';
import { Hospedagem } from '../types';
import { calculateEstadiaTotals } from '../utils';
import { DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModalRegistrarPagamentoProps {
  isOpen: boolean;
  hospedagem: Hospedagem | null;
  onClose: () => void;
  onConfirm: (estadiaId: string, valor: number) => void;
}

export function ModalRegistrarPagamento({
  isOpen,
  hospedagem,
  onClose,
  onConfirm,
}: ModalRegistrarPagamentoProps) {
  const [valorInput, setValorInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (hospedagem) {
      const { valorTotal } = calculateEstadiaTotals(hospedagem);
      const valorPago = hospedagem.valorPago || 0;
      const saldoRestante = Math.max(0, valorTotal - valorPago);
      setValorInput(saldoRestante > 0 ? saldoRestante.toFixed(2) : '');
      setErrorMsg('');
    }
  }, [hospedagem, isOpen]);

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

  if (!isOpen || !hospedagem) return null;

  const totals = calculateEstadiaTotals(hospedagem);
  const valorPago = hospedagem.valorPago || 0;
  const saldoRestante = Math.max(0, totals.valorTotal - valorPago);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(valorInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Por favor, informe um valor maior que zero.');
      return;
    }
    if (parsed > saldoRestante + 0.01) {
      setErrorMsg(`O valor não pode ser superior ao saldo restante (R$ ${saldoRestante.toFixed(2)}).`);
      return;
    }

    onConfirm(hospedagem.id, parsed);
    onClose();
  };

  const setPreset = (valor: number) => {
    const clamped = Math.min(valor, saldoRestante);
    setValorInput(clamped.toFixed(2));
    setErrorMsg('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md bg-white dark:bg-warmBg-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sucesso-50 dark:bg-sucesso-950/40 rounded-2xl text-sucesso-600 dark:text-sucesso-400">
            <DollarSign size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
              Registrar Pagamento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hospedagem.nomeGato} • Tutor(a): {hospedagem.nomeTutor}
            </p>
          </div>
        </div>

        {/* Resumo financeiro da reserva */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Valor Total da Reserva:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              R$ {totals.valorTotal.toFixed(2)}
            </span>
          </div>
          {totals.valorTransporte > 0 && (
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-500 pl-2 border-l-2 border-slate-300 dark:border-slate-700">
              <span>Inclui Transporte:</span>
              <span>R$ {totals.valorTransporte.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sucesso-600 dark:text-sucesso-400">
            <span>Já Recebido:</span>
            <span className="font-bold">R$ {valorPago.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-mostarda-700 dark:text-mostarda-400 font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-sm">
            <span>Saldo Restante:</span>
            <span>R$ {saldoRestante.toFixed(2)}</span>
          </div>
        </div>

        {/* Form para valor do novo pagamento */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              Valor a Receber Agora (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={saldoRestante}
              value={valorInput}
              onChange={(e) => {
                setValorInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder="0,00"
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-lg font-bold text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
              autoFocus
            />
          </div>

          {/* Botões de atalho rápido */}
          <div className="flex flex-wrap gap-2">
            {saldoRestante > 0 && (
              <button
                type="button"
                onClick={() => setPreset(saldoRestante)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold hover:bg-emerald-100 transition"
              >
                Quitar Saldo (R$ {saldoRestante.toFixed(2)})
              </button>
            )}
            {valorPago === 0 && saldoRestante > 0 && (
              <button
                type="button"
                onClick={() => setPreset(totals.valorTotal * 0.5)}
                className="px-3 py-1.5 rounded-xl bg-mostarda-50 dark:bg-mostarda-950/30 text-mostarda-800 dark:text-mostarda-400 border border-mostarda-200 dark:border-mostarda-900/50 text-xs font-bold hover:bg-mostarda-100 transition"
              >
                50% Entrada (R$ {(totals.valorTotal * 0.5).toFixed(2)})
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sucesso-500 py-2.5 text-sm font-semibold text-white hover:bg-sucesso-600 shadow-md shadow-sucesso-500/10 transition"
            >
              <CheckCircle2 size={16} />
              Confirmar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
