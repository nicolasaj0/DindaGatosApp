import { Hospedagem } from '../types';
import { Calendar, Pill, Edit2, User, AlertCircle, HeartPulse, MapPin, DollarSign, Car, Undo2 } from 'lucide-react';
import { useHospedagemStore } from '../store';
import { formatDateString, calculateEstadiaTotals, labelStatus } from '../utils';

interface FichaHospedagemProps {
  hospedagem: Hospedagem;
  onClose: () => void;
  onEditClick: () => void;
  onOpenPagamentoModal?: (hospedagem: Hospedagem) => void;
}

export function FichaHospedagem({ hospedagem, onClose, onEditClick, onOpenPagamentoModal }: FichaHospedagemProps) {
  const reverterUltimoPagamento = useHospedagemStore((state) => state.reverterUltimoPagamento);

  const hasMedication = !!hospedagem.perfil.medicamentos?.trim() && hospedagem.perfil.medicamentos.toLowerCase() !== 'nenhum';
  const totals = calculateEstadiaTotals(hospedagem);
  const valorPago = hospedagem.valorPago || 0;
  const saldoRestante = Math.max(0, totals.valorTotal - valorPago);

  const getServiceLabel = () => {
    if (hospedagem.tipoServico === 'hospedagem') return 'Hospedagem';
    if (hospedagem.tipoServico === 'cat_sitter') return 'Cat Sitter';
    return 'Transporte';
  };

  return (
    <div className="space-y-4 font-body text-ink">
      {/* Cabeçalho do Prontuário */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-between pb-3.5 border-b border-border-ledger">
        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          <div className="h-16 w-16 overflow-hidden rounded-card border border-border-ledger bg-parchment flex-shrink-0 flex items-center justify-center">
            {hospedagem.fotoUrl ? (
              <img src={hospedagem.fotoUrl} alt={hospedagem.nomeGato} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-muted text-xl font-bold font-display">
                {hospedagem.nomeGato.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-ink tracking-tight">{hospedagem.nomeGato}</h3>
            <p className="mt-0.5 flex items-center justify-center sm:justify-start gap-1.5 text-ink-subtle text-xs">
              <User size={13} />
              <span>Tutor(a): <strong className="text-ink">{hospedagem.nomeTutor}</strong></span>
            </p>
            {hospedagem.enderecoTutor && (
              <p className="text-[11px] text-ink-muted mt-0.5 text-center sm:text-left">
                Endereço: {hospedagem.enderecoTutor}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-card px-2.5 py-1 text-xs font-mono font-medium bg-parchment text-ink border border-border-ledger">
            {getServiceLabel()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-card px-2.5 py-1 text-xs font-mono font-medium bg-parchment text-ink border border-border-ledger">
            {hospedagem.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-card px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-parchment text-stamp-plum border border-stamp-plum">
            {labelStatus(hospedagem.status, hospedagem.tipoServico)}
          </span>
        </div>
      </div>

      {/* Grid de Informações da Caderneta */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Datas / Serviço */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <Calendar size={13} /> Detalhes do Período
          </h4>
          {hospedagem.tipoServico === 'transporte' ? (
            <p className="text-xs text-ink">Data: <strong className="font-mono">{formatDateString(hospedagem.dataCheckIn, true)}</strong></p>
          ) : (
            <div className="space-y-1 text-xs text-ink">
              <p>Check-in: <strong className="font-mono">{formatDateString(hospedagem.dataCheckIn, true)}</strong></p>
              <p>Check-out: <strong className="font-mono">{formatDateString(hospedagem.dataCheckOut, true)}</strong></p>
            </div>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2 items-center font-mono text-xs">
            <span className="text-ink-subtle bg-parchment-elevated border border-border-ledger rounded-card px-2 py-0.5">
              {hospedagem.tipoServico === 'transporte' ? 'transporte' : totals.nights === 1 ? '1 diária 🌙' : `${totals.nights} diárias 🌙`}
            </span>
            <span className="text-ink font-semibold bg-parchment-elevated border border-border-ledger rounded-card px-2 py-0.5">
              {totals.valorTransporte > 0
                ? `Serviço: R$ ${totals.valorServico.toFixed(0)} + Transp: R$ ${totals.valorTransporte.toFixed(0)} = R$ ${totals.valorTotal.toFixed(2)}`
                : `Diária: R$ ${hospedagem.valorDiaria || 0} • Total: R$ ${totals.valorTotal.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Medicamentos */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <Pill size={13} /> Medicamentos
          </h4>
          {hasMedication ? (
            <p className="text-xs font-semibold text-stamp-wine">{hospedagem.perfil.medicamentos}</p>
          ) : (
            <p className="text-xs italic text-ink-muted">Sem medicação prescrita.</p>
          )}
        </div>

        {/* Endereço e Detalhes do Serviço (Cat Sitter e Transporte) */}
        {hospedagem.tipoServico !== 'hospedagem' && (
          <div className="rounded-card bg-parchment p-3.5 border border-border-ledger sm:col-span-2">
            <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin size={13} /> Detalhes do Atendimento
            </h4>
            <p className="text-xs text-ink">
              Endereço: <strong>{hospedagem.enderecoServico || 'Não informado'}</strong>
            </p>
            {hospedagem.detalhesServico && (
              <p className="text-xs text-ink-subtle mt-1.5 bg-parchment-elevated p-2 rounded-card border border-border-ledger">
                Observações do serviço: {hospedagem.detalhesServico}
              </p>
            )}
          </div>
        )}

        {/* Detalhes de Transporte Embutido */}
        {hospedagem.transporteAdicional && hospedagem.tipoServico !== 'transporte' && (
          <div className="rounded-card bg-parchment p-3.5 border border-border-ledger sm:col-span-2">
            <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <Car size={13} /> Transporte Adicional Embutido
            </h4>
            <p className="text-xs text-ink">
              Valor adicional: <strong className="font-mono">R$ {hospedagem.transporteAdicional.valor.toFixed(2)}</strong>
              {hospedagem.transporteAdicional.detalhes && (
                <span className="block mt-0.5 text-ink-subtle">
                  Instruções: {hospedagem.transporteAdicional.detalhes}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Controle Financeiro de Pagamento */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              Controle Financeiro
            </h4>
            <span className="font-mono text-xs text-ink font-semibold">Total: R$ {totals.valorTotal.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-parchment-elevated p-3 rounded-card border border-border-ledger">
            <div>
              <p className="text-xs font-medium text-ink">
                Status: <strong className={
                  hospedagem.statusPagamento === 'pago' ? 'text-stamp-moss' :
                  hospedagem.statusPagamento === 'parcial' ? 'text-stamp-gold' :
                  'text-ink-subtle'
                }>
                  {hospedagem.statusPagamento === 'pago' ? 'Quitado (100%)' :
                   hospedagem.statusPagamento === 'parcial' ? `Parcial (R$ ${valorPago.toFixed(2)} / R$ ${totals.valorTotal.toFixed(2)})` :
                   'Pendente'}
                </strong>
              </p>
              <p className="text-xs font-mono text-ink-subtle mt-0.5">
                Recebido: <strong className="text-stamp-moss">R$ {valorPago.toFixed(2)}</strong> • Saldo a Receber: <strong className="text-stamp-gold">R$ {saldoRestante.toFixed(2)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {valorPago > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente desfazer o último recebimento registrado?')) {
                      reverterUltimoPagamento(hospedagem.id);
                    }
                  }}
                  className="rounded-card px-2.5 py-1.5 text-xs font-body font-medium border border-border-ledger bg-parchment text-ink hover:border-border-ledger-hover transition-colors flex items-center gap-1"
                  title="Reverter último pagamento"
                >
                  <Undo2 size={12} />
                  <span>Desfazer</span>
                </button>
              )}
              {saldoRestante > 0 && onOpenPagamentoModal && (
                <button
                  type="button"
                  onClick={() => onOpenPagamentoModal(hospedagem)}
                  className="rounded-card px-3 py-1.5 text-xs font-body font-semibold bg-stamp-moss text-parchment border border-stamp-moss hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <DollarSign size={13} />
                  <span>Registrar Pagamento</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Registro de Operações */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger sm:col-span-2">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            Registro de Operações & Timestamps
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-xs font-mono">
            {hospedagem.dataHoraConfirmacaoCheckIn && (
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-2.5">
                <span className="font-bold text-ink block">{hospedagem.tipoServico === 'hospedagem' ? 'Check-in:' : 'Início:'}</span>
                <span className="text-ink-subtle">{hospedagem.dataHoraConfirmacaoCheckIn}</span>
              </div>
            )}
            {hospedagem.dataHoraConfirmacaoCheckOut && (
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-2.5">
                <span className="font-bold text-ink block">{hospedagem.tipoServico === 'hospedagem' ? 'Check-out:' : 'Conclusão:'}</span>
                <span className="text-ink-subtle">{hospedagem.dataHoraConfirmacaoCheckOut}</span>
              </div>
            )}
            {hospedagem.historicoPagamentos && hospedagem.historicoPagamentos.length > 0 ? (
              hospedagem.historicoPagamentos.map((pag, idx) => (
                <div key={pag.id || idx} className="rounded-card border border-border-ledger bg-parchment-elevated p-2.5">
                  <span className="font-bold text-stamp-moss block">
                    Recebido R$ {pag.valor.toFixed(2)}:
                  </span>
                  <span className="text-ink-subtle">{pag.dataHora}</span>
                </div>
              ))
            ) : (
              hospedagem.statusPagamento === 'pago' && hospedagem.dataHoraConfirmacaoPagamento && (
                <div className="rounded-card border border-border-ledger bg-parchment-elevated p-2.5">
                  <span className="font-bold text-stamp-moss block">Pagamento Recebido:</span>
                  <span className="text-ink-subtle">{hospedagem.dataHoraConfirmacaoPagamento}</span>
                </div>
              )
            )}
            {hospedagem.dataHoraReversaoPagamento && (
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-2.5">
                <span className="font-bold text-stamp-wine block">Recebimento Desfeito:</span>
                <span className="text-ink-subtle">{hospedagem.dataHoraReversaoPagamento}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dieta */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger sm:col-span-2">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <HeartPulse size={13} /> Alimentação (Dieta)
          </h4>
          <p className="text-xs text-ink-subtle leading-relaxed">{hospedagem.perfil.dieta || 'Não especificada.'}</p>
        </div>

        {/* Personalidade */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <AlertCircle size={13} /> Personalidade
          </h4>
          <p className="text-xs text-ink-subtle">{hospedagem.perfil.personalidade || 'Não informada.'}</p>
        </div>

        {/* Observações */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
            Observações Gerais
          </h4>
          <p className="text-xs text-ink-subtle leading-relaxed">{hospedagem.perfil.observacoes || 'Nenhuma observação adicional.'}</p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2.5 pt-3 border-t border-border-ledger">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-card border border-border-ledger bg-parchment py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
        >
          Fechar
        </button>
        <button
          type="button"
          onClick={onEditClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-card bg-stamp-plum text-parchment border border-stamp-plum py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
        >
          <Edit2 size={14} />
          Editar Ficha
        </button>
      </div>
    </div>
  );
}
