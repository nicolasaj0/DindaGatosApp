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
import { RelatoriosView } from './components/RelatoriosView';
import { Download, Upload, Cat, Search, Edit2, Trash2, Calendar, Plus, HeartPulse, ChevronDown, ChevronUp, BarChart3, Home, ArrowRight, ArrowLeft, PawPrint } from 'lucide-react';
import { getLocalDateString, getLocalTimestampString, getStatusLabel, formatDateString, calculateNights, labelStatus } from './utils';

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
    const totalNights = history.reduce((sum, e) => sum + calculateNights(e.dataCheckIn, e.dataCheckOut), 0);
    const totalSpent = history.reduce((sum, e) => {
      const nights = calculateNights(e.dataCheckIn, e.dataCheckOut);
      return sum + (nights * (e.valorDiaria || 50));
    }, 0);
    return {
      count: history.length,
      nights: totalNights,
      spent: totalSpent,
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
        Nenhuma hospedagem registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-semibold text-slate-655 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <span className="flex items-center gap-1">
          📊 Histórico ({stats.count})
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {stats.nights} diárias • R$ {stats.spent.toFixed(0)}
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="mt-1.5 space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
          {history.map((e) => {
            const nights = calculateNights(e.dataCheckIn, e.dataCheckOut);
            const val = nights * (e.valorDiaria || 50);
            return (
              <div key={e.id} className="flex justify-between items-center text-[10px] bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                <span className="font-medium text-slate-600 dark:text-slate-350">
                  {formatDateString(e.dataCheckIn)} - {formatDateString(e.dataCheckOut)}
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  {nights === 1 ? '1 dia' : `${nights} dias`} • R$ {val.toFixed(0)}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${e.status === 'concluido'
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                  : e.status === 'hospedado'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-650 dark:text-emerald-450'
                    : e.status === 'saindo_hoje'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-terracota-100 dark:bg-terracota-950/60 text-terracota-600 dark:text-terracota-400'
                  }`}>
                  {e.status === 'concluido' ? 'Fim' : e.status === 'hospedado' ? 'In' : e.status === 'saindo_hoje' ? 'Out' : 'Agend'}
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
  const [selectedGato, setSelectedGato] = useState<Gato | null>(null);
  const [preSelectedGatoId, setPreSelectedGatoId] = useState<string | undefined>(undefined);
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
  const setHospedagens = useHospedagemStore((state) => state.setHospedagens);

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

      hospedagens.forEach((item) => {
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
  }, [hospedagens, updateHospedagem]);

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
      const today = new Date().toISOString().slice(0, 10);
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
          throw new Error('A estrutura do arquivo JSON é inválida ou incompatível.');
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
    <div className="min-h-screen w-full overflow-x-hidden bg-warmBg-100 dark:bg-warmBg-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header hospedagens={hospedagens} theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        {/* Main View Tabs selector */}
        <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            type="button"
            onClick={() => setCurrentView('hospedagens')}
            className={`flex-shrink-0 px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-1.5 ${currentView === 'hospedagens'
              ? 'border-terracota-500 text-terracota-600 dark:text-terracota-400 dark:border-terracota-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
            className={`flex-shrink-0 px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-1.5 ${currentView === 'gatos'
              ? 'border-terracota-500 text-terracota-600 dark:text-terracota-400 dark:border-terracota-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <span>🐱</span>
            <span>Hóspedes Felinos</span>
            <span className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 font-bold">
              {gatos.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('relatorios')}
            className={`flex-shrink-0 px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-1.5 ${currentView === 'relatorios'
              ? 'border-terracota-500 text-terracota-600 dark:text-terracota-400 dark:border-terracota-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <span>📊</span>
            <span>Relatórios</span>
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm md:flex-row md:items-center md:justify-between backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {currentView === 'hospedagens' ? 'Quadro de Hospedagens' : currentView === 'gatos' ? 'Histórico & Hóspedes Felinos' : 'Relatório Financeiro & Desempenho'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {currentView === 'hospedagens'
                ? 'Gerencie e acompanhe automaticamente os check-ins, estadias e saídas com base no calendário.'
                : currentView === 'gatos'
                  ? 'Consulte perfis unificados dos gatos, verifique diárias acumuladas e faça agendamentos rápidos.'
                  : 'Analise a visão geral financeira de diárias e receitas geradas por período e hóspede.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ardosia-350 dark:border-ardosia-800 bg-white dark:bg-warmBg-900 px-4 py-3 text-sm font-semibold text-ardosia-700 dark:text-ardosia-300 shadow-sm hover:bg-ardosia-50 dark:hover:bg-ardosia-950/20 transition"
              title="Salva uma cópia de segurança de todos os dados e fotos no seu computador"
            >
              <Download size={16} />
              Salvar Cópia (Backup)
            </button>
            <label
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-ardosia-350 dark:border-ardosia-800 bg-white dark:bg-warmBg-900 px-4 py-3 text-sm font-semibold text-ardosia-700 dark:text-ardosia-300 shadow-sm hover:bg-ardosia-50 dark:hover:bg-ardosia-950/20 transition"
              title="Restaura os dados e fotos a partir de um arquivo de cópia salvo"
            >
              <Upload size={16} />
              Restaurar Cópia (Importar)
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-terracota-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-terracota-500/20 transition hover:bg-terracota-600"
            >
              Novo Hóspede
            </button>
          </div>
        </div>

        {currentView === 'hospedagens' && (
          <>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border-l-4 border-l-mostarda-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-4 sm:p-5 shadow-sm transition hover:shadow-md flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Agendados</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white">{grouped.find((group) => group.status === 'agendado')?.items.length ?? 0}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug">Proprietários que chegam nos próximos dias.</p>
                </div>
                <div className="p-2 rounded-2xl bg-mostarda-50 dark:bg-mostarda-950/45 text-mostarda-600 dark:text-mostarda-400 flex-shrink-0 ml-2">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="rounded-3xl border-l-4 border-l-emerald-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-4 sm:p-5 shadow-sm transition hover:shadow-md flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Hospedados</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white">{grouped.find((group) => group.status === 'hospedado')?.items.length ?? 0}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug">Gatos que estão na casa agora.</p>
                </div>
                <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2">
                  <Cat size={20} />
                </div>
              </div>
              <div className="rounded-3xl border-l-4 border-l-ardosia-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-4 sm:p-5 shadow-sm transition hover:shadow-md flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Entradas Hoje</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white">{entradasHoje.length}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug">Chegadas previstas para hoje.</p>
                </div>
                <div className="p-2 rounded-2xl bg-ardosia-50 dark:bg-ardosia-950/45 text-ardosia-600 dark:text-ardosia-400 flex-shrink-0 ml-2">
                  <ArrowRight size={20} />
                </div>
              </div>
              <div className="rounded-3xl border-l-4 border-l-terracota-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-4 sm:p-5 shadow-sm transition hover:shadow-md flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Saindo Hoje</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white">{saidasHoje.length}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug">Finalizam hospedagem no dia atual.</p>
                </div>
                <div className="p-2 rounded-2xl bg-terracota-50 dark:bg-terracota-950/45 text-terracota-600 dark:text-terracota-400 flex-shrink-0 ml-2">
                  <ArrowLeft size={20} />
                </div>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between backdrop-blur-md">
              <div className="relative flex-1 max-w-md w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar por gato ou tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-warmBg-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between lg:justify-end">
                {/* Filtro por Tipo de Serviço */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">Serviço:</span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'hospedagem', label: '🏠 Hospedagem' },
                    { id: 'cat_sitter', label: '🐾 Cat Sitter' },
                    { id: 'transporte', label: '🚗 Transporte' },
                  ].map((btn) => {
                    const isSelected = serviceFilter === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setServiceFilter(btn.id as any)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${isSelected
                          ? 'bg-terracota-500 text-white border-terracota-500 shadow-md shadow-terracota-500/10 font-bold'
                          : 'bg-white dark:bg-warmBg-950 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* Filtros Rápidos */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">Filtrar:</span>
                  {[
                    { id: 'todos', label: '🐾 Todos' },
                    { id: 'medication', label: '💊 Medicamento' },
                    { id: 'isolado', label: '🔒 Isolado' },
                    { id: 'sociavel', label: '🤝 Sociável' },
                  ].map((btn) => {
                    const isSelected = activeFilter === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setActiveFilter(btn.id as any)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition-all ${isSelected
                          ? 'bg-terracota-500 text-white border-terracota-500 shadow-md shadow-terracota-500/10 font-bold'
                          : 'bg-white dark:bg-warmBg-950 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* Seletor de Modo de Layout */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/55 dark:border-slate-800/80 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleLayoutModeChange('rows')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${layoutMode === 'rows'
                      ? 'bg-white dark:bg-warmBg-850 text-terracota-600 dark:text-terracota-400 shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    title="Visualização Horizontal"
                  >
                    <span>☱</span>
                    <span>Fileiras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLayoutModeChange('columns')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${layoutMode === 'columns'
                      ? 'bg-white dark:bg-warmBg-850 text-terracota-600 dark:text-terracota-400 shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    title="Visualização Vertical"
                  >
                    <span>🗓️</span>
                    <span>Colunas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Tab Selector (Apenas no Modo Colunas) */}
            {layoutMode === 'columns' && (
              <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none xl:hidden">
                {statusOrder.map((status) => {
                  const count = grouped.find((group) => group.status === status)?.items.length ?? 0;
                  const isActive = activeTab === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveTab(status)}
                      className={`flex-shrink-0 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all border ${isActive
                        ? 'bg-terracota-500 text-white border-terracota-500 shadow-md shadow-terracota-500/10'
                        : 'bg-white dark:bg-warmBg-900 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855'
                        }`}
                    >
                      <span>{serviceFilter !== 'todos' ? labelStatus(status, serviceFilter) : getStatusLabel(status)}</span>
                      <span className={`inline-flex items-center justify-center rounded-full h-5 px-1.5 text-xs font-bold ${isActive ? 'bg-terracota-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                    layoutMode={layoutMode}
                    serviceFilter={serviceFilter}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {currentView === 'gatos' && (
          <div className="space-y-6">
            {/* Campo de Busca Gatos */}
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between backdrop-blur-md">
              <div className="relative flex-1 max-w-md w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search size={18} className="text-slate-400 dark:text-slate-500" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar hóspede por nome ou tutor..."
                  value={gatosSearchTerm}
                  onChange={(e) => setGatosSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-warmBg-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500 transition-all shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreSelectedGatoId(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-terracota-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-terracota-500/20 transition hover:bg-terracota-600"
              >
                <Plus size={16} />
                Novo Hóspede
              </button>
            </div>

            {/* Grid de Hóspedes Felinos */}
            {filteredGatos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-12 text-center text-slate-400 dark:text-slate-500">
                <span className="text-4xl mb-2">🐾</span>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Nenhum hóspede felino encontrado</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Crie um novo cadastro ou ajuste os termos de busca.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGatos.map((gato) => (
                  <div
                    key={gato.id}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
                  >
                    <div>
                      {/* Informações Principais */}
                      <div className="flex gap-4 items-start">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center shadow-inner">
                          {gato.fotoUrl ? (
                            <img src={gato.fotoUrl} alt={gato.nomeGato} className="h-full w-full object-cover" />
                          ) : (
                            <Cat size={32} className="text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{gato.nomeGato}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Tutor: <span className="font-semibold text-slate-700 dark:text-slate-300">{gato.nomeTutor}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Cadastrado em {formatDateString(gato.dataCadastro)}
                          </p>
                        </div>
                      </div>

                      {/* Badges de Perfil */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gato.perfil.sociabilidade === 'sociavel'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30'
                          }`}>
                          {gato.perfil.sociabilidade === 'sociavel' ? 'Sociável' : 'Isolado'}
                        </span>
                        {gato.perfil.personalidade && (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-750">
                            {gato.perfil.personalidade}
                          </span>
                        )}
                        {gato.valorDiariaPadrao && (
                          <span className="text-[10px] font-bold bg-terracota-50 dark:bg-terracota-950/20 text-terracota-700 dark:text-terracota-405 px-2 py-0.5 rounded-full border border-terracota-100/50 dark:border-terracota-900/30 ml-auto">
                            R$ {gato.valorDiariaPadrao}/diária
                          </span>
                        )}
                      </div>

                      {/* Prontuário / Notas rápidas */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl p-3 border border-slate-100/80 dark:border-slate-800/60">
                        {gato.perfil.dieta && (
                          <p className="truncate"><strong className="text-slate-800 dark:text-slate-200">🍽️ Dieta:</strong> {gato.perfil.dieta}</p>
                        )}
                        {gato.perfil.medicamentos && gato.perfil.medicamentos.toLowerCase() !== 'nenhum' && (
                          <p className="truncate text-red-650 dark:text-red-400 font-semibold">
                            <strong className="text-slate-800 dark:text-slate-200">💊 Meds:</strong> {gato.perfil.medicamentos}
                          </p>
                        )}
                        {gato.perfil.observacoes && (
                          <p className="truncate"><strong className="text-slate-800 dark:text-slate-200">📝 Obs:</strong> {gato.perfil.observacoes}</p>
                        )}
                      </div>
                    </div>

                    {/* Histórico Desdobrável */}
                    <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800/80">
                      <GatoStayHistory gatoId={gato.id} estadias={estadias} />
                    </div>

                    {/* Ações */}
                    <div className="mt-4 flex gap-2 pt-3 border-t border-slate-150 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          setPreSelectedGatoId(gato.id);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-terracota-50 dark:bg-terracota-950/20 border border-terracota-100/50 dark:border-terracota-900/30 py-2 text-xs font-semibold text-terracota-600 dark:text-terracota-450 hover:bg-terracota-100 dark:hover:bg-terracota-950/40 transition"
                      >
                        <Calendar size={13} />
                        Hospedar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGato(gato);
                          setIsEditGatoModalOpen(true);
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Editar prontuário do gato"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGato(gato)}
                        className="p-2 rounded-xl border border-red-100 dark:border-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
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
        title="Novo Hóspede"
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
    </div>
  );
}

export default App;
