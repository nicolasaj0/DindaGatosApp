import { useState } from 'react';
import { Hospedagem } from '../types';
import { resizeImage, calculateNights } from '../utils';
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
    sociabilidade: initialData.perfil.sociabilidade,
    personalidade: initialData.perfil.personalidade,
    dieta: initialData.perfil.dieta,
    observacoes: initialData.perfil.observacoes,
    medicamentos: initialData.perfil.medicamentos || '',
    valorDiaria: String(initialData.valorDiaria ?? 50),
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

    if (formData.dataCheckOut < formData.dataCheckIn) {
      alert('Atenção: A data de check-out não pode ser anterior à data de check-in.');
      return;
    }

    const valorNum = parseFloat(formData.valorDiaria);

    const updated: Hospedagem = {
      ...initialData,
      nomeGato: formData.nomeGato,
      nomeTutor: formData.nomeTutor,
      fotoUrl: formData.fotoUrl || undefined,
      dataCheckIn: formData.dataCheckIn,
      dataCheckOut: formData.dataCheckOut,
      perfil: {
        sociabilidade: formData.sociabilidade as 'sociavel' | 'isolado',
        personalidade: formData.personalidade,
        dieta: formData.dieta,
        observacoes: formData.observacoes,
        medicamentos: formData.medicamentos || undefined,
      },
      valorDiaria: isNaN(valorNum) ? undefined : valorNum,
    };

    onSubmit(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Seção de Foto do Gato */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Foto do Gato</label>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Preview Container */}
          <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner flex items-center justify-center flex-shrink-0 group">
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
                htmlFor="foto-edit-file-input"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <Upload size={14} className="text-slate-500 dark:text-slate-400" />
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Check-In</label>
          <input
            type="date"
            name="dataCheckIn"
            value={formData.dataCheckIn}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Check-Out</label>
          <input
            type="date"
            name="dataCheckOut"
            value={formData.dataCheckOut}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Valor da Diária (R$)</label>
          <input
            type="number"
            name="valorDiaria"
            min="0"
            value={formData.valorDiaria}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-terracota-500 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            placeholder="50"
          />
        </div>
        <div className="flex flex-col gap-1 items-end justify-center text-right pr-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-terracota-50 dark:bg-terracota-950/20 text-terracota-700 dark:text-terracota-400 border border-terracota-100 dark:border-terracota-900/50 px-2 py-0.5 text-[10px] font-semibold">
            {calculateNights(formData.dataCheckIn, formData.dataCheckOut) === 1 ? '1 diária 🌙' : `${calculateNights(formData.dataCheckIn, formData.dataCheckOut)} diárias 🌙`}
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Total: <strong className="text-terracota-600 dark:text-terracota-400 text-sm">R$ {
              (calculateNights(formData.dataCheckIn, formData.dataCheckOut) * (parseFloat(formData.valorDiaria) || 0)).toFixed(2)
            }</strong>
          </span>
        </div>
      </div>

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
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-terracota-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-terracota-600 transition"
        >
          Atualizar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 transition"
        >
          Deletar
        </button>
      </div>
    </form>
  );
}
