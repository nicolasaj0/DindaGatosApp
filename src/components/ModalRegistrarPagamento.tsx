import { useState, useEffect } from 'react';
import { Hospedagem } from '../types';
import { calculateEstadiaTotals, formatCurrency } from '../utils';
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
      setErrorMsg(`O valor não pode ser superior ao saldo restante (${formatCurrency(saldoRestante)}).`);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 transition-colors"
    >
      <div className="w-full max-w-md bg-parchment-elevated text-ink rounded-card p-5 sm:p-6 shadow-md border border-border-ledger space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-parchment rounded-card border border-border-ledger text-stamp-moss">
            <DollarSign size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-ink tracking-tight">
              Registrar Pagamento
            </h3>
            <p className="text-xs font-body text-ink-subtle">
              {hospedagem.nomeGato} • Tutor: <span className="font-medium text-ink">{hospedagem.nomeTutor}</span>
            </p>
          </div>
        </div>

        {/* Resumo financeiro da reserva */}
        <div className="bg-parchment p-3.5 rounded-card border border-border-ledger space-y-2 text-xs font-mono">
          <div className="flex justify-between text-ink-subtle">
            <span>Valor Total da Reserva:</span>
            <span className="font-bold text-ink">
              {formatCurrency(totals.valorTotal)}
            </span>
          </div>
          {totals.valorTransporte > 0 && (
            <div className="flex justify-between text-[11px] text-ink-muted pl-2 border-l border-border-ledger">
              <span>Inclui Transporte:</span>
              <span>{formatCurrency(totals.valorTransporte)}</span>
            </div>
          )}
          <div className="flex justify-between text-stamp-moss">
            <span>Já Recebido:</span>
            <span className="font-bold">{formatCurrency(valorPago)}</span>
          </div>
          <div className="flex justify-between text-stamp-gold font-bold border-t border-border-ledger pt-2 text-sm">
            <span>Saldo Restante:</span>
            <span>{formatCurrency(saldoRestante)}</span>
          </div>
        </div>

        {/* Form para valor do novo pagamento */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
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
              className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-2 text-base font-mono font-bold text-ink focus:border-border-ledger-hover outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Botões de atalho rápido */}
          <div className="flex flex-wrap gap-2">
            {saldoRestante > 0 && (
              <button
                type="button"
                onClick={() => setPreset(saldoRestante)}
                className="px-2.5 py-1 rounded-card border border-border-ledger bg-parchment text-ink text-xs font-mono font-medium hover:border-border-ledger-hover transition-colors"
              >
                Quitar Saldo ({formatCurrency(saldoRestante)})
              </button>
            )}
            {valorPago === 0 && saldoRestante > 0 && (
              <button
                type="button"
                onClick={() => setPreset(totals.valorTotal * 0.5)}
                className="px-2.5 py-1 rounded-card border border-border-ledger bg-parchment text-ink text-xs font-mono font-medium hover:border-border-ledger-hover transition-colors"
              >
                50% Entrada ({formatCurrency(totals.valorTotal * 0.5)})
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-stamp-wine font-body font-semibold bg-parchment p-2.5 rounded-card border border-stamp-wine">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2 border-t border-border-ledger">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-card border border-border-ledger bg-parchment py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-card bg-stamp-moss text-parchment border border-stamp-moss py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
            >
              <CheckCircle2 size={14} />
              Confirmar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
