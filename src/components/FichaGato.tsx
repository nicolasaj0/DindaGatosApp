import { Gato, Estadia } from '../types';
import { User, Edit2, Calendar, Pill, HeartPulse, AlertCircle, MapPin } from 'lucide-react';
import { formatDateString, formatCurrency } from '../utils';

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
    <div className="space-y-4 font-body text-ink">
      {/* Cabeçalho com Foto e Nome */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-between pb-3.5 border-b border-border-ledger">
        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          <div className="h-16 w-16 overflow-hidden rounded-card border border-border-ledger bg-parchment flex-shrink-0 flex items-center justify-center">
            {gato.fotoUrl ? (
              <img src={gato.fotoUrl} alt={gato.nomeGato} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-muted text-xl font-bold font-display">
                {gato.nomeGato.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-ink tracking-tight">{gato.nomeGato}</h3>
            <p className="mt-0.5 flex items-center justify-center sm:justify-start gap-1.5 text-ink-subtle text-xs">
              <User size={13} />
              <span>Tutor(a): <strong className="text-ink">{gato.nomeTutor}</strong></span>
            </p>
            {gato.enderecoTutor && (
              <p className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-1">
                <MapPin size={11} />
                <span>{gato.enderecoTutor}</span>
              </p>
            )}
            <p className="text-[10px] font-mono text-ink-muted mt-0.5">
              Cadastrado em: {formatDateString(gato.dataCadastro, true)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-card px-2.5 py-1 text-xs font-mono font-medium bg-parchment text-ink border border-border-ledger">
            {gato.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
          </span>
          {gato.valorDiariaPadrao && (
            <span className="inline-flex items-center gap-1 rounded-card bg-parchment text-ink border border-border-ledger px-2.5 py-1 text-xs font-mono font-medium">
              Diária base: {formatCurrency(gato.valorDiariaPadrao)}
            </span>
          )}
        </div>
      </div>

      {/* Grid de Detalhes do Prontuário */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Medicamentos */}
        <div className={`rounded-card p-3.5 border ${
          hasMedication
            ? 'bg-parchment border-stamp-wine/40'
            : 'bg-parchment border-border-ledger'
        }`}>
          <h4 className={`font-mono text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
            hasMedication ? 'text-stamp-wine' : 'text-ink-muted'
          }`}>
            <Pill size={13} /> {hasMedication ? 'Medicamentos (Prescrição Ativa)' : 'Medicamentos'}
          </h4>
          {hasMedication ? (
            <p className="text-xs font-semibold text-stamp-wine leading-relaxed break-words">{gato.perfil.medicamentos}</p>
          ) : (
            <p className="text-xs italic text-ink-muted">Sem medicação prescrita.</p>
          )}
        </div>

        {/* Dieta */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <HeartPulse size={13} /> Alimentação (Dieta)
          </h4>
          <p className="text-xs text-ink-subtle leading-relaxed">{gato.perfil.dieta || 'Não especificada.'}</p>
        </div>

        {/* Personalidade */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <AlertCircle size={13} /> Personalidade
          </h4>
          <p className="text-xs text-ink-subtle">{gato.perfil.personalidade || 'Não informada.'}</p>
        </div>

        {/* Observações */}
        <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
          <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
            Observações Gerais
          </h4>
          <p className="text-xs text-ink-subtle leading-relaxed">{gato.perfil.observacoes || 'Nenhuma observação registrada.'}</p>
        </div>
      </div>

      {/* Histórico Resumido de Serviços */}
      <div className="rounded-card bg-parchment p-3.5 border border-border-ledger">
        <h4 className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Histórico de Atendimentos ({totalVisitas})</span>
        </h4>
        {catEstadias.length === 0 ? (
          <p className="text-xs text-ink-muted italic">Nenhum serviço registrado ainda.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin font-mono text-xs">
            {catEstadias.map((estadia) => (
              <div key={estadia.id} className="flex items-center justify-between bg-parchment-elevated p-2.5 rounded-card border border-border-ledger">
                <div>
                  <span className="font-bold text-ink capitalize">
                    {estadia.tipoServico || 'Hospedagem'}
                  </span>
                  <span className="text-ink-subtle ml-2">
                    ({formatDateString(estadia.dataCheckIn)} a {formatDateString(estadia.dataCheckOut)})
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-card font-bold text-[10px] uppercase border border-border-ledger bg-parchment text-ink-subtle">
                  {estadia.status}
                </span>
              </div>
            ))}
          </div>
        )}
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
          onClick={onAgendarClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-card bg-parchment border border-border-ledger py-2 text-xs font-body font-semibold text-ink hover:border-border-ledger-hover transition-colors"
        >
          <Calendar size={14} />
          Agendar Serviço
        </button>
        <button
          type="button"
          onClick={onEditClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-card bg-stamp-plum text-parchment border border-stamp-plum py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
        >
          <Edit2 size={14} />
          Editar Prontuário
        </button>
      </div>
    </div>
  );
}
