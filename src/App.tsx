import { useEffect, useMemo, useState } from 'react';
import { useHospedagemStore } from './store';
import { HospedagemStatus, Hospedagem } from './types';
import { Column } from './components/Column';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { FormHospedagem } from './components/FormHospedagem';
import { FormEditHospedagem } from './components/FormEditHospedagem';
import { FichaHospedagem } from './components/FichaHospedagem';
import { Download, Upload } from 'lucide-react';
import { getLocalDateString, getLocalTimestampString, getStatusLabel } from './utils';

const statusOrder: HospedagemStatus[] = [
  'agendado',
  'hospedado',
  'saindo_hoje',
  'concluido',
];

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
  const moveHospedagemStatus = useHospedagemStore((state) => state.moveHospedagemStatus);
  const addHospedagem = useHospedagemStore((state) => state.addHospedagem);
  const updateHospedagem = useHospedagemStore((state) => state.updateHospedagem);
  const removeHospedagem = useHospedagemStore((state) => state.removeHospedagem);
  const setHospedagens = useHospedagemStore((state) => state.setHospedagens);

  const hoje = getLocalDateString();

  const entradasHoje = useMemo(
    () => hospedagens.filter((item) => item.dataCheckIn === hoje && item.status === 'agendado'),
    [hospedagens, hoje],
  );

  const saidasHoje = useMemo(
    () => hospedagens.filter((item) => item.dataCheckOut === hoje && item.status !== 'concluido'),
    [hospedagens, hoje],
  );

  const filteredHospedagens = useMemo(() => {
    return hospedagens.filter((item) => {
      const matchesSearch = 
        item.nomeGato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomeTutor.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

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
  }, [hospedagens, searchTerm, activeFilter]);

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

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(hospedagens, null, 2);
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

        if (!Array.isArray(importedData)) {
          throw new Error('O backup precisa ser uma lista de hospedagens.');
        }

        const isValid = importedData.every((item: any) => {
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

        if (!isValid) {
          throw new Error('A estrutura do arquivo JSON é inválida ou incompatível.');
        }

        if (confirm(`Aviso: Isso substituirá as ${hospedagens.length} hospedagens atuais por ${importedData.length} hospedagens do backup. Deseja continuar?`)) {
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header hospedagens={hospedagens} theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm md:flex-row md:items-center md:justify-between backdrop-blur-md">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Quadro de Hospedagens</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Gerencie e acompanhe automaticamente os check-ins, estadias e saídas com base no calendário.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              title="Salva uma cópia de segurança de todos os dados e fotos no seu computador"
            >
              <Download size={16} />
              Salvar Cópia (Backup)
            </button>
            <label
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
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
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500"
            >
              Novo Hóspede
            </button>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
            <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Agendados</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{grouped.find((group) => group.status === 'agendado')?.items.length ?? 0}</p>
            <p className="mt-1 text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">Proprietários que chegam nos próximos dias.</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
            <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Hospedados</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{grouped.find((group) => group.status === 'hospedado')?.items.length ?? 0}</p>
            <p className="mt-1 text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">Gatos que estão na casa agora.</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
            <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Entradas Hoje</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{entradasHoje.length}</p>
            <p className="mt-1 text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">Chegadas previstas para hoje.</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
            <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-slate-400">Saindo Hoje</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{saidasHoje.length}</p>
            <p className="mt-1 text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">Finalizam hospedagem no dia atual.</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between backdrop-blur-md">
          {/* Campo de Busca */}
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
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
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
                  onClick={() => setActiveFilter(btn.id as any)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-500/10'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none xl:hidden">
          {statusOrder.map((status) => {
            const count = grouped.find((group) => group.status === status)?.items.length ?? 0;
            const isActive = activeTab === status;
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`flex-shrink-0 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-500/10'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{getStatusLabel(status)}</span>
                <span className={`inline-flex items-center justify-center rounded-full h-5 px-1.5 text-xs font-bold ${
                  isActive ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          {grouped.map((group) => (
            <div
              key={group.status}
              className={group.status === activeTab ? 'block' : 'hidden xl:block'}
            >
              <Column
                status={group.status}
                items={group.items}
                onEdit={handleEditClick}
                onCheckOut={handleCheckOut}
                onCheckIn={handleCheckIn}
              />
            </div>
          ))}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        title="Novo Hóspede"
        onClose={() => setIsModalOpen(false)}
      >
        <FormHospedagem
          onSubmit={handleAddHospedagem}
          onCancel={() => setIsModalOpen(false)}
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
    </div>
  );
}

export default App;
