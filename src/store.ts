import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { Hospedagem, Gato, Estadia, StatusPagamento, TipoServico, HistoricoPagamento, TransporteAdicional } from './types';
import { hospedagensMock } from './data';
import { calculateEstadiaTotals, deriveStatusPagamento, getLocalTimestampString } from './utils';

interface HospedagemState {
  gatos: Gato[];
  estadias: Estadia[];
  hospedagens: Hospedagem[];
  selectedHospedagemId?: string;
  setSelectedHospedagemId: (id?: string) => void;
  
  // Feline Guest Actions
  addGato: (gato: Gato) => void;
  updateGato: (id: string, partial: Partial<Gato>) => void;
  removeGato: (id: string) => void;

  // Hospedagem Actions
  addHospedagem: (item: Hospedagem) => void;
  updateHospedagem: (id: string, partial: Partial<Hospedagem>) => void;
  removeHospedagem: (id: string) => void;
  moveHospedagemStatus: (id: string, status: Hospedagem['status']) => void;
  togglePagamento: (estadiaId: string) => void;
  registrarPagamento: (estadiaId: string, valor: number) => void;
  reverterUltimoPagamento: (estadiaId: string) => void;
  setHospedagens: (items: Hospedagem[] | { gatos: Gato[]; estadias: Estadia[] }) => void;
  
  // Internal helper for migration
  setMigrationData: (gatos: Gato[], estadias: Estadia[], hospedagens: Hospedagem[]) => void;
}

const resolveHospedagens = (gatos: Gato[], estadias: Estadia[]): Hospedagem[] => {
  return estadias.map((estadia) => {
    const gato = gatos.find((g) => g.id === estadia.gatoId);
    const { valorTotal } = calculateEstadiaTotals(estadia);
    const valorPago = estadia.valorPago ?? (estadia.statusPagamento === 'pago' ? valorTotal : 0);
    const derivedStatus = deriveStatusPagamento(valorPago, valorTotal);

    return {
      id: estadia.id,
      gatoId: estadia.gatoId,
      nomeGato: gato?.nomeGato || 'Gato Desconhecido',
      nomeTutor: gato?.nomeTutor || 'Tutor Desconhecido',
      fotoUrl: gato?.fotoUrl,
      dataCheckIn: estadia.dataCheckIn,
      dataCheckOut: estadia.dataCheckOut,
      status: estadia.status,
      perfil: gato?.perfil || {
        sociabilidade: 'sociavel',
        personalidade: '',
        dieta: '',
        observacoes: '',
      },
      dataHoraConfirmacaoCheckIn: estadia.dataHoraConfirmacaoCheckIn,
      dataHoraConfirmacaoCheckOut: estadia.dataHoraConfirmacaoCheckOut,
      valorDiaria: estadia.valorDiaria,
      transporteAdicional: estadia.transporteAdicional,
      valorPago,
      statusPagamento: derivedStatus,
      historicoPagamentos: estadia.historicoPagamentos || [],
      dataHoraConfirmacaoPagamento: estadia.dataHoraConfirmacaoPagamento,
      dataHoraReversaoPagamento: estadia.dataHoraReversaoPagamento,
      tipoServico: estadia.tipoServico || 'hospedagem',
      enderecoServico: estadia.enderecoServico,
      detalhesServico: estadia.detalhesServico,
      enderecoTutor: gato?.enderecoTutor,
    };
  });
};

const migrateDataIfNeeded = (hospedagens: any[], gatos: Gato[], estadias: Estadia[]) => {
  if ((gatos && gatos.length > 0) || (estadias && estadias.length > 0)) {
    const migratedEstadias = (estadias || []).map((e) => {
      const { valorTotal } = calculateEstadiaTotals(e);
      const valorPago = e.valorPago ?? (e.statusPagamento === 'pago' ? valorTotal : 0);
      const statusPagamento = deriveStatusPagamento(valorPago, valorTotal);

      return {
        ...e,
        valorPago,
        statusPagamento,
        historicoPagamentos: e.historicoPagamentos || [],
        tipoServico: e.tipoServico || 'hospedagem',
      };
    });
    return { gatos: gatos || [], estadias: migratedEstadias };
  }

  const newGatos: Gato[] = [];
  const newEstadias: Estadia[] = [];
  const gatoMap = new Map<string, string>();

  const sourceList = hospedagens && hospedagens.length > 0 ? hospedagens : hospedagensMock;

  sourceList.forEach((h: any) => {
    const key = `${h.nomeGato.trim().toLowerCase()}-${h.nomeTutor.trim().toLowerCase()}`;
    let gatoId = gatoMap.get(key);

    if (!gatoId) {
      gatoId = `gato-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      gatoMap.set(key, gatoId);
      newGatos.push({
        id: gatoId,
        nomeGato: h.nomeGato,
        nomeTutor: h.nomeTutor,
        fotoUrl: h.fotoUrl,
        perfil: h.perfil || {
          sociabilidade: 'sociavel',
          personalidade: '',
          dieta: '',
          observacoes: '',
        },
        valorDiariaPadrao: h.valorDiaria,
        dataCadastro: h.dataCheckIn || new Date().toISOString().split('T')[0],
        enderecoTutor: h.enderecoTutor,
      });
    }

    const { valorTotal } = calculateEstadiaTotals(h);
    const valorPago = h.valorPago ?? (h.statusPagamento === 'pago' ? valorTotal : 0);
    const statusPagamento = deriveStatusPagamento(valorPago, valorTotal);

    newEstadias.push({
      id: h.id,
      gatoId,
      dataCheckIn: h.dataCheckIn,
      dataCheckOut: h.dataCheckOut,
      status: h.status,
      dataHoraConfirmacaoCheckIn: h.dataHoraConfirmacaoCheckIn,
      dataHoraConfirmacaoCheckOut: h.dataHoraConfirmacaoCheckOut,
      valorDiaria: h.valorDiaria,
      transporteAdicional: h.transporteAdicional,
      valorPago,
      statusPagamento,
      historicoPagamentos: h.historicoPagamentos || [],
      dataHoraConfirmacaoPagamento: h.dataHoraConfirmacaoPagamento,
      tipoServico: h.tipoServico || 'hospedagem',
      enderecoServico: h.enderecoServico,
      detalhesServico: h.detalhesServico,
    });
  });

  return { gatos: newGatos, estadias: newEstadias };
};

export const useHospedagemStore = create<HospedagemState>()(
  persist(
    (set) => ({
      gatos: [],
      estadias: [],
      hospedagens: [],
      selectedHospedagemId: undefined,
      setSelectedHospedagemId: (id) => set({ selectedHospedagemId: id }),

      // Feline Guest Actions
      addGato: (gato) =>
        set((state) => {
          const newGatos = [gato, ...state.gatos];
          return {
            gatos: newGatos,
            hospedagens: resolveHospedagens(newGatos, state.estadias),
          };
        }),
      updateGato: (id, partial) =>
        set((state) => {
          const newGatos = state.gatos.map((g) =>
            g.id === id ? { ...g, ...partial } : g
          );
          return {
            gatos: newGatos,
            hospedagens: resolveHospedagens(newGatos, state.estadias),
          };
        }),
      removeGato: (id) =>
        set((state) => {
          const newGatos = state.gatos.filter((g) => g.id !== id);
          const newEstadias = state.estadias.filter((e) => e.gatoId !== id);
          return {
            gatos: newGatos,
            estadias: newEstadias,
            hospedagens: resolveHospedagens(newGatos, newEstadias),
          };
        }),

      // Hospedagem Actions
      addHospedagem: (item) =>
        set((state) => {
          let gatoId = item.gatoId;
          let newGatos = [...state.gatos];

          if (!gatoId) {
            const existingCat = state.gatos.find(
              (g) =>
                g.nomeGato.trim().toLowerCase() === item.nomeGato.trim().toLowerCase() &&
                g.nomeTutor.trim().toLowerCase() === item.nomeTutor.trim().toLowerCase()
            );

            if (existingCat) {
              gatoId = existingCat.id;
              newGatos = state.gatos.map((g) =>
                g.id === gatoId
                  ? {
                      ...g,
                      fotoUrl: item.fotoUrl || g.fotoUrl,
                      perfil: item.perfil,
                      valorDiariaPadrao: item.valorDiaria || g.valorDiariaPadrao,
                      enderecoTutor: item.enderecoTutor || g.enderecoTutor,
                    }
                  : g
              );
            } else {
              gatoId = `gato-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              newGatos.push({
                id: gatoId,
                nomeGato: item.nomeGato,
                nomeTutor: item.nomeTutor,
                fotoUrl: item.fotoUrl,
                perfil: item.perfil,
                valorDiariaPadrao: item.valorDiaria,
                dataCadastro: item.dataCheckIn,
                enderecoTutor: item.enderecoTutor,
              });
            }
          } else {
            newGatos = state.gatos.map((g) =>
              g.id === gatoId
                ? {
                    ...g,
                    nomeGato: item.nomeGato,
                    nomeTutor: item.nomeTutor,
                    fotoUrl: item.fotoUrl || g.fotoUrl,
                    perfil: item.perfil,
                    valorDiariaPadrao: item.valorDiaria || g.valorDiariaPadrao,
                    enderecoTutor: item.enderecoTutor || g.enderecoTutor,
                  }
                : g
            );
          }

          const { valorTotal } = calculateEstadiaTotals(item);
          const valorPago = item.valorPago || 0;
          const statusPagamento = deriveStatusPagamento(valorPago, valorTotal);

          const newEstadia: Estadia = {
            id: item.id,
            gatoId,
            dataCheckIn: item.dataCheckIn,
            dataCheckOut: item.dataCheckOut,
            status: item.status,
            dataHoraConfirmacaoCheckIn: item.dataHoraConfirmacaoCheckIn,
            dataHoraConfirmacaoCheckOut: item.dataHoraConfirmacaoCheckOut,
            valorDiaria: item.valorDiaria,
            transporteAdicional: item.transporteAdicional,
            valorPago,
            statusPagamento,
            historicoPagamentos: item.historicoPagamentos || [],
            dataHoraConfirmacaoPagamento: item.dataHoraConfirmacaoPagamento,
            dataHoraReversaoPagamento: item.dataHoraReversaoPagamento,
            tipoServico: item.tipoServico || 'hospedagem',
            enderecoServico: item.enderecoServico,
            detalhesServico: item.detalhesServico,
          };

          const newEstadias = [newEstadia, ...state.estadias];

          return {
            gatos: newGatos,
            estadias: newEstadias,
            hospedagens: resolveHospedagens(newGatos, newEstadias),
          };
        }),

      updateHospedagem: (id, partial) =>
        set((state) => {
          const targetEstadia = state.estadias.find((e) => e.id === id);
          if (!targetEstadia) return {};

          let newGatos = [...state.gatos];
          const newEstadias = state.estadias.map((e) => {
            if (e.id === id) {
              const merged = { ...e, ...partial };
              const { valorTotal } = calculateEstadiaTotals(merged);
              const valorPago = merged.valorPago ?? 0;
              merged.statusPagamento = deriveStatusPagamento(valorPago, valorTotal);
              return merged;
            }
            return e;
          });

          const hasCatUpdates =
            partial.nomeGato !== undefined ||
            partial.nomeTutor !== undefined ||
            partial.fotoUrl !== undefined ||
            partial.perfil !== undefined ||
            partial.valorDiaria !== undefined ||
            partial.enderecoTutor !== undefined;

          if (hasCatUpdates) {
            newGatos = state.gatos.map((g) =>
              g.id === targetEstadia.gatoId
                ? {
                    ...g,
                    nomeGato: partial.nomeGato !== undefined ? partial.nomeGato : g.nomeGato,
                    nomeTutor: partial.nomeTutor !== undefined ? partial.nomeTutor : g.nomeTutor,
                    fotoUrl: partial.fotoUrl !== undefined ? partial.fotoUrl : g.fotoUrl,
                    perfil: partial.perfil !== undefined ? partial.perfil : g.perfil,
                    valorDiariaPadrao: partial.valorDiaria !== undefined ? partial.valorDiaria : g.valorDiariaPadrao,
                    enderecoTutor: partial.enderecoTutor !== undefined ? partial.enderecoTutor : g.enderecoTutor,
                  }
                : g
            );
          }

          return {
            gatos: newGatos,
            estadias: newEstadias,
            hospedagens: resolveHospedagens(newGatos, newEstadias),
          };
        }),

      removeHospedagem: (id) =>
        set((state) => {
          const newEstadias = state.estadias.filter((e) => e.id !== id);
          return {
            estadias: newEstadias,
            hospedagens: resolveHospedagens(state.gatos, newEstadias),
          };
        }),

      moveHospedagemStatus: (id, status) =>
        set((state) => {
          const newEstadias = state.estadias.map((e) => {
            if (e.id === id) {
              return { ...e, status };
            }
            return e;
          });
          return {
            estadias: newEstadias,
            hospedagens: resolveHospedagens(state.gatos, newEstadias),
          };
        }),

      registrarPagamento: (estadiaId, valor) =>
        set((state) => {
          const nowStr = getLocalTimestampString();
          const newEstadias = state.estadias.map((e) => {
            if (e.id === estadiaId) {
              const { valorTotal } = calculateEstadiaTotals(e);
              const currentPaid = e.valorPago || 0;
              const newPaid = currentPaid + valor;
              const nextStatus = deriveStatusPagamento(newPaid, valorTotal);

              let tipo: HistoricoPagamento['tipo'] = 'entrada';
              if (currentPaid === 0 && newPaid >= valorTotal - 0.01) {
                tipo = 'pagamento_unico';
              } else if (newPaid >= valorTotal - 0.01) {
                tipo = 'saldo';
              } else if (currentPaid > 0) {
                tipo = 'entrada';
              }

              const newEntry: HistoricoPagamento = {
                id: `pag-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                valor,
                dataHora: nowStr,
                tipo,
              };

              const newHistory = [...(e.historicoPagamentos || []), newEntry];

              return {
                ...e,
                valorPago: newPaid,
                statusPagamento: nextStatus,
                historicoPagamentos: newHistory,
                dataHoraConfirmacaoPagamento: nowStr,
              };
            }
            return e;
          });

          return {
            estadias: newEstadias,
            hospedagens: resolveHospedagens(state.gatos, newEstadias),
          };
        }),

      reverterUltimoPagamento: (estadiaId) =>
        set((state) => {
          const nowStr = getLocalTimestampString();
          const newEstadias = state.estadias.map((e) => {
            if (e.id === estadiaId) {
              const history = [...(e.historicoPagamentos || [])];
              if (history.length === 0) {
                // Se não havia histórico formal, mas valorPago > 0, reseta para 0
                const { valorTotal } = calculateEstadiaTotals(e);
                return {
                  ...e,
                  valorPago: 0,
                  statusPagamento: 'pendente' as StatusPagamento,
                  dataHoraReversaoPagamento: nowStr,
                };
              }

              const lastEntry = history.pop();
              const newPaid = Math.max(0, (e.valorPago || 0) - (lastEntry?.valor || 0));
              const { valorTotal } = calculateEstadiaTotals(e);
              const nextStatus = deriveStatusPagamento(newPaid, valorTotal);

              return {
                ...e,
                valorPago: newPaid,
                statusPagamento: nextStatus,
                historicoPagamentos: history,
                dataHoraReversaoPagamento: nowStr,
              };
            }
            return e;
          });

          return {
            estadias: newEstadias,
            hospedagens: resolveHospedagens(state.gatos, newEstadias),
          };
        }),

      togglePagamento: (estadiaId) =>
        set((state) => {
          const target = state.estadias.find((e) => e.id === estadiaId);
          if (!target) return {};

          const { valorTotal } = calculateEstadiaTotals(target);
          if (target.statusPagamento === 'pago') {
            // Reverte tudo para pendente
            const nowStr = getLocalTimestampString();
            const newEstadias = state.estadias.map((e) =>
              e.id === estadiaId
                ? {
                    ...e,
                    valorPago: 0,
                    statusPagamento: 'pendente' as StatusPagamento,
                    historicoPagamentos: [],
                    dataHoraReversaoPagamento: nowStr,
                  }
                : e
            );
            return {
              estadias: newEstadias,
              hospedagens: resolveHospedagens(state.gatos, newEstadias),
            };
          } else {
            // Paga o saldo restante de uma vez
            const saldoRestante = Math.max(0, valorTotal - (target.valorPago || 0));
            const nowStr = getLocalTimestampString();
            const newEntry: HistoricoPagamento = {
              id: `pag-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              valor: saldoRestante,
              dataHora: nowStr,
              tipo: (target.valorPago || 0) > 0 ? 'saldo' : 'pagamento_unico',
            };
            const newEstadias = state.estadias.map((e) =>
              e.id === estadiaId
                ? {
                    ...e,
                    valorPago: valorTotal,
                    statusPagamento: 'pago' as StatusPagamento,
                    historicoPagamentos: [...(e.historicoPagamentos || []), newEntry],
                    dataHoraConfirmacaoPagamento: nowStr,
                  }
                : e
            );
            return {
              estadias: newEstadias,
              hospedagens: resolveHospedagens(state.gatos, newEstadias),
            };
          }
        }),

      setHospedagens: (data) =>
        set(() => {
          let gatosList: Gato[] = [];
          let estadiasList: Estadia[] = [];

          if (Array.isArray(data)) {
            const migrated = migrateDataIfNeeded(data, [], []);
            gatosList = migrated.gatos;
            estadiasList = migrated.estadias;
          } else if (data && typeof data === 'object') {
            const migrated = migrateDataIfNeeded([], (data as any).gatos || [], (data as any).estadias || []);
            gatosList = migrated.gatos;
            estadiasList = migrated.estadias;
          }

          return {
            gatos: gatosList,
            estadias: estadiasList,
            hospedagens: resolveHospedagens(gatosList, estadiasList),
          };
        }),

      setMigrationData: (gatos, estadias, hospedagens) =>
        set({ gatos, estadias, hospedagens }),
    }),
    {
      name: 'dinda-gatos-hospedagens',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { gatos, estadias } = migrateDataIfNeeded(
            state.hospedagens || [],
            state.gatos || [],
            state.estadias || []
          );
          const resolved = resolveHospedagens(gatos, estadias);
          state.setMigrationData(gatos, estadias, resolved);
        }
      },
    },
  ),
);

