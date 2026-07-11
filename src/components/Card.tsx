import { Camera, Pill, HeartPulse, Check, DollarSign, Home, PawPrint, Car } from 'lucide-react';
import { Hospedagem } from '../types';
import { useHospedagemStore } from '../store';
import { getStatusTagColor, getLocalDateString, formatDateString, calculateNights } from '../utils';

interface CardProps {
  hospedagem: Hospedagem;
  onEdit: (hospedagem: Hospedagem) => void;
  onCheckOut?: (id: string) => void;
  onCheckIn?: (id: string) => void;
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

export function Card({ hospedagem, onEdit, onCheckOut, onCheckIn }: CardProps) {
  const togglePagamento = useHospedagemStore((state) => state.togglePagamento);

  const hasMedication = hospedagem.perfil.medicamentos && 
    hospedagem.perfil.medicamentos.trim() !== '' && 
    hospedagem.perfil.medicamentos.toLowerCase() !== 'nenhum';

  const showActiveMedicationAlert = hasMedication && 
    (hospedagem.status === 'hospedado' || hospedagem.status === 'saindo_hoje');

  const medicationTag = hasMedication
    ? { 
        label: hospedagem.perfil.medicamentos!, 
        color: showActiveMedicationAlert 
          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 animate-pulse'
          : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400' 
      }
    : { label: 'Sem medicação', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-350' };

  const nights = hospedagem.tipoServico === 'transporte' ? 1 : calculateNights(hospedagem.dataCheckIn, hospedagem.dataCheckOut);
  const totalValue = hospedagem.valorDiaria ? nights * hospedagem.valorDiaria : null;

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
    if (onCheckIn) {
      onCheckIn(hospedagem.id);
    }
  };

  const getServiceIcon = () => {
    if (hospedagem.tipoServico === 'cat_sitter') return <PawPrint size={16} className="text-mostarda-500" />;
    if (hospedagem.tipoServico === 'transporte') return <Car size={16} className="text-ardosia-500" />;
    return <Home size={16} className="text-terracota-500" />;
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

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer rounded-3xl border p-4 shadow-sm transition hover:shadow-md ${
        isCheckInToday ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-100/50 dark:ring-emerald-950/30 bg-emerald-50/5 dark:bg-emerald-950/10 hover:border-emerald-400' :
        isCheckOutToday ? 'border-terracota-300 dark:border-terracota-700 ring-2 ring-terracota-100/50 dark:ring-terracota-950/30 bg-terracota-50/5 dark:bg-terracota-950/10 hover:border-terracota-400' :
        'border-slate-200 dark:border-slate-750 hover:border-terracota-300 dark:hover:border-terracota-500 bg-white dark:bg-warmBg-900'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        {isCheckInToday && (
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Chega Hoje</span>
          </div>
        )}
        {isCheckOutToday && (
          <div className="inline-flex items-center gap-1 rounded-full bg-terracota-100 dark:bg-terracota-950 px-2.5 py-0.5 text-[9px] font-bold text-terracota-800 dark:text-terracota-300 uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracota-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-terracota-500"></span>
            </span>
            <span>Saída Hoje</span>
          </div>
        )}
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1 ml-auto">
          {getServiceIcon()}
          {getServiceLabel()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900 shadow-inner flex-shrink-0">
          {hospedagem.fotoUrl ? (
            <img src={hospedagem.fotoUrl} alt={hospedagem.nomeGato} className="h-full w-full object-cover" draggable="false" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-150 dark:bg-slate-800">
              <Camera size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-slate-900 dark:text-white font-serif">{hospedagem.nomeGato}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tutor: {hospedagem.nomeTutor}</p>
          <p className="mt-1 text-xs text-slate-650 dark:text-slate-350 truncate">
            {hospedagem.perfil.personalidade || 'Sem personalidade'} • {hospedagem.perfil.dieta || 'Sem dieta'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${getStatusTagColor(hospedagem.perfil.sociabilidade)}`}>
          {hospedagem.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${medicationTag.color}`} title={medicationTag.label}>
          <Pill size={13} className="flex-shrink-0" />
          <span className="truncate max-w-[120px]">{medicationTag.label}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-900 px-2.5 py-1 text-slate-600 dark:text-slate-305 border border-slate-200/50 dark:border-slate-800">
          {hospedagem.tipoServico === 'transporte' ? 'Pontual ' : 'Saída '}{formatDateString(hospedagem.dataCheckOut)}
        </span>
        {totalValue !== null && (
          <span 
            className="inline-flex items-center gap-1 rounded-full bg-terracota-50/50 dark:bg-terracota-950/20 border border-terracota-100 dark:border-terracota-900/30 px-2.5 py-1 text-xs font-bold text-terracota-700 dark:text-terracota-400 ml-auto" 
            title={hospedagem.tipoServico === 'transporte' ? `Valor Total: R$ ${hospedagem.valorDiaria}` : `Valor: R$ ${hospedagem.valorDiaria}/dia`}
          >
            R$ {totalValue.toFixed(0)}
          </span>
        )}
      </div>

      {/* Registro de Confirmações no Card */}
      {(hospedagem.dataHoraConfirmacaoCheckIn || hospedagem.dataHoraConfirmacaoCheckOut) && (
        <div className="mt-3 flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          {hospedagem.dataHoraConfirmacaoCheckIn && (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span>{hospedagem.tipoServico === 'hospedagem' ? 'Check-in: ' : 'Início: '}<strong>{formatTimestampShort(hospedagem.dataHoraConfirmacaoCheckIn)}</strong></span>
            </div>
          )}
          {hospedagem.dataHoraConfirmacaoCheckOut && (
            <div className="flex items-center gap-1.5 text-terracota-700 dark:text-terracota-400">
              <span className="h-1 w-1 rounded-full bg-terracota-500 flex-shrink-0"></span>
              <span>{hospedagem.tipoServico === 'hospedagem' ? 'Check-out: ' : 'Concluído: '}<strong>{formatTimestampShort(hospedagem.dataHoraConfirmacaoCheckOut)}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Observações */}
      <div className="mt-3 rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border border-slate-150/40 dark:border-slate-800/60 p-3 text-xs text-slate-700 dark:text-slate-350">
        <p className="font-semibold text-slate-900 dark:text-white font-serif">Observações</p>
        <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">{hospedagem.perfil.observacoes || 'Nenhuma observação adicional.'}</p>
      </div>

      {showCheckInButton && onCheckIn && (
        <button
          onClick={handleCheckInClick}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-500 transition"
        >
          <Check size={14} />
          {hospedagem.tipoServico === 'transporte' ? 'Iniciar Transporte' : hospedagem.tipoServico === 'cat_sitter' ? 'Iniciar Atendimento' : 'Confirmar Entrada (Check-in)'}
        </button>
      )}

      {hospedagem.status === 'saindo_hoje' && onCheckOut && (
        <button
          onClick={handleCheckOutClick}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-terracota-500 py-2 text-xs font-semibold text-white shadow-md shadow-terracota-500/10 hover:bg-terracota-600 transition"
        >
          <Check size={14} />
          {hospedagem.tipoServico === 'transporte' ? 'Concluir Transporte' : hospedagem.tipoServico === 'cat_sitter' ? 'Concluir Atendimento' : 'Confirmar Saída (Check-out)'}
        </button>
      )}

      {/* Seção Financeira para concluded stays */}
      {hospedagem.status === 'concluido' && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Pagamento</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (hospedagem.statusPagamento === 'pago') {
                if (confirm('Deseja realmente reverter este pagamento para Pendente?')) {
                  togglePagamento(hospedagem.id);
                }
              } else {
                if (confirm(`Confirmar recebimento de R$ ${totalValue?.toFixed(2)} para este serviço?`)) {
                  togglePagamento(hospedagem.id);
                }
              }
            }}
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition border ${
              hospedagem.statusPagamento === 'pago'
                ? 'bg-sucesso-50/80 border-sucesso-200 text-sucesso-700 dark:bg-sucesso-950/20 dark:border-sucesso-900/40 dark:text-sucesso-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'bg-mostarda-50 border-mostarda-200 text-mostarda-800 dark:bg-mostarda-950/20 dark:border-mostarda-900/40 dark:text-mostarda-400 hover:bg-mostarda-100 dark:hover:bg-mostarda-900/40'
            }`}
          >
            <DollarSign size={12} />
            {hospedagem.statusPagamento === 'pago' ? 'Pago' : 'Pendente'}
          </button>
        </div>
      )}
    </div>
  );
}
