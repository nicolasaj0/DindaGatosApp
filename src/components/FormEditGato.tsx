import { useState } from 'react';
import { Gato } from '../types';
import { resizeImage } from '../utils';
import { Camera, Upload, Link2, X } from 'lucide-react';

interface FormEditGatoProps {
  gato: Gato;
  onSubmit: (gato: Gato) => void;
  onCancel: () => void;
}

export function FormEditGato({ gato, onSubmit, onCancel }: FormEditGatoProps) {
  const [formData, setFormData] = useState({
    nomeGato: gato.nomeGato,
    nomeTutor: gato.nomeTutor,
    fotoUrl: gato.fotoUrl || '',
    sociabilidade: gato.perfil.sociabilidade,
    personalidade: gato.perfil.personalidade,
    dieta: gato.perfil.dieta,
    observacoes: gato.perfil.observacoes,
    medicamentos: gato.perfil.medicamentos || '',
    valorDiariaPadrao: gato.valorDiariaPadrao?.toString() || '50',
    enderecoTutor: gato.enderecoTutor || '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const valorNum = parseFloat(formData.valorDiariaPadrao);

    onSubmit({
      ...gato,
      nomeGato: formData.nomeGato,
      nomeTutor: formData.nomeTutor,
      fotoUrl: formData.fotoUrl || undefined,
      perfil: {
        sociabilidade: formData.sociabilidade,
        personalidade: formData.personalidade,
        dieta: formData.dieta,
        observacoes: formData.observacoes,
        medicamentos: formData.medicamentos || undefined,
      },
      valorDiariaPadrao: isNaN(valorNum) ? undefined : valorNum,
      enderecoTutor: formData.enderecoTutor || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-body text-ink">
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

      <div className="grid grid-cols-2 gap-3 items-end bg-parchment border border-border-ledger rounded-card p-3 font-mono">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Diária Base (R$)</label>
          <input
            type="number"
            name="valorDiariaPadrao"
            min="0"
            value={formData.valorDiariaPadrao}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-sm font-bold text-ink focus:border-border-ledger-hover outline-none"
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Sociabilidade</label>
          <select
            name="sociabilidade"
            value={formData.sociabilidade}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment-elevated px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          >
            <option value="sociavel">Sociável</option>
            <option value="isolado">Isolado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Dieta</label>
          <input
            type="text"
            name="dieta"
            value={formData.dieta}
            onChange={handleChange}
            className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
            placeholder="Ração premium..."
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          className="w-full rounded-card border border-border-ledger bg-parchment px-3 py-1.5 text-xs sm:text-sm text-ink focus:border-border-ledger-hover outline-none"
          placeholder="Manias, histórico..."
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
          placeholder="Medicamentos regulares..."
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
      </div>
    </form>
  );
}
