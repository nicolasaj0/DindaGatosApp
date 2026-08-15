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
    dataCheckOut: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return getLocalDateString(tomorrow);
    })(),
    sociabilidade: 'sociavel' as 'sociavel' | 'isolado',
    personalidade: '',
    dieta: '',
    observacoes: '',
    medicamentos: '',
    valorDiaria: '60',
    enderecoTutor: '',
    enderecoServico: '',
    detalhesServico: '',
    incluirTransporte: false,
    valorTransporte: '',
    detalhesTransporte: '',
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

  const selectService = (service: TipoServico) => {
    setTipoServico(service);
    if (service === 'cat_sitter') {
      setFormData((prev) => ({ ...prev, valorDiaria: '45' }));
    } else if (service === 'transporte') {
      setFormData((prev) => ({ ...prev, valorDiaria: '35', dataCheckOut: prev.dataCheckIn }));
    } else {
      setFormData((prev) => ({ ...prev, valorDiaria: '60' }));
    }
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? target.checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === 'dataCheckIn' && tipoServico === 'transporte') {
        updated.dataCheckOut = value;
      }
      if (name === 'incluirTransporte' && !target.checked) {
        updated.valorTransporte = '';
        updated.detalhesTransporte = '';
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
      alert('O endereço do serviço é obrigatório.');
      return;
    }

    if (tipoServico !== 'transporte' && formData.incluirTransporte) {
      const vTransp = parseFloat(formData.valorTransporte);
      if (isNaN(vTransp) || vTransp <= 0) {
        alert('Por favor, informe o valor do transporte adicional.');
        return;
      }
    }

    const valorNum = parseFloat(formData.valorDiaria);
    const finalCheckOut = tipoServico === 'transporte' ? formData.dataCheckIn : formData.dataCheckOut;

    let transporteAdicional = undefined;
    if (tipoServico !== 'transporte' && formData.incluirTransporte) {
      const vTransp = parseFloat(formData.valorTransporte);
      transporteAdicional = {
        valor: isNaN(vTransp) ? 0 : vTransp,
        detalhes: formData.detalhesTransporte.trim() || undefined,
      };
    }

    const novahospedagem: Hospedagem = {
      id: crypto.randomUUID(),
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
      transporteAdicional,
      valorPago: 0,
      statusPagamento: 'pendente',
      historicoPagamentos: [],
      tipoServico,
      enderecoServico: tipoServico !== 'hospedagem' ? formData.enderecoServico : undefined,
      detalhesServico: tipoServico !== 'hospedagem' ? formData.detalhesServico : undefined,
      enderecoTutor: formData.enderecoTutor || undefined,
    };

    onSubmit(novahospedagem);
  };

  if (step === 1) {
    return (
      <div className="space-y-4 py-2 font-body text-ink">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-bold font-display text-ink">Escolha o Tipo de Serviço</h3>
          <p className="text-xs text-ink-subtle mt-0.5">Selecione o serviço que deseja registrar na caderneta</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Card Hospedagem */}
          <button
            type="button"
            onClick={() => selectService('hospedagem')}
            className="flex flex-col items-center justify-center p-4 rounded-card border border-border-ledger bg-parchment hover:border-border-ledger-hover transition-colors text-ink"
          >
            <div className="p-2.5 rounded-card border border-border-ledger bg-parchment-elevated text-stamp-plum mb-2.5">
              <Home size={24} />
            </div>
            <span className="font-bold text-sm font-display">Hospedagem</span>
            <span className="text-[10px] text-ink-subtle text-center mt-0.5">Estadia no hotelzinho</span>
          </button>

          {/* Card Cat Sitter */}
          <button
            type="button"
            onClick={() => selectService('cat_sitter')}
            className="flex flex-col items-center justify-center p-4 rounded-card border border-border-ledger bg-parchment hover:border-border-ledger-hover transition-colors text-ink"
          >
            <div className="p-2.5 rounded-card border border-border-ledger bg-parchment-elevated text-stamp-gold mb-2.5">
              <PawPrint size={24} />
            </div>
            <span className="font-bold text-sm font-display">Cat Sitter</span>
            <span className="text-[10px] text-ink-subtle text-center mt-0.5">Visitas na casa do tutor</span>
          </button>

          {/* Card Transporte */}
          <button
            type="button"
            onClick={() => selectService('transporte')}
            className="flex flex-col items-center justify-center p-4 rounded-card border border-border-ledger bg-parchment hover:border-border-ledger-hover transition-colors text-ink"
          >
            <div className="p-2.5 rounded-card border border-border-ledger bg-parchment-elevated text-ink-subtle mb-2.5">
              <Car size={24} />
            </div>
            <span className="font-bold text-sm font-display">Transporte</span>
            <span className="text-[10px] text-ink-subtle text-center mt-0.5">Deslocamento de ida ou volta</span>
          </button>
        </div>

        <div className="flex pt-2 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 rounded-card border border-border-ledger bg-parchment px-3 py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const getServiceLabel = () => {
    if (tipoServico === 'hospedagem') return 'Hospedagem';
    if (tipoServico === 'cat_sitter') return 'Cat Sitter';
    return 'Transporte';
  };

  const getServicePlaceholder = () => {
    return tipoServico === 'cat_sitter' 
      ? 'Ex: 2 visitas diárias, reposição de água e sachê' 
      : 'Ex: Levar da casa do tutor até a clínica veterinária';
  };

  const totalNights = tipoServico === 'transporte' ? 1 : calculateNights(formData.dataCheckIn, formData.dataCheckOut);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-body text-ink">
      {/* Top Banner de tipo de serviço selecionado */}
      <div className="flex items-center justify-between bg-parchment border border-border-ledger rounded-card px-3 py-2">
        <span className="text-xs text-ink-subtle">
          Serviço: <strong className="font-display text-sm text-ink">{getServiceLabel()}</strong>
        </span>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-ink-subtle hover:text-ink transition-colors"
        >
          <ArrowLeft size={12} /> Alterar
        </button>
      </div>

      {/* Seletor de Hóspede Existente */}
      <div className="rounded-card border border-border-ledger bg-parchment p-3.5">
        <label className="flex text-xs font-mono font-bold uppercase tracking-wider text-ink-muted mb-1.5 items-center gap-1.5">
          <Sparkles size={13} />
          Hóspede
        </label>
        <select
          value={selectedGatoId}
          onChange={handleSelectGatoChange}
          className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
        >
          <option value="">✨ Novo Cadastro (Preencher ficha)</option>
          {gatos.map((g) => (
            <option key={g.id} value={g.id}>
              🐱 {g.nomeGato} (Tutor: {g.nomeTutor})
            </option>
          ))}
        </select>
      </div>

      {/* Seção de Foto do Gato */}
      <div className="rounded-card border border-border-ledger bg-parchment p-3.5">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">Foto de Identificação</label>
        <div className="flex flex-col sm:flex-row gap-3.5 items-center">
          {/* Preview Container */}
          <div className="relative h-20 w-20 overflow-hidden rounded-card border border-border-ledger bg-parchment-elevated flex items-center justify-center flex-shrink-0 group">
            {formData.fotoUrl ? (
              <>
                <img src={formData.fotoUrl} alt="Preview do gato" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="absolute right-1 top-1 rounded-card bg-stamp-wine p-1 text-parchment transition hover:opacity-90"
                  title="Remover foto"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="text-ink-muted flex flex-col items-center gap-1">
                <Camera size={22} />
                <span className="text-[9px] font-mono">Sem foto</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor="foto-file-input"
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-card bg-parchment-elevated border border-border-ledger px-3 py-1.5 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
              >
                <Upload size={13} />
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
            </div>
            
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-ink-muted">
                <Link2 size={13} />
              </div>
              <input
                type="text"
                name="fotoUrl"
                value={formData.fotoUrl.startsWith('data:') ? '' : formData.fotoUrl}
                onChange={handleChange}
                disabled={isUploading}
                placeholder="Ou cole a URL da imagem..."
                className="w-full rounded-card border border-border-ledger bg-parchment-elevated pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-border-ledger-hover outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cadastro Básico */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Gato *</label>
          <input
            type="text"
            name="nomeGato"
            value={formData.nomeGato}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
            placeholder="Nome do felino"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Tutor *</label>
          <input
            type="text"
            name="nomeTutor"
            value={formData.nomeTutor}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
            placeholder="Nome do tutor"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Endereço do Tutor</label>
        <input
          type="text"
          name="enderecoTutor"
          value={formData.enderecoTutor}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          placeholder="Residência do tutor..."
        />
      </div>

      {/* Campos condicionais de Cat Sitter e Transporte */}
      {tipoServico !== 'hospedagem' && (
        <div className="space-y-2.5 p-3 rounded-card border border-border-ledger bg-parchment">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
              {tipoServico === 'transporte' ? 'Endereço de Destino *' : 'Endereço do Atendimento *'}
            </label>
            <input
              type="text"
              name="enderecoServico"
              value={formData.enderecoServico}
              onChange={handleChange}
              className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
              placeholder="Digite o endereço completo..."
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Detalhes do Serviço</label>
            <input
              type="text"
              name="detalhesServico"
              value={formData.detalhesServico}
              onChange={handleChange}
              className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
              placeholder={getServicePlaceholder()}
            />
          </div>
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            {tipoServico === 'transporte' ? 'Data do Serviço' : 'Início / Check-In'}
          </label>
          <input
            type="date"
            name="dataCheckIn"
            value={formData.dataCheckIn}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm font-mono text-ink focus:border-border-ledger-hover outline-none"
          />
        </div>
        {tipoServico !== 'transporte' ? (
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Término / Check-Out</label>
            <input
              type="date"
              name="dataCheckOut"
              value={formData.dataCheckOut}
              onChange={handleChange}
              className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm font-mono text-ink focus:border-border-ledger-hover outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center pt-4">
            <span className="text-[11px] font-mono text-ink-muted italic">Data única</span>
          </div>
        )}
      </div>

      {/* Transporte Adicional */}
      {tipoServico !== 'transporte' && (
        <div className="rounded-card border border-border-ledger bg-parchment p-3 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
            <input
              type="checkbox"
              name="incluirTransporte"
              checked={formData.incluirTransporte}
              onChange={handleChange}
              className="h-3.5 w-3.5 rounded-card border-border-ledger text-stamp-plum focus:ring-0"
            />
            <span>{tipoServico === 'hospedagem' ? 'Incluir transporte adicional?' : 'Incluir deslocamento da cuidadora?'}</span>
          </label>

          {formData.incluirTransporte && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-border-ledger">
              <div>
                <label className="block font-mono text-[9px] font-bold uppercase tracking-wider text-ink-muted mb-1">Valor Transporte (R$) *</label>
                <input
                  type="number"
                  name="valorTransporte"
                  min="0"
                  value={formData.valorTransporte}
                  onChange={handleChange}
                  placeholder="Ex: 30"
                  className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs font-mono text-ink focus:border-border-ledger-hover outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] font-bold uppercase tracking-wider text-ink-muted mb-1">Detalhes (Opcional)</label>
                <input
                  type="text"
                  name="detalhesTransporte"
                  value={formData.detalhesTransporte}
                  onChange={handleChange}
                  placeholder="Instruções de busca..."
                  className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs text-ink focus:border-border-ledger-hover outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financeiro */}
      <div className="grid grid-cols-2 gap-3 items-end bg-parchment border border-border-ledger rounded-card p-3 font-mono">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            {tipoServico === 'hospedagem' ? 'Diária (R$)' : tipoServico === 'cat_sitter' ? 'Por Visita (R$)' : 'Valor (R$)'}
          </label>
          <input
            type="number"
            name="valorDiaria"
            min="0"
            value={formData.valorDiaria}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-sm font-bold text-ink focus:border-border-ledger-hover outline-none"
            placeholder="60"
          />
        </div>
        <div className="flex flex-col gap-0.5 items-end justify-center text-right pr-1 text-xs">
          <span className="text-ink-subtle">
            {tipoServico === 'transporte' ? 'transporte' : totalNights === 1 ? '1 diária' : `${totalNights} diárias`}
          </span>
          <span className="font-bold text-ink text-sm">
            Total: R$ {
              ((totalNights * (parseFloat(formData.valorDiaria) || 0)) + (formData.incluirTransporte ? (parseFloat(formData.valorTransporte) || 0) : 0)).toFixed(2)
            }
          </span>
        </div>
      </div>

      {/* Perfil comportamental */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Sociabilidade</label>
          <select
            name="sociabilidade"
            value={formData.sociabilidade}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          >
            <option value="sociavel">Sociável</option>
            <option value="isolado">Isolado</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Personalidade</label>
          <input
            type="text"
            name="personalidade"
            value={formData.personalidade}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
            placeholder="Calmo, curioso..."
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Dieta</label>
        <input
          type="text"
          name="dieta"
          value={formData.dieta}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          placeholder="Ração seca + sachê..."
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          placeholder="Cuidados específicos, rotina..."
          rows={2}
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Medicamentos</label>
        <input
          type="text"
          name="medicamentos"
          value={formData.medicamentos}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          placeholder="Nome do remédio e horários..."
        />
      </div>

      <div className="flex gap-2.5 pt-2 border-t border-border-ledger">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-card border border-border-ledger bg-parchment py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 rounded-card bg-stamp-plum text-parchment border border-stamp-plum py-2 text-xs font-body font-semibold hover:opacity-90 transition-opacity"
        >
          Criar Registro
        </button>
      </div>
    </form>
  );
}
