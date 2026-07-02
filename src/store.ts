import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { hospedagensMock } from './data';
import { Hospedagem } from './types';

interface HospedagemState {
  hospedagens: Hospedagem[];
  selectedHospedagemId?: string;
  setSelectedHospedagemId: (id?: string) => void;
  addHospedagem: (item: Hospedagem) => void;
  updateHospedagem: (id: string, partial: Partial<Hospedagem>) => void;
  removeHospedagem: (id: string) => void;
  moveHospedagemStatus: (id: string, status: Hospedagem['status']) => void;
  setHospedagens: (items: Hospedagem[]) => void;
}

export const useHospedagemStore = create<HospedagemState>()(
  persist(
    (set) => ({
      hospedagens: hospedagensMock,
      selectedHospedagemId: undefined,
      setSelectedHospedagemId: (id) => set({ selectedHospedagemId: id }),
      addHospedagem: (item) =>
        set((state) => ({ hospedagens: [item, ...state.hospedagens] })),
      updateHospedagem: (id, partial) =>
        set((state) => ({
          hospedagens: state.hospedagens.map((item) =>
            item.id === id ? { ...item, ...partial } : item,
          ),
        })),
      removeHospedagem: (id) =>
        set((state) => ({
          hospedagens: state.hospedagens.filter((item) => item.id !== id),
        })),
      moveHospedagemStatus: (id, status) =>
        set((state) => ({
          hospedagens: state.hospedagens.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      setHospedagens: (items) => set({ hospedagens: items }),
    }),
    {
      name: 'dinda-gatos-hospedagens',
    },
  ),
);
