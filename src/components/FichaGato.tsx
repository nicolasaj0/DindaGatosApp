import { Gato, Estadia } from '../types';
import { User, Edit2, Calendar, Pill, HeartPulse, AlertCircle, MapPin } from 'lucide-react';
import { formatDateString } from '../utils';

interface FichaGatoProps {
  gato: Gato;
  estadias: Estadia[];
  onClose: () => void;
  onEditClick: () => void;
  onAgendarClick: () => void;
}

export function FichaGato({
  gato,
  estadias,
  onClose,
  onEditClick,
  onAgendarClick,
}: FichaGatoProps) {
  const catEstadias = estadias.filter((e) => e.gatoId === gato.id);
  const totalVisitas = catEstadias.length;
  const hasMedication = !!gato.perfil.medicamentos?.trim() && gato.perfil.medicamentos.toLowerCase() !== 'nenhum';

  return (
    <div className="space-y-5">
      {/* Cabeçalho com Foto e Nome */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="h-20 w-20 overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-md flex-shrink-0">
            {gato.fotoUrl ? (
              <img src={gato.fotoUrl} alt={gato.nomeGato} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-3xl font-bold bg-slate-100 dark:bg-slate-800">
                {gato.nomeGato.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{gato.nomeGato}</h3>
            <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
              <User size={13} />
              <span>Tutor(a): <strong>{gato.nomeTutor}</strong></span>
            </p>
            {gato.enderecoTutor && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-terracota-500" />
                <span>{gato.enderecoTutor}</span>
              </p>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Cadastrado em: {formatDateString(gato.dataCadastro, true)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            gato.perfil.sociabilidade === 'sociavel'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
          }`}>
            {gato.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
          </span>
          {gato.valorDiariaPadrao && (
            <span className="inline-flex items-center gap-1 rounded-full bg-terracota-50 dark:bg-terracota-950/20 text-terracota-700 dark:text-terracota-400 border border-terracota-100 dark:border-terracota-900/30 px-3 py-1 text-xs font-bold">
              Diária base: R$ {gato.valorDiariaPadrao}
            </span>
          )}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Grid de Detalhes do Prontuário */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Medicamentos */}
        <div className={`rounded-2xl p-4 border ${
          hasMedication
            ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50 text-orange-950 dark:text-orange-300'
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
        }`}>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Pill size={14} /> Medicamentos
          </h4>
          {hasMedication ? (
            <p className="text-sm font-semibold text-orange-950 dark:text-orange-300">{gato.perfil.medicamentos}</p>
          ) : (
            <p className="text-sm italic text-slate-500 dark:text-slate-400">Sem medicação cadastrada.</p>
          )}
        </div>

        {/* Dieta */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HeartPulse size={14} /> Alimentação (Dieta)
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{gato.perfil.dieta || 'Não especificada.'}</p>
        </div>

        {/* Personalidade */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertCircle size={14} /> Personalidade
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{gato.perfil.personalidade || 'Não informada.'}</p>
        </div>

        {/* Observações */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Observações Gerais
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{gato.perfil.observacoes || 'Nenhuma observação registrada.'}</p>
        </div>
      </div>

      {/* Histórico Resumido de Serviços */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Histórico de Atendimentos ({totalVisitas})</span>
        </h4>
        {catEstadias.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">Nenhum serviço registrado ainda.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {catEstadias.map((estadia) => (
              <div key={estadia.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {estadia.tipoServico || 'Hospedagem'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">
                    ({formatDateString(estadia.dataCheckIn)} a {formatDateString(estadia.dataCheckOut)})
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  estadia.status === 'concluido' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                  estadia.status === 'hospedado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                  'bg-mostarda-100 text-mostarda-800 dark:bg-mostarda-950/40 dark:text-mostarda-400'
                }`}>
                  {estadia.status}
                </span>
              </div>
            ))}
          </div>
        )}
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
          onClick={onAgendarClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-terracota-50 dark:bg-terracota-950/20 border border-terracota-200 dark:border-terracota-900/50 py-2.5 text-sm font-semibold text-terracota-600 dark:text-terracota-400 hover:bg-terracota-100 dark:hover:bg-terracota-950/40 transition"
        >
          <Calendar size={15} />
          Agendar Serviço
        </button>
        <button
          type="button"
          onClick={onEditClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-terracota-500 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600 shadow-md shadow-terracota-500/10 transition"
        >
          <Edit2 size={15} />
          Editar Prontuário
        </button>
      </div>
    </div>
  );
}
