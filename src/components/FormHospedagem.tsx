import { useState, useEffect } from 'react';
import { Hospedagem, TipoServico } from '../types';
import { resizeImage, getLocalDateString, calculateNights } from '../utils';
import { Camera, Upload, Link2, X, Sparkles, Home, PawPrint, Car, ArrowLeft } from 'lucide-react';
import { useHospedagemStore } from '../store';

interface FormHospedagemProps {
  onSubmit: (hospedagem: Hospedagem) => void;
  onCancel: () => void;
  preSelectedGatoId?: string;
}

export function FormHospedagem({ onSubmit, onCancel, preSelectedGatoId }: FormHospedagemProps) {
  const gatos = useHospedagemStore((state) => state.gatos);
  const [selectedGatoId, setSelectedGatoId] = useState(preSelectedGatoId || '');
  const [step, setStep] = useState(1);
  const [tipoServico, setTipoServico] = useState<TipoServico>('hospedagem');

  const [formData, setFormData] = useState({
    nomeGato: '',
    nomeTutor: '',
    fotoUrl: '',
    dataCheckIn: getLocalDateString(),
    dataCheckOut: getLocalDateString(new Date(Date.now() + 86400000)),
    sociabilidade: 'sociavel' as 'sociavel' | 'isolado',
    personalidade: '',
    dieta: '',
    observacoes: '',
    medicamentos: '',
    valorDiaria: '60',
    enderecoTutor: '',
    enderecoServico: '',
    detalhesServico: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (preSelectedGatoId) {
      const g = gatos.find((cat) => cat.id === preSelectedGatoId);
      if (g) {
        setFormData((prev) => ({
          ...prev,
          nomeGato: g.nomeGato,
          nomeTutor: g.nomeTutor,
          fotoUrl: g.fotoUrl || '',
          sociabilidade: g.perfil.sociabilidade,
          personalidade: g.perfil.personalidade,
          dieta: g.perfil.dieta,
          observacoes: g.perfil.observacoes,
          medicamentos: g.perfil.medicamentos || '',
          valorDiaria: g.valorDiariaPadrao?.toString() || '60',
          enderecoTutor: g.enderecoTutor || '',
          enderecoServico: g.enderecoTutor || '',
        }));
        // Se já está pré-selecionado, pula para o formulário após escolher
      }
    }
  }, [preSelectedGatoId, gatos]);

  const handleSelectGatoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGatoId(val);
    if (val === '') {
      setFormData((prev) => ({
        ...prev,
        nomeGato: '',
        nomeTutor: '',
        fotoUrl: '',
        sociabilidade: 'sociavel',
        personalidade: '',
        dieta: '',
        observacoes: '',
        medicamentos: '',
        valorDiaria: '60',
        enderecoTutor: '',
        enderecoServico: '',
      }));
    } else {
      const g = gatos.find((cat) => cat.id === val);
      if (g) {
        setFormData((prev) => ({
          ...prev,
          nomeGato: g.nomeGato,
          nomeTutor: g.nomeTutor,
          fotoUrl: g.fotoUrl || '',
          sociabilidade: g.perfil.sociabilidade,
          personalidade: g.perfil.personalidade,
          dieta: g.perfil.dieta,
          observacoes: g.perfil.observacoes,
          medicamentos: g.perfil.medicamentos || '',
          valorDiaria: g.valorDiariaPadrao?.toString() || '60',
          enderecoTutor: g.enderecoTutor || '',
          enderecoServico: g.enderecoTutor || '',
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Se mudar o endereço do tutor e o do serviço estiver vazio, copia automaticamente
      if (name === 'enderecoTutor' && !prev.enderecoServico) {
        updated.enderecoServico = value;
      }
      return updated;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedBase64 = await resizeImage(file);
      setFormData((prev) => ({ ...prev, fotoUrl: compressedBase64 }));
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar a imagem. Tente outro arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, fotoUrl: '' }));
  };

  const selectService = (type: TipoServico) => {
    setTipoServico(type);
    // Se for transporte, inicializa dataCheckOut com a mesma data de checkIn
    if (type === 'transporte') {
      setFormData((prev) => ({ ...prev, dataCheckOut: prev.dataCheckIn }));
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomeGato || !formData.nomeTutor) {
      alert('Nome do gato e tutor são obrigatórios');
      return;
    }

    if (tipoServico !== 'transporte' && formData.dataCheckOut < formData.dataCheckIn) {
      alert('Atenção: A data de término/check-out não pode ser anterior à data de início/check-in.');
      return;
    }

    if (tipoServico !== 'hospedagem' && !formData.enderecoServico.trim()) {
      alert('O endereço do serviço é obrigatório para este serviço.');
      return;
    }

    const valorNum = parseFloat(formData.valorDiaria);
    const finalCheckOut = tipoServico === 'transporte' ? formData.dataCheckIn : formData.dataCheckOut;

    const novahospedagem: Hospedagem = {
      id: `${Date.now()}`,
      gatoId: selectedGatoId || undefined,
      nomeGato: formData.nomeGato,
      nomeTutor: formData.nomeTutor,
      fotoUrl: formData.fotoUrl || undefined,
      dataCheckIn: formData.dataCheckIn,
      dataCheckOut: finalCheckOut,
      status: 'agendado',
      perfil: {
        sociabilidade: formData.sociabilidade,
        personalidade: formData.personalidade,
        dieta: formData.dieta,
        observacoes: formData.observacoes,
        medicamentos: formData.medicamentos || undefined,
      },
      valorDiaria: isNaN(valorNum) ? undefined : valorNum,
      
      // Novos campos
      tipoServico,
      statusPagamento: 'pendente',
      enderecoServico: tipoServico !== 'hospedagem' ? formData.enderecoServico : undefined,
      detalhesServico: tipoServico !== 'hospedagem' ? formData.detalhesServico : undefined,
      enderecoTutor: formData.enderecoTutor || undefined,
    };

    onSubmit(novahospedagem);
  };

  if (step === 1) {
    return (
      <div className="space-y-4 py-2">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white font-serif">Escolha o Tipo de Serviço</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Selecione o serviço que deseja agendar</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Card Hospedagem */}
          <button
            type="button"
            onClick={() => selectService('hospedagem')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-terracota-500 dark:hover:border-terracota-500 hover:shadow-md transition text-slate-700 dark:text-slate-300"
          >
            <div className="rounded-full p-3 bg-terracota-50 dark:bg-terracota-950/40 text-terracota-600 dark:text-terracota-400 mb-3">
              <Home size={28} />
            </div>
            <span className="font-bold text-sm font-serif">Hospedagem</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">Estadia tradicional no hotelzinho</span>
          </button>

          {/* Card Cat Sitter */}
          <button
            type="button"
            onClick={() => selectService('cat_sitter')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-terracota-500 dark:hover:border-terracota-500 hover:shadow-md transition text-slate-700 dark:text-slate-300"
          >
            <div className="rounded-full p-3 bg-mostarda-50 dark:bg-mostarda-950/40 text-mostarda-600 dark:text-mostarda-400 mb-3">
              <PawPrint size={28} />
            </div>
            <span className="font-bold text-sm font-serif">Cat Sitter</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">Cuidados e visitas na casa do tutor</span>
          </button>

          {/* Card Transporte */}
          <button
            type="button"
            onClick={() => selectService('transporte')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-terracota-500 dark:hover:border-terracota-500 hover:shadow-md transition text-slate-700 dark:text-slate-300"
          >
            <div className="rounded-full p-3 bg-ardosia-50 dark:bg-ardosia-950/40 text-ardosia-600 dark:text-ardosia-400 mb-3">
              <Car size={28} />
            </div>
            <span className="font-bold text-sm font-serif">Transporte</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">Táxi dog/cat de ida ou volta</span>
          </button>
        </div>

        <div className="flex pt-2 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const getServiceLabel = () => {
    if (tipoServico === 'hospedagem') return 'Hospedagem 🏠';
    if (tipoServico === 'cat_sitter') return 'Cat Sitter 🐾';
    return 'Transporte 🚗';
  };

  const getServicePlaceholder = () => {
    return tipoServico === 'cat_sitter' 
      ? 'Ex: 2 visitas diárias, reposição de água e sachê' 
      : 'Ex: Levar da casa do tutor até a clínica veterinária';
  };

  const totalNights = tipoServico === 'transporte' ? 1 : calculateNights(formData.dataCheckIn, formData.dataCheckOut);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Top Banner de tipo de serviço selecionado */}
      <div className="flex items-center justify-between bg-terracota-50 dark:bg-terracota-950/20 border border-terracota-100 dark:border-terracota-900/50 rounded-xl px-3 py-2">
        <span className="text-xs font-bold text-terracota-800 dark:text-terracota-400">
          Serviço: <strong className="font-serif text-sm">{getServiceLabel()}</strong>
        </span>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-terracota-600 dark:hover:text-terracota-400 transition"
        >
          <ArrowLeft size={12} /> Alterar
        </button>
      </div>

      {/* Seletor de Hóspede Existente */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
        <label className="flex text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 items-center gap-1.5">
          <Sparkles size={14} className="text-terracota-500 dark:text-terracota-400" />
          Hóspede
        </label>
        <select
          value={selectedGatoId}
          onChange={handleSelectGatoChange}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
        >
          <option value="">✨ Novo Cadastro (Digitar perfil completo)</option>
          {gatos.map((g) => (
            <option key={g.id} value={g.id}>
              🐱 {g.nomeGato} (Tutor: {g.nomeTutor})
            </option>
          ))}
        </select>
        {selectedGatoId && (
          <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Perfil preenchido a partir do cadastro central. Qualquer edição atualizará os dados fixos do felino.
          </p>
        )}
      </div>

      {/* Seção de Foto do Gato */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Foto do Gato</label>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Preview Container */}
          <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 shadow-inner flex items-center justify-center flex-shrink-0 group">
            {formData.fotoUrl ? (
              <>
                <img src={formData.fotoUrl} alt="Preview do gato" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100 shadow-md hover:bg-red-600"
                  title="Remover foto"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1">
                <Camera size={28} className="text-slate-300 dark:text-slate-600" />
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Sem foto</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor="foto-file-input"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <Upload size={14} className="text-slate-500 dark:text-slate-400" />
                {isUploading ? 'Processando...' : 'Carregar Imagem'}
              </label>
              <input
                type="file"
                id="foto-file-input"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {formData.fotoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="sm:hidden inline-flex items-center gap-1 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition"
                >
                  <X size={14} />
                  Remover
                </button>
              )}
            </div>
            
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Link2 size={14} className="text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                name="fotoUrl"
                value={formData.fotoUrl.startsWith('data:') ? '' : formData.fotoUrl}
                onChange={handleChange}
                disabled={isUploading}
                placeholder="Ou cole a URL de uma imagem da internet..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
              />
              {formData.fotoUrl.startsWith('data:') && (
                <div className="absolute right-2 top-2 flex items-center">
                  <span className="inline-flex items-center rounded-full bg-terracota-100 dark:bg-terracota-950/80 px-2 py-0.5 text-[9px] font-semibold text-terracota-800 dark:text-terracota-300">
                    Imagem local
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cadastro Básico (Gato, Tutor, Endereço do Tutor) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Gato *</label>
          <input
            type="text"
            name="nomeGato"
            value={formData.nomeGato}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            placeholder="Mia"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Tutor *</label>
          <input
            type="text"
            name="nomeTutor"
            value={formData.nomeTutor}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            placeholder="João"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Endereço do Tutor</label>
        <input
          type="text"
          name="enderecoTutor"
          value={formData.enderecoTutor}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          placeholder="Residência do tutor..."
        />
      </div>

      {/* Campos condicionais de Cat Sitter e Transporte */}
      {tipoServico !== 'hospedagem' && (
        <div className="space-y-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/10">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {tipoServico === 'transporte' ? 'Endereço de Destino *' : 'Endereço do Atendimento *'}
            </label>
            <input
              type="text"
              name="enderecoServico"
              value={formData.enderecoServico}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
              placeholder="Digite o endereço completo..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Detalhes do Serviço</label>
            <input
              type="text"
              name="detalhesServico"
              value={formData.detalhesServico}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
              placeholder={getServicePlaceholder()}
            />
          </div>
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            {tipoServico === 'transporte' ? 'Data do Serviço' : 'Início / Check-In'}
          </label>
          <input
            type="date"
            name="dataCheckIn"
            value={formData.dataCheckIn}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          />
        </div>
        {tipoServico !== 'transporte' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Término / Check-Out</label>
            <input
              type="date"
              name="dataCheckOut"
              value={formData.dataCheckOut}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center pt-5">
            <span className="text-[11px] text-slate-450 italic">Serviço de data única</span>
          </div>
        )}
      </div>

      {/* Financeiro */}
      <div className="grid grid-cols-2 gap-3 items-end bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            {tipoServico === 'hospedagem' ? 'Valor da Diária (R$)' : tipoServico === 'cat_sitter' ? 'Valor por Visita (R$)' : 'Valor Total (R$)'}
          </label>
          <input
            type="number"
            name="valorDiaria"
            min="0"
            value={formData.valorDiaria}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            placeholder="60"
          />
        </div>
        <div className="flex flex-col gap-1 items-end justify-center text-right pr-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-terracota-50 dark:bg-terracota-950/20 text-terracota-700 dark:text-terracota-400 border border-terracota-100 dark:border-terracota-900/50 px-2 py-0.5 text-[10px] font-semibold">
            {tipoServico === 'transporte' ? 'transporte' : totalNights === 1 ? '1 dia/visita' : `${totalNights} dias/visitas`}
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Total: <strong className="text-terracota-600 dark:text-terracota-400 text-sm">R$ {
              (totalNights * (parseFloat(formData.valorDiaria) || 0)).toFixed(2)
            }</strong>
          </span>
        </div>
      </div>

      {/* Perfil comportamental */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Sociabilidade</label>
          <select
            name="sociabilidade"
            value={formData.sociabilidade}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          >
            <option value="sociavel">Sociável</option>
            <option value="isolado">Isolado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Personalidade</label>
          <input
            type="text"
            name="personalidade"
            value={formData.personalidade}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            placeholder="Calmo, Medroso..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Dieta</label>
        <input
          type="text"
          name="dieta"
          value={formData.dieta}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          placeholder="Ração premium 60g 2x"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          placeholder="Manias, brincadeiras..."
          rows={2}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Medicamentos</label>
        <input
          type="text"
          name="medicamentos"
          value={formData.medicamentos}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          placeholder="Antialérgico 1x"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-terracota-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-terracota-600 transition"
        >
          Criar Serviço
        </button>
      </div>
    </form>
  );
}
