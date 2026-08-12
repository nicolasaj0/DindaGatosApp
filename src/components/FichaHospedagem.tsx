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

  const hasMedication = !!hospedagem.perfil.medicamentos?.trim();
  const totals = calculateEstadiaTotals(hospedagem);
  const valorPago = hospedagem.valorPago || 0;
  const saldoRestante = Math.max(0, totals.valorTotal - valorPago);

  const getServiceLabel = () => {
    if (hospedagem.tipoServico === 'hospedagem') return '🏠 Hospedagem';
    if (hospedagem.tipoServico === 'cat_sitter') return '🐾 Cat Sitter';
    return '🚗 Transporte';
  };

  const getStatusTagColor = (sociabilidade: Hospedagem['perfil']['sociabilidade']) => {
    return sociabilidade === 'sociavel' 
      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
      : 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30';
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho do Prontuário */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-md">
            {hospedagem.fotoUrl ? (
              <img src={hospedagem.fotoUrl} alt={hospedagem.nomeGato} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-2xl font-bold bg-slate-100 dark:bg-slate-800">
                {hospedagem.nomeGato.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{hospedagem.nomeGato}</h3>
            <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <User size={13} />
              <span>Tutor(a): <strong>{hospedagem.nomeTutor}</strong></span>
            </p>
            {hospedagem.enderecoTutor && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-left">
                Tutor end.: {hospedagem.enderecoTutor}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {getServiceLabel()}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getStatusTagColor(hospedagem.perfil.sociabilidade)}`}>
            {hospedagem.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            hospedagem.status === 'agendado' ? 'bg-mostarda-100 dark:bg-mostarda-950/40 text-mostarda-800 dark:text-mostarda-400' :
            hospedagem.status === 'hospedado' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' :
            hospedagem.status === 'saindo_hoje' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400' :
            'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-400'
          }`}>
            {labelStatus(hospedagem.status, hospedagem.tipoServico)}
          </span>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Grid de Informações */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Datas / Serviço */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Calendar size={14} /> Detalhes do Período
          </h4>
          {hospedagem.tipoServico === 'transporte' ? (
            <p className="text-sm text-slate-700 dark:text-slate-300">Data do Serviço: <strong>{formatDateString(hospedagem.dataCheckIn, true)}</strong></p>
          ) : (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300">Check-in: <strong>{formatDateString(hospedagem.dataCheckIn, true)}</strong></p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">Check-out: <strong>{formatDateString(hospedagem.dataCheckOut, true)}</strong></p>
            </>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1 inline-block">
              {hospedagem.tipoServico === 'transporte' ? 'serviço' : totals.nights === 1 ? '1 dia/visita 🌙' : `${totals.nights} dias/visitas 🌙`}
            </span>
            <span className="text-xs text-terracota-700 dark:text-terracota-400 font-semibold bg-terracota-50/50 dark:bg-terracota-950/30 border border-terracota-100/50 dark:border-terracota-900/30 rounded-lg px-2.5 py-1 inline-block">
              {totals.valorTransporte > 0
                ? `Serviço: R$ ${totals.valorServico.toFixed(0)} + Transporte: R$ ${totals.valorTransporte.toFixed(0)} = Total: R$ ${totals.valorTotal.toFixed(2)}`
                : `R$ ${hospedagem.valorDiaria || 0} • Total: R$ ${totals.valorTotal.toFixed(2)}`}
            </span>
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

        {/* Endereço e Detalhes do Serviço (Cat Sitter e Transporte) */}
        {hospedagem.tipoServico !== 'hospedagem' && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-terracota-500" /> Detalhes do Atendimento
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              Endereço: <strong>{hospedagem.enderecoServico || 'Não informado'}</strong>
            </p>
            {hospedagem.detalhesServico && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                Observações do serviço: {hospedagem.detalhesServico}
              </p>
            )}
          </div>
        )}

        {/* Detalhes de Transporte Embutido se houver */}
        {hospedagem.transporteAdicional && hospedagem.tipoServico !== 'transporte' && (
          <div className="rounded-2xl bg-ardosia-50/50 dark:bg-ardosia-950/20 p-4 border border-ardosia-150/60 dark:border-ardosia-900/30 sm:col-span-2">
            <h4 className="text-xs font-bold text-ardosia-700 dark:text-ardosia-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Car size={14} /> Transporte Embutido
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Valor adicional: <strong>R$ {hospedagem.transporteAdicional.valor.toFixed(2)}</strong>
              {hospedagem.transporteAdicional.detalhes && (
                <span className="block mt-0.5 text-slate-500 dark:text-slate-400">
                  Instruções: {hospedagem.transporteAdicional.detalhes}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Controle Financeiro de Pagamento (Disponível em qualquer fase) */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Controle Financeiro</span>
            <span className="text-[11px] font-normal text-slate-500">Total: R$ {totals.valorTotal.toFixed(2)}</span>
          </h4>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${
                hospedagem.statusPagamento === 'pago' ? 'bg-sucesso-500' :
                hospedagem.statusPagamento === 'parcial' ? 'bg-mostarda-500 motion-safe:animate-pulse' :
                'bg-slate-300 dark:bg-slate-700'
              }`}></span>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Status: <strong className={
                    hospedagem.statusPagamento === 'pago' ? 'text-sucesso-600 dark:text-sucesso-400' :
                    hospedagem.statusPagamento === 'parcial' ? 'text-mostarda-600 dark:text-mostarda-400' :
                    'text-slate-600 dark:text-slate-400'
                  }>
                    {hospedagem.statusPagamento === 'pago' ? 'Pago (100%)' :
                     hospedagem.statusPagamento === 'parcial' ? `Parcial (R$ ${valorPago.toFixed(2)} / R$ ${totals.valorTotal.toFixed(2)})` :
                     'Pendente'}
                  </strong>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recebido: <strong className="text-sucesso-600 dark:text-sucesso-400">R$ {valorPago.toFixed(2)}</strong> • A Receber: <strong className="text-mostarda-700 dark:text-mostarda-400">R$ {saldoRestante.toFixed(2)}</strong>
                </p>
              </div>
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
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                  title="Reverter último pagamento"
                >
                  <Undo2 size={13} />
                  <span>Desfazer</span>
                </button>
              )}
              {saldoRestante > 0 && onOpenPagamentoModal && (
                <button
                  type="button"
                  onClick={() => onOpenPagamentoModal(hospedagem)}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm bg-sucesso-500 text-white hover:bg-sucesso-600 shadow-sucesso-500/10 flex items-center gap-1"
                >
                  <DollarSign size={13} />
                  <span>Registrar Pagamento</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmações e Histórico no Registro de Operações */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            Registro de Operações
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-xs">
            {hospedagem.dataHoraConfirmacaoCheckIn && (
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl p-2.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <div>
                  <span className="font-semibold block">{hospedagem.tipoServico === 'hospedagem' ? 'Check-in Confirmado:' : 'Início Confirmado:'}</span>
                  <span>{hospedagem.dataHoraConfirmacaoCheckIn}</span>
                </div>
              </div>
            )}
            {hospedagem.dataHoraConfirmacaoCheckOut && (
              <div className="flex items-center gap-2 text-terracota-800 dark:text-terracota-400 bg-terracota-50/50 dark:bg-terracota-950/20 border border-terracota-100/50 dark:border-terracota-900/30 rounded-xl p-2.5">
                <span className="flex h-2 w-2 rounded-full bg-terracota-500"></span>
                <div>
                  <span className="font-semibold block">{hospedagem.tipoServico === 'hospedagem' ? 'Check-out Confirmado:' : 'Conclusão Confirmada:'}</span>
                  <span>{hospedagem.dataHoraConfirmacaoCheckOut}</span>
                </div>
              </div>
            )}
            {hospedagem.historicoPagamentos && hospedagem.historicoPagamentos.length > 0 ? (
              hospedagem.historicoPagamentos.map((pag, idx) => (
                <div key={pag.id || idx} className="flex items-center gap-2 text-sucesso-800 dark:text-sucesso-400 bg-sucesso-50/50 dark:bg-sucesso-950/20 border border-sucesso-100/50 dark:border-sucesso-900/30 rounded-xl p-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-sucesso-500"></span>
                  <div>
                    <span className="font-semibold block">
                      Recebido R$ {pag.valor.toFixed(2)} ({pag.tipo === 'entrada' ? 'Entrada' : pag.tipo === 'saldo' ? 'Quitação Saldo' : 'Pagamento Único'}):
                    </span>
                    <span>{pag.dataHora}</span>
                  </div>
                </div>
              ))
            ) : (
              hospedagem.statusPagamento === 'pago' && hospedagem.dataHoraConfirmacaoPagamento && (
                <div className="flex items-center gap-2 text-sucesso-800 dark:text-sucesso-400 bg-sucesso-50/50 dark:bg-sucesso-950/20 border border-sucesso-100/50 dark:border-sucesso-900/30 rounded-xl p-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-sucesso-500"></span>
                  <div>
                    <span className="font-semibold block">Pagamento Recebido:</span>
                    <span>{hospedagem.dataHoraConfirmacaoPagamento}</span>
                  </div>
                </div>
              )
            )}
            {hospedagem.dataHoraReversaoPagamento && (
              <div className="flex items-center gap-2 text-mostarda-800 dark:text-mostarda-400 bg-mostarda-50/50 dark:bg-mostarda-950/20 border border-mostarda-100/50 dark:border-mostarda-900/30 rounded-xl p-2.5">
                <span className="flex h-2 w-2 rounded-full bg-mostarda-500"></span>
                <div>
                  <span className="font-semibold block">Recebimento Desfeito:</span>
                  <span>{hospedagem.dataHoraReversaoPagamento}</span>
                </div>
              </div>
            )}
          </div>
        </div>

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
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-terracota-500 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600 shadow-md shadow-terracota-500/10 transition"
        >
          <Edit2 size={15} />
          Editar Ficha
        </button>
      </div>
    </div>
  );
}

