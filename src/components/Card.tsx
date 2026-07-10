import { Camera, Pill, HeartPulse, Check, DollarSign } from 'lucide-react';
import { Hospedagem } from '../types';
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
    : { label: 'Sem medicação', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' };

  const nights = calculateNights(hospedagem.dataCheckIn, hospedagem.dataCheckOut);
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
        'border-slate-200 dark:border-slate-700/80 hover:border-terracota-300 dark:hover:border-terracota-500 bg-white dark:bg-warmBg-900'
      }`}
    >
      {isCheckInToday && (
        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Chega Hoje</span>
        </div>
      )}
      {isCheckOutToday && (
        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-terracota-100 dark:bg-terracota-950 px-2.5 py-0.5 text-[9px] font-bold text-terracota-800 dark:text-terracota-300 uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracota-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-terracota-500"></span>
          </span>
          <span>Saída Hoje</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900 shadow-inner">
          {hospedagem.fotoUrl ? (
            <img src={hospedagem.fotoUrl} alt={hospedagem.nomeGato} className="h-full w-full object-cover" draggable="false" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
              <Camera size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">{hospedagem.nomeGato}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tutor: {hospedagem.nomeTutor}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{hospedagem.perfil.personalidade} • {hospedagem.perfil.dieta}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${getStatusTagColor(hospedagem.perfil.sociabilidade)}`}>
          {hospedagem.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${medicationTag.color}`} title={medicationTag.label}>
          <Pill size={14} className="flex-shrink-0" />
          <span className="truncate max-w-[120px]">{medicationTag.label}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-slate-600 dark:text-slate-300">
          <HeartPulse size={14} />
          Saída {formatDateString(hospedagem.dataCheckOut)}
        </span>
        {totalValue !== null && (
          <span 
            className="inline-flex items-center gap-1 rounded-full bg-terracota-50 dark:bg-terracota-950/30 border border-terracota-100 dark:border-terracota-900/40 px-2.5 py-1 text-xs font-bold text-terracota-700 dark:text-terracota-400 ml-auto" 
            title={`Valor Estimado: R$ ${hospedagem.valorDiaria}/dia`}
          >
            R$ {totalValue.toFixed(0)}
          </span>
        )}
      </div>

      {/* Registro de Confirmações no Card */}
      {(hospedagem.dataHoraConfirmacaoCheckIn || hospedagem.dataHoraConfirmacaoCheckOut) && (
        <div className="mt-3 flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2.5">
          {hospedagem.dataHoraConfirmacaoCheckIn && (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span>Check-in: <strong>{formatTimestampShort(hospedagem.dataHoraConfirmacaoCheckIn)}</strong></span>
            </div>
          )}
          {hospedagem.dataHoraConfirmacaoCheckOut && (
            <div className="flex items-center gap-1.5 text-terracota-700 dark:text-terracota-400">
              <span className="h-1 w-1 rounded-full bg-terracota-500 flex-shrink-0"></span>
              <span>Check-out: <strong>{formatTimestampShort(hospedagem.dataHoraConfirmacaoCheckOut)}</strong></span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 rounded-3xl bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-white">Observações</p>
        <p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">{hospedagem.perfil.observacoes || 'Nenhuma observação adicional.'}</p>
      </div>

      {showCheckInButton && onCheckIn && (
        <button
          onClick={handleCheckInClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-505 transition hover:bg-emerald-500"
        >
          <Check size={16} />
          Confirmar Entrada (Check-in)
        </button>
      )}

      {hospedagem.status === 'saindo_hoje' && onCheckOut && (
        <button
          onClick={handleCheckOutClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-terracota-500 py-2 text-sm font-semibold text-white shadow-md shadow-terracota-500/10 hover:bg-terracota-600 transition"
        >
          <Check size={16} />
          Confirmar Saída (Check-out)
        </button>
      )}
    </div>
  );
}


