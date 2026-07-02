import { Hospedagem } from '../types';
import { getStatusTagColor, getStatusLabel, formatDateString, calculateNights } from '../utils';
import { Camera, Pill, Calendar, HeartPulse, User, Edit2, AlertCircle } from 'lucide-react';

interface FichaHospedagemProps {
  hospedagem: Hospedagem;
  onEditClick: () => void;
  onClose: () => void;
}

export function FichaHospedagem({ hospedagem, onEditClick, onClose }: FichaHospedagemProps) {
  const hasMedication = hospedagem.perfil.medicamentos && 
    hospedagem.perfil.medicamentos.trim() !== '' && 
    hospedagem.perfil.medicamentos.toLowerCase() !== 'nenhum';

  const nights = calculateNights(hospedagem.dataCheckIn, hospedagem.dataCheckOut);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:items-start sm:gap-6">
        <div className="h-28 w-28 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
          {hospedagem.fotoUrl ? (
            <img src={hospedagem.fotoUrl} alt={hospedagem.nomeGato} className="h-full w-full object-cover" />
          ) : (
            <Camera size={36} className="text-slate-400 dark:text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{hospedagem.nomeGato}</h3>
          <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-slate-500 dark:text-slate-400">
            <User size={16} />
            <span>Tutor(a): <strong>{hospedagem.nomeTutor}</strong></span>
          </p>
          
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusTagColor(hospedagem.perfil.sociabilidade)}`}>
              {hospedagem.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              hospedagem.status === 'agendado' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400' :
              hospedagem.status === 'hospedado' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' :
              hospedagem.status === 'saindo_hoje' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400' :
              'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
            }`}>
              {getStatusLabel(hospedagem.status)}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Grid de Informações */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Datas */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Calendar size={14} /> Estadia
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">Check-in: <strong>{formatDateString(hospedagem.dataCheckIn, true)}</strong></p>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">Check-out: <strong>{formatDateString(hospedagem.dataCheckOut, true)}</strong></p>
          <div className="mt-2.5 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1 inline-block">
              {nights === 1 ? '1 diária 🌙' : `${nights} diárias 🌙`}
            </span>
            {hospedagem.valorDiaria !== undefined && (
              <span className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100/50 dark:border-cyan-900/30 rounded-lg px-2.5 py-1 inline-block">
                R$ {hospedagem.valorDiaria}/dia • Total: R$ {(nights * hospedagem.valorDiaria).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Medicamentos */}
        <div className={`rounded-2xl p-4 border ${
          hasMedication 
            ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50 text-orange-950 dark:text-orange-300' 
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
        }`}>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Pill size={14} /> Medicamentos
          </h4>
          {hasMedication ? (
            <p className="text-sm font-semibold text-orange-950 dark:text-orange-300">{hospedagem.perfil.medicamentos}</p>
          ) : (
            <p className="text-sm italic text-slate-500 dark:text-slate-400">Sem medicação necessária.</p>
          )}
        </div>

        {/* Confirmações de Entrada e Saída */}
        {(hospedagem.dataHoraConfirmacaoCheckIn || hospedagem.dataHoraConfirmacaoCheckOut) && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
              Registro de Operações
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {hospedagem.dataHoraConfirmacaoCheckIn && (
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl p-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <div>
                    <span className="font-semibold block">Check-in Confirmado:</span>
                    <span>{hospedagem.dataHoraConfirmacaoCheckIn}</span>
                  </div>
                </div>
              )}
              {hospedagem.dataHoraConfirmacaoCheckOut && (
                <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100/50 dark:border-cyan-900/30 rounded-xl p-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-500"></span>
                  <div>
                    <span className="font-semibold block">Check-out Confirmado:</span>
                    <span>{hospedagem.dataHoraConfirmacaoCheckOut}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dieta */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HeartPulse size={14} /> Alimentação (Dieta)
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{hospedagem.perfil.dieta || 'Não especificada.'}</p>
        </div>

        {/* Personalidade */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertCircle size={14} /> Personalidade
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{hospedagem.perfil.personalidade || 'Não informada.'}</p>
        </div>

        {/* Observações */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Observações Gerais
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{hospedagem.perfil.observacoes || 'Nenhuma observação adicional.'}</p>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Ações */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Fechar
        </button>
        <button
          type="button"
          onClick={onEditClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/10 transition"
        >
          <Edit2 size={15} />
          Editar Ficha
        </button>
      </div>
    </div>
  );
}
