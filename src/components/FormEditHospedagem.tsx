import { useState } from 'react';
import { Hospedagem, HospedagemStatus } from '../types';
import { resizeImage, calculateNights, formatCurrency, labelStatus } from '../utils';
import { Camera, Upload, Link2, X } from 'lucide-react';

interface FormEditHospedagemProps {
  hospedagem: Hospedagem;
  onSubmit: (hospedagem: Hospedagem) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function FormEditHospedagem({ 
  hospedagem: initialData, 
  onSubmit, 
  onCancel, 
  onDelete 
}: FormEditHospedagemProps) {
  const [formData, setFormData] = useState({
    nomeGato: initialData.nomeGato,
    nomeTutor: initialData.nomeTutor,
    fotoUrl: initialData.fotoUrl || '',
    dataCheckIn: initialData.dataCheckIn,
    dataCheckOut: initialData.dataCheckOut,
    status: initialData.status,
    sociabilidade: initialData.perfil.sociabilidade,
    personalidade: initialData.perfil.personalidade,
    dieta: initialData.perfil.dieta,
    observacoes: initialData.perfil.observacoes,
    medicamentos: initialData.perfil.medicamentos || '',
    valorDiaria: String(initialData.valorDiaria ?? 60),
    enderecoTutor: initialData.enderecoTutor || '',
    enderecoServico: initialData.enderecoServico || '',
    detalhesServico: initialData.detalhesServico || '',
    incluirTransporte: !!initialData.transporteAdicional,
    valorTransporte: String(initialData.transporteAdicional?.valor ?? ''),
    detalhesTransporte: initialData.transporteAdicional?.detalhes || '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? target.checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
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

    if (initialData.tipoServico !== 'transporte' && formData.dataCheckOut < formData.dataCheckIn) {
      alert('Atenção: A data de término/check-out não pode ser anterior à data de início/check-in.');
      return;
    }

    if (initialData.tipoServico !== 'hospedagem' && !formData.enderecoServico.trim()) {
      alert('O endereço do serviço é obrigatório.');
      return;
    }

    if (initialData.tipoServico !== 'transporte' && formData.incluirTransporte) {
      const vTransp = parseFloat(formData.valorTransporte);
      if (isNaN(vTransp) || vTransp <= 0) {
        alert('Por favor, informe o valor do transporte adicional.');
        return;
      }
    }

    const valorNum = parseFloat(formData.valorDiaria);
    const finalCheckOut = initialData.tipoServico === 'transporte' ? formData.dataCheckIn : formData.dataCheckOut;

    let transporteAdicional = undefined;
    if (initialData.tipoServico !== 'transporte' && formData.incluirTransporte) {
      const vTransp = parseFloat(formData.valorTransporte);
      transporteAdicional = {
        valor: isNaN(vTransp) ? 0 : vTransp,
        detalhes: formData.detalhesTransporte.trim() || undefined,
      };
    }

    const updated: Hospedagem = {
      ...initialData,
      nomeGato: formData.nomeGato,
      nomeTutor: formData.nomeTutor,
      fotoUrl: formData.fotoUrl || undefined,
      dataCheckIn: formData.dataCheckIn,
      dataCheckOut: finalCheckOut,
      status: formData.status as HospedagemStatus,
      perfil: {
        sociabilidade: formData.sociabilidade as 'sociavel' | 'isolado',
        personalidade: formData.personalidade,
        dieta: formData.dieta,
        observacoes: formData.observacoes,
        medicamentos: formData.medicamentos || undefined,
      },
      valorDiaria: isNaN(valorNum) ? undefined : valorNum,
      transporteAdicional,
      enderecoServico: initialData.tipoServico !== 'hospedagem' ? formData.enderecoServico : undefined,
      detalhesServico: initialData.tipoServico !== 'hospedagem' ? formData.detalhesServico : undefined,
      enderecoTutor: formData.enderecoTutor || undefined,
    };

    onSubmit(updated);
  };

  const getServiceLabel = () => {
    if (initialData.tipoServico === 'hospedagem') return 'Hospedagem';
    if (initialData.tipoServico === 'cat_sitter') return 'Cat Sitter';
    return 'Transporte';
  };

  const totalNights = initialData.tipoServico === 'transporte' ? 1 : calculateNights(formData.dataCheckIn, formData.dataCheckOut);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-body text-ink">
      {/* Banner Informativo do Tipo de Serviço */}
      <div className="bg-parchment border border-border-ledger rounded-card px-3 py-2 text-center text-xs">
        Serviço em Edição: <span className="font-display text-sm font-bold text-ink">{getServiceLabel()}</span>
      </div>

      {/* Situação / Status Atual */}
      <div className="rounded-card border border-border-ledger bg-parchment p-3">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
          Situação / Status do Atendimento
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs sm:text-sm font-medium text-ink focus:border-border-ledger-hover outline-none"
        >
          <option value="agendado">Agendado</option>
          <option value="hospedado">{labelStatus('hospedado', initialData.tipoServico)} (Em Andamento)</option>
          <option value="saindo_hoje">{labelStatus('saindo_hoje', initialData.tipoServico)} (Finalizando Hoje)</option>
          <option value="concluido">Concluído</option>
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
                htmlFor="foto-edit-file-input"
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-card bg-parchment-elevated border border-border-ledger px-3 py-1.5 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
              >
                <Upload size={13} />
                {isUploading ? 'Processando...' : 'Alterar Imagem'}
              </label>
              <input
                type="file"
                id="foto-edit-file-input"
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

      {/* Dados Principais */}
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

      {/* Condicionais de Cat Sitter e Transporte */}
      {initialData.tipoServico !== 'hospedagem' && (
        <div className="space-y-2.5 p-3 rounded-card border border-border-ledger bg-parchment">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
              {initialData.tipoServico === 'transporte' ? 'Endereço de Destino *' : 'Endereço do Atendimento *'}
            </label>
            <input
              type="text"
              name="enderecoServico"
              value={formData.enderecoServico}
              onChange={handleChange}
              className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
              placeholder="Endereço do serviço..."
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
              placeholder="Ex: visitas por dia, horários..."
            />
          </div>
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            {initialData.tipoServico === 'transporte' ? 'Data do Serviço' : 'Início / Check-In'}
          </label>
          <input
            type="date"
            name="dataCheckIn"
            value={formData.dataCheckIn}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm font-mono text-ink focus:border-border-ledger-hover outline-none"
          />
        </div>
        {initialData.tipoServico !== 'transporte' ? (
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
      {initialData.tipoServico !== 'transporte' && (
        <div className="rounded-card border border-border-ledger bg-parchment p-3 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
            <input
              type="checkbox"
              name="incluirTransporte"
              checked={formData.incluirTransporte}
              onChange={handleChange}
              className="h-3.5 w-3.5 rounded-card border-border-ledger text-stamp-plum focus:ring-0"
            />
            <span>{initialData.tipoServico === 'hospedagem' ? 'Incluir transporte adicional?' : 'Incluir deslocamento da cuidadora?'}</span>
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

      {/* Valor */}
      <div className="grid grid-cols-2 gap-3 items-end bg-parchment border border-border-ledger rounded-card p-3 font-mono">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            {initialData.tipoServico === 'hospedagem' ? 'Diária (R$)' : initialData.tipoServico === 'cat_sitter' ? 'Por Visita (R$)' : 'Valor (R$)'}
          </label>
          <input
            type="number"
            name="valorDiaria"
            min="0"
            value={formData.valorDiaria}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-sm font-bold text-ink focus:border-border-ledger-hover outline-none"
            placeholder="50"
          />
        </div>
        <div className="flex flex-col gap-0.5 items-end justify-center text-right pr-1 text-xs">
          <span className="text-ink-subtle">
            {initialData.tipoServico === 'transporte' ? 'transporte' : totalNights === 1 ? '1 diária' : `${totalNights} diárias`}
          </span>
          <span className="font-bold text-ink text-sm">
            Total: {
              formatCurrency((totalNights * (parseFloat(formData.valorDiaria) || 0)) + (formData.incluirTransporte ? (parseFloat(formData.valorTransporte) || 0) : 0))
            }
          </span>
        </div>
      </div>

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
          placeholder="Ração premium 60g 2x"
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          placeholder="Manias, brincadeiras..."
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
          placeholder="Antialérgico 1x"
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
          Salvar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 rounded-card border border-stamp-wine text-stamp-wine py-2 text-xs font-body font-semibold hover:bg-stamp-wine hover:text-parchment transition-colors"
        >
          Deletar
        </button>
      </div>
    </form>
  );
}
