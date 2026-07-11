import { HospedagemStatus, Sociabilidade, TipoServico } from './types';

export function getStatusLabel(status: HospedagemStatus) {
  switch (status) {
    case 'agendado':
      return 'Agendados';
    case 'hospedado':
      return 'Em Andamento';
    case 'saindo_hoje':
      return 'Finalizando Hoje';
    case 'concluido':
      return 'Concluídos';
    default:
      return 'Status';
  }
}

export function labelStatus(status: HospedagemStatus, tipo?: TipoServico): string {
  const labels: Record<TipoServico, Record<HospedagemStatus, string>> = {
    hospedagem:  { agendado: 'Agendado', hospedado: 'Hospedado', saindo_hoje: 'Saindo Hoje', concluido: 'Concluído' },
    cat_sitter:  { agendado: 'Agendado', hospedado: 'Em Atendimento', saindo_hoje: 'Última Visita Hoje', concluido: 'Concluído' },
    transporte:  { agendado: 'Agendado', hospedado: 'Em Transporte', saindo_hoje: 'Transporte Hoje', concluido: 'Concluído' },
  };
  const serviceType = tipo || 'hospedagem';
  return labels[serviceType]?.[status] || labels.hospedagem[status];
}

export function getStatusTagColor(sociabilidade: Sociabilidade) {
  return sociabilidade === 'sociavel'
    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400';
}

/**
 * Resizes and compresses an image file to a max width/height of 256px
 * and returns it as a Base64 JPEG string (quality 0.7).
 */
export function resizeImage(file: File, maxW = 256, maxH = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas 2d context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as jpeg with 0.7 quality to keep size under ~15KB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateString(dateStr: string, includeYear = false): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const parts1 = checkIn.split('-').map(Number);
  const parts2 = checkOut.split('-').map(Number);
  if (parts1.length !== 3 || parts2.length !== 3) return 0;
  
  const d1 = new Date(parts1[0], parts1[1] - 1, parts1[2]);
  const d2 = new Date(parts2[0], parts2[1] - 1, parts2[2]);
  
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime <= 0) return 0;
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getLocalTimestampString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


