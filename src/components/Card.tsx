import { useState, useEffect, useRef } from 'react';
import { Camera, Check, DollarSign, Home, PawPrint, Car, Undo2 } from 'lucide-react';
import { Hospedagem } from '../types';
import { useHospedagemStore } from '../store';
import { getLocalDateString, formatDateString, calculateEstadiaTotals } from '../utils';

interface CardProps {
  hospedagem: Hospedagem;
  onEdit: (hospedagem: Hospedagem) => void;
  onCheckOut?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onOpenPagamentoModal?: (hospedagem: Hospedagem) => void;
}

const formatTimestampShort = (ts?: string) => {
  if (!ts) return '';
  const parts = ts.split(' ');
  if (parts.length !== 2) return ts;
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  if (dateParts.length !== 3 || timeParts.length !== 3) return ts;
  return `${dateParts[0]}/${dateParts[1]} às ${timeParts[0]}:${timeParts[1]}`;
};

export function Card({ hospedagem, onEdit, onCheckOut, onCheckIn, onOpenPagamentoModal }: CardProps) {
  const reverterUltimoPagamento = useHospedagemStore((state) => state.reverterUltimoPagamento);

  // Gatilho de animação do carimbo exclusivamente em mudança de status
  const prevStatusRef = useRef(hospedagem.status);
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    if (prevStatusRef.current !== hospedagem.status) {
      prevStatusRef.current = hospedagem.status;
      setIsSettling(true);
      const timer = setTimeout(() => setIsSettling(false), 240);
      return () => clearTimeout(timer);
    }
  }, [hospedagem.status]);

  const hasMedication = hospedagem.perfil.medicamentos &&
    hospedagem.perfil.medicamentos.trim() !== '' &&
    hospedagem.perfil.medicamentos.toLowerCase() !== 'nenhum';

  const totals = calculateEstadiaTotals(hospedagem);
  const valorPago = hospedagem.valorPago || 0;
  const progressPercent = Math.min(100, Math.max(0, (valorPago / (totals.valorTotal || 1)) * 100));

  const handleClick = () => {
    onEdit(hospedagem);
  };

  const handleCheckOutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCheckOut) {
      onCheckOut(hospedagem.id);
    }
  };

  const handleCheckInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (valorPago === 0) {
      const proceed = confirm('Nenhum valor de entrada registrado. Confirmar check-in mesmo assim?');
      if (!proceed) return;
    }
    if (onCheckIn) {
      onCheckIn(hospedagem.id);
    }
  };

  const getServiceIcon = () => {
    if (hospedagem.tipoServico === 'cat_sitter') return <PawPrint size={13} className="text-stamp-gold" />;
    if (hospedagem.tipoServico === 'transporte') return <Car size={13} className="text-ink-subtle" />;
    return <Home size={13} className="text-stamp-plum" />;
  };

  const getServiceLabel = () => {
    if (hospedagem.tipoServico === 'cat_sitter') return 'Cat Sitter';
    if (hospedagem.tipoServico === 'transporte') return 'Transporte';
    return 'Hospedagem';
  };

  const hoje = getLocalDateString();
  const showCheckInButton = hospedagem.status === 'agendado' && hoje >= hospedagem.dataCheckIn;
  const isCheckInToday = hospedagem.dataCheckIn === hoje && hospedagem.status === 'agendado';
  const isCheckOutToday = hospedagem.dataCheckOut === hoje && hospedagem.status === 'saindo_hoje';
  const isDelayed = hospedagem.status !== 'concluido' && hoje > hospedagem.dataCheckOut;

  // Configuração do Selo de Carimbo Outline
  const getStampConfig = () => {
    if (isDelayed) {
      return {
        label: 'Atrasado',
        className: 'border-stamp-wine text-stamp-wine',
      };
    }
    if (hospedagem.status === 'concluido') {
      return {
        label: 'Concluído',
        className: 'border-stamp-moss text-stamp-moss',
      };
    }
    if (hospedagem.status === 'saindo_hoje' || isCheckOutToday) {
      return {
        label: 'Saindo Hoje',
        className: 'border-stamp-gold text-stamp-gold',
      };
    }
    if (isCheckInToday) {
      return {
        label: 'Começa Hoje',
        className: 'border-stamp-plum text-stamp-plum',
      };
    }
    if (hospedagem.status === 'hospedado') {
      return {
        label: hospedagem.tipoServico === 'transporte' ? 'Em Rota' : hospedagem.tipoServico === 'cat_sitter' ? 'Atendimento' : 'Hospedado',
        className: 'border-stamp-plum text-stamp-plum',
      };
    }
    return {
      label: 'Agendado',
      className: 'border-stamp-plum text-stamp-plum',
    };
  };

  const stampConfig = getStampConfig();

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm transition-colors duration-150 hover:border-border-ledger-hover"
    >
      {/* Selo de Carimbo Outline (Elemento Assinatura) */}
      <div
        className={`absolute -top-2.5 right-3 rounded-stamp border-2 border-dashed ${stampConfig.className} bg-transparent px-2.5 py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider select-none ${
          isSettling ? 'animate-stampSettle' : 'rotate-[-4deg]'
        }`}
        style={{ minWidth: '76px' }}
      >
        {stampConfig.label}
      </div>

      {/* Top line: Identificador de serviço */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-muted mb-2.5">
        {getServiceIcon()}
        <span>{getServiceLabel()}</span>
        <span>•</span>
        <span>{formatDateString(hospedagem.dataCheckIn)} → {formatDateString(hospedagem.dataCheckOut)}</span>
      </div>

      {/* Foto e Identificação do Gato */}
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-card border border-border-ledger bg-parchment flex-shrink-0 flex items-center justify-center">
          {hospedagem.fotoUrl ? (
            <img src={hospedagem.fotoUrl} alt={hospedagem.nomeGato} className="h-full w-full object-cover" draggable="false" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-muted">
              <Camera size={20} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <p className="truncate text-base font-bold font-display text-ink tracking-tight">
            {hospedagem.nomeGato}
          </p>
          <p className="text-xs font-body text-ink-subtle truncate mt-0.5">
            Tutor: <span className="text-ink font-medium">{hospedagem.nomeTutor}</span>
          </p>
          <p className="text-[11px] font-body text-ink-muted truncate mt-0.5">
            {hospedagem.perfil.dieta || 'Dieta padrão'}
          </p>
        </div>
      </div>

      {/* Metadados Limpos em Linha (Substituindo Badges Pastéis) */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border-ledger pt-2.5 text-xs font-body text-ink-subtle">
        <span>{hospedagem.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}</span>
        <span>•</span>
        {hospedagem.perfil.personalidade && (
          <>
            <span>{hospedagem.perfil.personalidade}</span>
            <span>•</span>
          </>
        )}
        {hasMedication && (
          <>
            <span className="font-semibold text-stamp-wine">
              Meds: {hospedagem.perfil.medicamentos}
            </span>
            <span>•</span>
          </>
        )}
        {hospedagem.transporteAdicional && (
          <>
            <span>+ Transporte</span>
            <span>•</span>
          </>
        )}
        <span>{totals.nights === 1 ? '1 diária' : `${totals.nights} diárias`}</span>
        <span className="ml-auto font-mono font-bold text-ink">
          R$ {totals.valorTotal.toFixed(0)}
        </span>
      </div>

      {/* Registro de Confirmações */}
      {(hospedagem.dataHoraConfirmacaoCheckIn ||
        hospedagem.dataHoraConfirmacaoCheckOut ||
        (hospedagem.statusPagamento === 'pago' && hospedagem.dataHoraConfirmacaoPagamento) ||
        (hospedagem.statusPagamento === 'pendente' && hospedagem.dataHoraReversaoPagamento)) && (
        <div className="mt-2.5 flex flex-col gap-0.5 text-[10px] font-mono text-ink-muted border-t border-border-ledger pt-2">
          {hospedagem.dataHoraConfirmacaoCheckIn && (
            <div>
              Check-in: <strong className="text-ink-subtle">{formatTimestampShort(hospedagem.dataHoraConfirmacaoCheckIn)}</strong>
            </div>
          )}
          {hospedagem.dataHoraConfirmacaoCheckOut && (
            <div>
              Check-out: <strong className="text-ink-subtle">{formatTimestampShort(hospedagem.dataHoraConfirmacaoCheckOut)}</strong>
            </div>
          )}
          {hospedagem.statusPagamento === 'pago' && hospedagem.dataHoraConfirmacaoPagamento && (
            <div>
              Pago: <strong className="text-stamp-moss">{formatTimestampShort(hospedagem.dataHoraConfirmacaoPagamento)}</strong>
            </div>
          )}
          {hospedagem.statusPagamento === 'pendente' && hospedagem.dataHoraReversaoPagamento && (
            <div>
              Revertido: <strong className="text-stamp-wine">{formatTimestampShort(hospedagem.dataHoraReversaoPagamento)}</strong>
            </div>
          )}
        </div>
      )}

      {/* Observações em Bloco Sóbrio */}
      <div className="mt-2.5 rounded-card border border-border-ledger bg-parchment p-2.5 text-xs">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          Observações
        </p>
        <p className="mt-1 font-body text-ink-subtle line-clamp-2 leading-relaxed">
          {hospedagem.perfil.observacoes || 'Nenhuma observação registrada.'}
        </p>
      </div>

      {/* Botões de Ação Direta */}
      {showCheckInButton && onCheckIn && (
        <button
          type="button"
          onClick={handleCheckInClick}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-card bg-stamp-plum text-parchment border border-stamp-plum px-3 py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
        >
          <Check size={14} />
          <span>{hospedagem.tipoServico === 'transporte' ? 'Iniciar Transporte' : hospedagem.tipoServico === 'cat_sitter' ? 'Iniciar Atendimento' : 'Confirmar Entrada (Check-in)'}</span>
        </button>
      )}

      {hospedagem.status === 'saindo_hoje' && onCheckOut && (
        <button
          type="button"
          onClick={handleCheckOutClick}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-card bg-stamp-gold text-ink border border-stamp-gold px-3 py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
        >
          <Check size={14} />
          <span>{hospedagem.tipoServico === 'transporte' ? 'Concluir Transporte' : hospedagem.tipoServico === 'cat_sitter' ? 'Concluir Atendimento' : 'Confirmar Saída (Check-out)'}</span>
        </button>
      )}

      {/* Seção Financeira */}
      <div className="mt-3 flex items-center justify-between border-t border-border-ledger pt-2.5">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink-muted">
            Pagamento
          </span>
          {hospedagem.statusPagamento === 'parcial' && (
            <div className="mt-1 w-24">
              <div className="h-1.5 w-full bg-parchment rounded-card border border-border-ledger overflow-hidden flex">
                <div
                  className="h-full bg-stamp-gold"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hospedagem.statusPagamento !== 'pendente' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Deseja desfazer o último recebimento desta reserva?')) {
                  reverterUltimoPagamento(hospedagem.id);
                }
              }}
              className="p-1.5 rounded-card border border-border-ledger text-ink-subtle hover:text-ink hover:border-border-ledger-hover transition-colors"
              title="Desfazer último recebimento"
            >
              <Undo2 size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenPagamentoModal) {
                onOpenPagamentoModal(hospedagem);
              }
            }}
            className="inline-flex items-center gap-1 rounded-card border border-border-ledger bg-parchment px-2.5 py-1 text-xs font-mono font-medium text-ink hover:border-border-ledger-hover transition-colors"
          >
            <DollarSign size={12} />
            {hospedagem.statusPagamento === 'pago'
              ? 'Pago'
              : hospedagem.statusPagamento === 'parcial'
                ? `Parcial (${valorPago.toFixed(0)}/${totals.valorTotal.toFixed(0)})`
                : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
