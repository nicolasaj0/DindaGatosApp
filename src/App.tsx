import { useEffect, useMemo, useState } from 'react';
import { useHospedagemStore } from './store';
import { HospedagemStatus, Hospedagem, Gato, Estadia } from './types';
import { Column } from './components/Column';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { FormHospedagem } from './components/FormHospedagem';
import { FormEditHospedagem } from './components/FormEditHospedagem';
import { FichaHospedagem } from './components/FichaHospedagem';
import { FormEditGato } from './components/FormEditGato';
import { FichaGato } from './components/FichaGato';
import { RelatoriosView } from './components/RelatoriosView';
import { ModalRegistrarPagamento } from './components/ModalRegistrarPagamento';
import { Download, Upload, Cat, Search, Edit2, Trash2, Calendar, Plus, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { getLocalDateString, getLocalTimestampString, getStatusLabel, formatDateString, calculateNights, labelStatus, calculateEstadiaTotals } from './utils';

const statusOrder: HospedagemStatus[] = [
  'agendado',
  'hospedado',
  'saindo_hoje',
  'concluido',
];


interface GatoStayHistoryProps {
  gatoId: string;
  estadias: Estadia[];
}

function GatoStayHistory({ gatoId, estadias }: GatoStayHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useMemo(() => {
    return estadias
      .filter((e) => e.gatoId === gatoId)
      .sort((a, b) => b.dataCheckIn.localeCompare(a.dataCheckIn));
  }, [gatoId, estadias]);

  const stats = useMemo(() => {
    let totalNights = 0;
    let totalSpent = 0;
    history.forEach((e) => {
      const totals = calculateEstadiaTotals(e);
      totalNights += totals.nights;
      totalSpent += totals.valorTotal;
    });
    return {
      count: history.length,
      nights: totalNights,
      spent: totalSpent,
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-[11px] font-body text-ink-muted text-center">
        Nenhum registro anterior.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-body">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-medium text-ink-subtle hover:text-ink transition-colors"
      >
        <span className="flex items-center gap-1 font-mono text-xs">
          Histórico ({stats.count})
        </span>
        <span className="text-[11px] font-mono text-ink-muted">
          {stats.nights} diárias • R$ {stats.spent.toFixed(0)}
        </span>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {isOpen && (
        <div className="mt-1.5 space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
          {history.map((e) => {
            const totals = calculateEstadiaTotals(e);
            return (
              <div key={e.id} className="flex justify-between items-center text-[10px] font-mono bg-parchment p-1.5 rounded-card border border-border-ledger">
                <span className="text-ink-subtle">
                  {formatDateString(e.dataCheckIn)} - {formatDateString(e.dataCheckOut)}
                </span>
                <span className="font-bold text-ink">
                  {totals.nights === 1 ? '1 diária' : `${totals.nights} diárias`} • R$ {totals.valorTotal.toFixed(0)}
                </span>
                <span className="px-1.5 py-0.5 rounded-card text-[8px] font-mono font-bold uppercase tracking-wider border border-border-ledger bg-parchment-elevated text-ink-subtle">
                  {e.status === 'concluido' ? 'Concl' : e.status === 'hospedado' ? 'Hosp' : e.status === 'saindo_hoje' ? 'Saída' : 'Agend'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<HospedagemStatus>('agendado');
  const [selectedHospedagem, setSelectedHospedagem] = useState<Hospedagem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'medication' | 'isolado' | 'sociavel'>('todos');
  const [serviceFilter, setServiceFilter] = useState<'todos' | 'hospedagem' | 'cat_sitter' | 'transporte'>('todos');
  const [currentView, setCurrentView] = useState<'hospedagens' | 'gatos' | 'relatorios'>('hospedagens');
  const [gatosSearchTerm, setGatosSearchTerm] = useState('');
  const [isEditGatoModalOpen, setIsEditGatoModalOpen] = useState(false);
  const [isViewGatoModalOpen, setIsViewGatoModalOpen] = useState(false);
  const [selectedGato, setSelectedGato] = useState<Gato | null>(null);
  const [viewingGato, setViewingGato] = useState<Gato | null>(null);
  const [preSelectedGatoId, setPreSelectedGatoId] = useState<string | undefined>(undefined);
  const [pagamentoModalHospedagem, setPagamentoModalHospedagem] = useState<Hospedagem | null>(null);
  const [layoutMode, setLayoutMode] = useState<'columns' | 'rows'>(() => {
    const saved = localStorage.getItem('layoutMode');
    return (saved === 'columns' || saved === 'rows') ? saved : 'rows';
  });

  const handleLayoutModeChange = (mode: 'columns' | 'rows') => {
    setLayoutMode(mode);
    localStorage.setItem('layoutMode', mode);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const hospedagens = useHospedagemStore((state) => state.hospedagens);
  const gatos = useHospedagemStore((state) => state.gatos);
  const estadias = useHospedagemStore((state) => state.estadias);
  const updateGato = useHospedagemStore((state) => state.updateGato);
  const removeGato = useHospedagemStore((state) => state.removeGato);
  const moveHospedagemStatus = useHospedagemStore((state) => state.moveHospedagemStatus);
  const addHospedagem = useHospedagemStore((state) => state.addHospedagem);
  const updateHospedagem = useHospedagemStore((state) => state.updateHospedagem);
  const removeHospedagem = useHospedagemStore((state) => state.removeHospedagem);
  const registrarPagamento = useHospedagemStore((state) => state.registrarPagamento);
  const setHospedagens = useHospedagemStore((state) => state.setHospedagens);

  const handleOpenPagamentoModal = (hospedagem: Hospedagem) => {
    setPagamentoModalHospedagem(hospedagem);
  };

  const handleConfirmPagamento = (estadiaId: string, valor: number) => {
    registrarPagamento(estadiaId, valor);
    setPagamentoModalHospedagem(null);
  };


  const hoje = getLocalDateString();

  const entradasHoje = useMemo(
    () => hospedagens.filter((item) => {
      const matchesDate = item.dataCheckIn === hoje && item.status === 'agendado';
      const matchesService = serviceFilter === 'todos' || item.tipoServico === serviceFilter;
      return matchesDate && matchesService;
    }),
    [hospedagens, hoje, serviceFilter],
  );

  const saidasHoje = useMemo(
    () => hospedagens.filter((item) => {
      const matchesDate = item.dataCheckOut === hoje && item.status !== 'concluido';
      const matchesService = serviceFilter === 'todos' || item.tipoServico === serviceFilter;
      return matchesDate && matchesService;
    }),
    [hospedagens, hoje, serviceFilter],
  );

  const filteredHospedagens = useMemo(() => {
    return hospedagens.filter((item) => {
      const matchesSearch =
        item.nomeGato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomeTutor.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (serviceFilter !== 'todos' && item.tipoServico !== serviceFilter) {
        return false;
      }

      if (activeFilter === 'medication') {
        const hasMedication = item.perfil.medicamentos &&
          item.perfil.medicamentos.trim() !== '' &&
          item.perfil.medicamentos.toLowerCase() !== 'nenhum';
        return hasMedication;
      }
      if (activeFilter === 'isolado') {
        return item.perfil.sociabilidade === 'isolado';
      }
      if (activeFilter === 'sociavel') {
        return item.perfil.sociabilidade === 'sociavel';
      }

      return true;
    });
  }, [hospedagens, searchTerm, activeFilter, serviceFilter]);

  const grouped = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        items: filteredHospedagens.filter((item) => item.status === status),
      })),
    [filteredHospedagens],
  );

  // Sincronização automática de status baseada na data local
  useEffect(() => {
    const syncStatuses = () => {
      const hoje = getLocalDateString();
      const currentList = useHospedagemStore.getState().hospedagens;

      currentList.forEach((item) => {
        // Não alterar quem já foi concluído manualmente
        if (item.status === 'concluido') return;

        let novoStatus: HospedagemStatus = item.status;

        // Se alcançou ou passou a data de checkout: se torna saindo_hoje
        if (hoje >= item.dataCheckOut) {
          novoStatus = 'saindo_hoje';
        }
        // Se a data de check-in é no futuro, mantém como agendado (caso as datas tenham mudado)
        else if (hoje < item.dataCheckIn) {
          novoStatus = 'agendado';
        }
        // OBSERVAÇÃO: O status "hospedado" não é mais forçado automaticamente se o status atual for "agendado".
        // Ele aguarda a confirmação manual de check-in do usuário.

        if (novoStatus !== item.status) {
          updateHospedagem(item.id, { status: novoStatus });
        }
      });
    };

    // Executar imediatamente e a cada 10 segundos
    syncStatuses();
    const interval = setInterval(syncStatuses, 10000);
    return () => clearInterval(interval);
  }, [updateHospedagem]);

  const handleCheckIn = (id: string) => {
    updateHospedagem(id, {
      status: 'hospedado',
      dataHoraConfirmacaoCheckIn: getLocalTimestampString()
    });
  };

  const handleCheckOut = (id: string) => {
    updateHospedagem(id, {
      status: 'concluido',
      dataHoraConfirmacaoCheckOut: getLocalTimestampString()
    });
  };

  const handleAddHospedagem = (novahospedagem: Hospedagem) => {
    addHospedagem(novahospedagem);
    setIsModalOpen(false);
  };

  const handleEditClick = (hospedagem: Hospedagem) => {
    setSelectedHospedagem(hospedagem);
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateHospedagem = (updated: Hospedagem) => {
    updateHospedagem(updated.id, updated);
    setIsEditModalOpen(false);
    setSelectedHospedagem(null);
  };

  const handleDeleteHospedagem = () => {
    if (selectedHospedagem && confirm(`Tem certeza que deseja deletar ${selectedHospedagem.nomeGato}?`)) {
      removeHospedagem(selectedHospedagem.id);
      setIsEditModalOpen(false);
      setSelectedHospedagem(null);
    }
  };

  const handleUpdateGato = (updatedGato: Gato) => {
    updateGato(updatedGato.id, updatedGato);
    setIsEditGatoModalOpen(false);
    setSelectedGato(null);
  };

  const handleDeleteGato = (gato: Gato) => {
    if (confirm(`Tem certeza que deseja remover permanentemente o cadastro de ${gato.nomeGato}? Isso apagará também todo o histórico de estadias dele.`)) {
      removeGato(gato.id);
    }
  };

  const filteredGatos = useMemo(() => {
    return gatos.filter((g) => {
      return (
        g.nomeGato.toLowerCase().includes(gatosSearchTerm.toLowerCase()) ||
        g.nomeTutor.toLowerCase().includes(gatosSearchTerm.toLowerCase())
      );
    });
  }, [gatos, gatosSearchTerm]);

  const handleExportJSON = () => {
    try {
      const stateToExport = {
        gatos: useHospedagemStore.getState().gatos,
        estadias: useHospedagemStore.getState().estadias,
      };
      const dataStr = JSON.stringify(stateToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const tempLink = document.createElement('a');
      tempLink.href = url;
      const today = getLocalDateString();
      tempLink.setAttribute('download', `dinda-gatos-backup-${today}.json`);
      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Ocorreu um erro ao exportar seus dados. Tente novamente.');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const importedData = JSON.parse(text);

        let isValid = false;
        let count = 0;

        if (Array.isArray(importedData)) {
          count = importedData.length;
          isValid = importedData.every((item: any) => {
            return (
              typeof item === 'object' &&
              item !== null &&
              typeof item.id === 'string' &&
              typeof item.nomeGato === 'string' &&
              typeof item.nomeTutor === 'string' &&
              typeof item.status === 'string' &&
              typeof item.perfil === 'object' &&
              item.perfil !== null &&
              typeof item.perfil.sociabilidade === 'string'
            );
          });
        } else if (importedData && typeof importedData === 'object') {
          const hasGatos = Array.isArray(importedData.gatos);
          const hasEstadias = Array.isArray(importedData.estadias);
          isValid = hasGatos && hasEstadias;
          count = (importedData.estadias || []).length;
        }

        if (!isValid) {
          throw new Error('O arquivo selecionado não é uma cópia de segurança válida do sistema.');
        }

        if (confirm(`Aviso: Isso substituirá todos os registros atuais do sistema por ${count} hospedagens do backup. Deseja continuar?`)) {
          setHospedagens(importedData);
          alert('Dados importados com sucesso!');
        }
      } catch (error: any) {
        console.error('Erro na importação:', error);
        alert(`Erro na importação: ${error.message || 'formato de arquivo inválido'}`);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-parchment text-ink transition-colors duration-150 font-body">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        {/* Main View Tabs selector - Solid Chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => setCurrentView('hospedagens')}
            className={`flex-shrink-0 px-4 py-2 rounded-card text-xs sm:text-sm font-body transition-colors duration-150 flex items-center gap-2 border ${
              currentView === 'hospedagens'
                ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                : 'bg-parchment-elevated text-ink-subtle border-border-ledger hover:text-ink hover:border-border-ledger-hover'
            }`}
          >
            <span>🗓️</span>
            <span>Quadro de Hospedagens</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentView('gatos');
              setPreSelectedGatoId(undefined);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-card text-xs sm:text-sm font-body transition-colors duration-150 flex items-center gap-2 border ${
              currentView === 'gatos'
                ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                : 'bg-parchment-elevated text-ink-subtle border-border-ledger hover:text-ink hover:border-border-ledger-hover'
            }`}
          >
            <span>🐱</span>
            <span>Hóspedes Felinos</span>
            <span className={`inline-flex items-center justify-center rounded-card px-1.5 py-0.5 text-xs font-mono font-medium ${
              currentView === 'gatos'
                ? 'bg-parchment text-stamp-plum'
                : 'bg-parchment text-ink-subtle border border-border-ledger'
            }`}>
              {gatos.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('relatorios')}
            className={`flex-shrink-0 px-4 py-2 rounded-card text-xs sm:text-sm font-body transition-colors duration-150 flex items-center gap-2 border ${
              currentView === 'relatorios'
                ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                : 'bg-parchment-elevated text-ink-subtle border-border-ledger hover:text-ink hover:border-border-ledger-hover'
            }`}
          >
            <span>📊</span>
            <span>Relatórios</span>
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-card border border-border-ledger bg-parchment-elevated p-5 sm:p-6 shadow-sm md:flex-row md:items-center md:justify-between transition-colors duration-150">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted">Visão Geral</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">
              {currentView === 'hospedagens' ? 'Quadro de Hospedagens' : currentView === 'gatos' ? 'Histórico & Hóspedes Felinos' : 'Relatório Financeiro & Desempenho'}
            </h2>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm font-body text-ink-subtle">
              {currentView === 'hospedagens'
                ? 'Acompanhamento de check-ins, estadias ativas e previsões de saída da pousada.'
                : currentView === 'gatos'
                  ? 'Cadastros unificados de hóspedes felinos, histórico de diárias e agendamentos.'
                  : 'Consolidado financeiro de diárias realizadas, a receber e faturamento por período.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center justify-center gap-1.5 rounded-card border border-border-ledger bg-parchment px-3.5 py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
              title="Salva uma cópia de segurança de todos os dados e fotos no seu computador"
            >
              <Download size={14} />
              <span>Salvar Cópia (Backup)</span>
            </button>
            <label
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-card border border-border-ledger bg-parchment px-3.5 py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
              title="Restaura os dados e fotos a partir de um arquivo de cópia salvo"
            >
              <Upload size={14} />
              <span>Restaurar Cópia</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-card bg-stamp-plum text-parchment border border-stamp-plum px-4 py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              <span>Novo Serviço</span>
            </button>
          </div>
        </div>

        {currentView === 'hospedagens' && (
          <>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex justify-between items-start transition-colors duration-150">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stamp-plum">Agendados</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">{grouped.find((group) => group.status === 'agendado')?.items.length ?? 0}</p>
                  <p className="mt-0.5 text-[11px] font-body text-ink-subtle">Chegadas previstas</p>
                </div>
                <div className="p-2 rounded-card border border-border-ledger bg-parchment text-stamp-plum flex-shrink-0 ml-2">
                  <Calendar size={18} />
                </div>
              </div>
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex justify-between items-start transition-colors duration-150">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stamp-plum">Hospedados</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">{grouped.find((group) => group.status === 'hospedado')?.items.length ?? 0}</p>
                  <p className="mt-0.5 text-[11px] font-body text-ink-subtle">Na casa hoje</p>
                </div>
                <div className="p-2 rounded-card border border-border-ledger bg-parchment text-stamp-plum flex-shrink-0 ml-2">
                  <Cat size={18} />
                </div>
              </div>
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex justify-between items-start transition-colors duration-150">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-muted">Entradas Hoje</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">{entradasHoje.length}</p>
                  <p className="mt-0.5 text-[11px] font-body text-ink-subtle">Previstos para hoje</p>
                </div>
                <div className="p-2 rounded-card border border-border-ledger bg-parchment text-ink-subtle flex-shrink-0 ml-2">
                  <ArrowRight size={18} />
                </div>
              </div>
              <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex justify-between items-start transition-colors duration-150">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stamp-gold">Saindo Hoje</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">{saidasHoje.length}</p>
                  <p className="mt-0.5 text-[11px] font-body text-ink-subtle">Fim de estadia hoje</p>
                </div>
                <div className="p-2 rounded-card border border-border-ledger bg-parchment text-stamp-gold flex-shrink-0 ml-2">
                  <ArrowLeft size={18} />
                </div>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="mt-5 flex flex-col gap-3.5 rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between transition-colors duration-150">
              <div className="relative flex-1 max-w-md w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por gato ou tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-card border border-border-ledger bg-parchment pl-9 pr-8 py-1.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:border-border-ledger-hover outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-muted hover:text-ink text-xs font-mono"
                    title="Limpar busca"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between lg:justify-end">
                {/* Filtro por Tipo de Serviço */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mr-1">Serviço:</span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'hospedagem', label: 'Hospedagem' },
                    { id: 'cat_sitter', label: 'Cat Sitter' },
                    { id: 'transporte', label: 'Transporte' },
                  ].map((btn) => {
                    const isSelected = serviceFilter === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setServiceFilter(btn.id as any)}
                        className={`rounded-card px-2.5 py-1 text-xs font-body border transition-colors ${
                          isSelected
                            ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                            : 'bg-parchment text-ink-subtle border-border-ledger hover:border-border-ledger-hover hover:text-ink'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* Filtros Rápidos */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mr-1">Filtro:</span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'medication', label: 'Medicamento' },
                    { id: 'isolado', label: 'Isolado' },
                    { id: 'sociavel', label: 'Sociável' },
                  ].map((btn) => {
                    const isSelected = activeFilter === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setActiveFilter(btn.id as any)}
                        className={`rounded-card px-2.5 py-1 text-xs font-body border transition-colors ${
                          isSelected
                            ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                            : 'bg-parchment text-ink-subtle border-border-ledger hover:border-border-ledger-hover hover:text-ink'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* Seletor de Modo de Layout */}
                <div className="flex items-center gap-1 rounded-card border border-border-ledger bg-parchment p-0.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleLayoutModeChange('rows')}
                    className={`px-2.5 py-1 rounded-card text-xs font-body transition-colors ${
                      layoutMode === 'rows'
                        ? 'bg-stamp-plum text-parchment font-semibold'
                        : 'text-ink-subtle hover:text-ink'
                    }`}
                    title="Visualização Horizontal"
                  >
                    Fileiras
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLayoutModeChange('columns')}
                    className={`px-2.5 py-1 rounded-card text-xs font-body transition-colors ${
                      layoutMode === 'columns'
                        ? 'bg-stamp-plum text-parchment font-semibold'
                        : 'text-ink-subtle hover:text-ink'
                    }`}
                    title="Visualização Vertical"
                  >
                    Colunas
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Tab Selector (Apenas no Modo Colunas) */}
            {layoutMode === 'columns' && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none xl:hidden">
                {statusOrder.map((status) => {
                  const count = grouped.find((group) => group.status === status)?.items.length ?? 0;
                  const isActive = activeTab === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveTab(status)}
                      className={`flex-shrink-0 flex items-center gap-2 rounded-card px-3 py-1.5 text-xs font-body transition-colors border ${
                        isActive
                          ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                          : 'bg-parchment-elevated text-ink-subtle border-border-ledger hover:border-border-ledger-hover hover:text-ink'
                      }`}
                    >
                      <span>{serviceFilter !== 'todos' ? labelStatus(status, serviceFilter) : getStatusLabel(status)}</span>
                      <span className={`inline-flex items-center justify-center rounded-card px-1.5 py-0.2 text-[10px] font-mono font-medium ${
                        isActive ? 'bg-parchment text-stamp-plum' : 'bg-parchment text-ink-subtle border border-border-ledger'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={layoutMode === 'rows' ? "mt-6 space-y-6" : "mt-6 grid gap-4 xl:grid-cols-4"}>
              {grouped.map((group) => (
                <div
                  key={group.status}
                  className={layoutMode === 'rows' ? "block" : (group.status === activeTab ? 'block' : 'hidden xl:block')}
                >
                  <Column
                    status={group.status}
                    items={group.items}
                    onEdit={handleEditClick}
                    onCheckOut={handleCheckOut}
                    onCheckIn={handleCheckIn}
                    onOpenPagamentoModal={handleOpenPagamentoModal}
                    layoutMode={layoutMode}
                    serviceFilter={serviceFilter}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {currentView === 'gatos' && (
          <div className="space-y-5">
            {/* Campo de Busca Gatos */}
            <div className="flex flex-col gap-3 rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm md:flex-row md:items-center md:justify-between transition-colors duration-150">
              <div className="relative flex-1 max-w-md w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nome do gato ou tutor..."
                  value={gatosSearchTerm}
                  onChange={(e) => setGatosSearchTerm(e.target.value)}
                  className="w-full rounded-card border border-border-ledger bg-parchment pl-9 pr-3 py-1.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:border-border-ledger-hover outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreSelectedGatoId(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-card bg-stamp-plum text-parchment border border-stamp-plum px-3.5 py-1.5 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Novo Serviço
              </button>
            </div>

            {/* Grid de Hóspedes Felinos */}
            {filteredGatos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border-ledger bg-parchment p-10 text-center text-ink-muted">
                <span className="text-3xl mb-2 opacity-70">🐾</span>
                <p className="text-sm font-body font-medium text-ink">Nenhum felino encontrado</p>
                <p className="text-xs font-body text-ink-muted mt-0.5">Cadastre um novo gato ou ajuste os termos da busca.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGatos.map((gato) => (
                  <div
                    key={gato.id}
                    onClick={() => {
                      setViewingGato(gato);
                      setIsViewGatoModalOpen(true);
                    }}
                    className="cursor-pointer rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex flex-col justify-between hover:border-border-ledger-hover transition-colors duration-150"
                  >
                    <div>
                      {/* Informações Principais */}
                      <div className="flex gap-3 items-start">
                        <div className="h-14 w-14 overflow-hidden rounded-card border border-border-ledger bg-parchment flex-shrink-0 flex items-center justify-center">
                          {gato.fotoUrl ? (
                            <img src={gato.fotoUrl} alt={gato.nomeGato} className="h-full w-full object-cover" />
                          ) : (
                            <Cat size={24} className="text-ink-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold font-display text-ink truncate">{gato.nomeGato}</h3>
                          <p className="text-xs font-body text-ink-subtle truncate mt-0.5">
                            Tutor: <span className="font-medium text-ink">{gato.nomeTutor}</span>
                          </p>
                          <p className="text-[10px] font-mono text-ink-muted mt-0.5">
                            Cadastrado em {formatDateString(gato.dataCadastro)}
                          </p>
                        </div>
                      </div>

                      {/* Metadados em Linha */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border-ledger pt-2 text-xs font-body text-ink-subtle">
                        <span>{gato.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}</span>
                        {gato.perfil.personalidade && (
                          <>
                            <span>•</span>
                            <span>{gato.perfil.personalidade}</span>
                          </>
                        )}
                        {gato.valorDiariaPadrao && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-medium text-ink">
                              R$ {gato.valorDiariaPadrao}/dia
                            </span>
                          </>
                        )}
                      </div>

                      {/* Prontuário / Notas rápidas */}
                      <div className="mt-3 space-y-1 text-xs font-body text-ink-subtle bg-parchment rounded-card p-2.5 border border-border-ledger">
                        {gato.perfil.dieta && (
                          <p className="truncate"><strong className="font-mono text-[10px] uppercase text-ink-muted">Dieta:</strong> {gato.perfil.dieta}</p>
                        )}
                        {gato.perfil.medicamentos && gato.perfil.medicamentos.toLowerCase() !== 'nenhum' && (
                          <p className="truncate text-stamp-wine font-semibold">
                            <strong className="font-mono text-[10px] uppercase text-stamp-wine">Meds:</strong> {gato.perfil.medicamentos}
                          </p>
                        )}
                        {gato.perfil.observacoes && (
                          <p className="truncate"><strong className="font-mono text-[10px] uppercase text-ink-muted">Obs:</strong> {gato.perfil.observacoes}</p>
                        )}
                      </div>
                    </div>

                    {/* Histórico Desdobrável */}
                    <div className="mt-3 pt-2.5 border-t border-border-ledger" onClick={(e) => e.stopPropagation()}>
                      <GatoStayHistory gatoId={gato.id} estadias={estadias} />
                    </div>

                    {/* Ações */}
                    <div className="mt-3 flex gap-2 pt-2.5 border-t border-border-ledger" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setPreSelectedGatoId(gato.id);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-card bg-parchment border border-border-ledger py-1.5 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
                      >
                        <Calendar size={13} />
                        Agendar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGato(gato);
                          setIsEditGatoModalOpen(true);
                        }}
                        className="p-1.5 rounded-card border border-border-ledger text-ink-subtle hover:text-ink hover:border-border-ledger-hover transition-colors"
                        title="Editar prontuário do gato"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGato(gato)}
                        className="p-1.5 rounded-card border border-border-ledger text-stamp-wine hover:border-stamp-wine transition-colors"
                        title="Remover cadastro permanentemente"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'relatorios' && (
          <RelatoriosView estadias={estadias} gatos={gatos} />
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        title="Novo Serviço"
        onClose={() => {
          setIsModalOpen(false);
          setPreSelectedGatoId(undefined);
        }}
      >
        <FormHospedagem
          onSubmit={handleAddHospedagem}
          onCancel={() => {
            setIsModalOpen(false);
            setPreSelectedGatoId(undefined);
          }}
          preSelectedGatoId={preSelectedGatoId}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        title={isEditing ? `Editar Ficha: ${selectedHospedagem?.nomeGato}` : `Ficha de Hospedagem: ${selectedHospedagem?.nomeGato}`}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHospedagem(null);
          setIsEditing(false);
        }}
      >
        {selectedHospedagem && (
          isEditing ? (
            <FormEditHospedagem
              hospedagem={selectedHospedagem}
              onSubmit={handleUpdateHospedagem}
              onCancel={() => {
                setIsEditing(false);
              }}
              onDelete={handleDeleteHospedagem}
            />
          ) : (
            <FichaHospedagem
              hospedagem={selectedHospedagem}
              onEditClick={() => setIsEditing(true)}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedHospedagem(null);
              }}
              onOpenPagamentoModal={handleOpenPagamentoModal}
            />
          )
        )}
      </Modal>

      <Modal
        isOpen={isEditGatoModalOpen}
        title={`Editar Prontuário: ${selectedGato?.nomeGato}`}
        onClose={() => {
          setIsEditGatoModalOpen(false);
          setSelectedGato(null);
        }}
      >
        {selectedGato && (
          <FormEditGato
            gato={selectedGato}
            onSubmit={handleUpdateGato}
            onCancel={() => {
              setIsEditGatoModalOpen(false);
              setSelectedGato(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isViewGatoModalOpen}
        title={`Prontuário: ${viewingGato?.nomeGato}`}
        onClose={() => {
          setIsViewGatoModalOpen(false);
          setViewingGato(null);
        }}
      >
        {viewingGato && (
          <FichaGato
            gato={viewingGato}
            estadias={estadias}
            onClose={() => {
              setIsViewGatoModalOpen(false);
              setViewingGato(null);
            }}
            onAgendarClick={() => {
              setIsViewGatoModalOpen(false);
              setPreSelectedGatoId(viewingGato.id);
              setIsModalOpen(true);
            }}
            onEditClick={() => {
              setIsViewGatoModalOpen(false);
              setSelectedGato(viewingGato);
              setIsEditGatoModalOpen(true);
            }}
          />
        )}
      </Modal>

      <ModalRegistrarPagamento
        isOpen={!!pagamentoModalHospedagem}
        hospedagem={pagamentoModalHospedagem}
        onClose={() => setPagamentoModalHospedagem(null)}
        onConfirm={handleConfirmPagamento}
      />
    </div>
  );
}


export default App;
