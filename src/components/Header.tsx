import { useState, useEffect } from 'react';
import { Hospedagem } from '../types';
import { getLocalDateString, formatDateString } from '../utils';
import { Sun, Moon, PawPrint } from 'lucide-react';

interface HeaderProps {
  hospedagens: Hospedagem[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ hospedagens, theme, onToggleTheme }: HeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFullDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    const timeStr = date.toLocaleTimeString('pt-BR');
    return `${capitalized} • ${timeStr}`;
  };

  return (
    <header className="bg-gradient-to-br from-terracota-600 via-terracota-500 to-mostarda-500 dark:from-warmBg-950 dark:via-warmBg-900 dark:to-terracota-950 text-white relative overflow-hidden transition-all duration-300 shadow-md">
      {/* Texture Paw Prints */}
      <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-white opacity-[0.06] pointer-events-none hidden lg:block">
        <PawPrint size={240} />
      </div>
      <div className="absolute right-60 top-0 -translate-y-12 text-white opacity-[0.04] pointer-events-none hidden lg:block">
        <PawPrint size={140} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 relative z-10">
        <div className="flex justify-between items-start w-full">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-terracota-50/90 flex items-center gap-1.5">
              <PawPrint size={16} className="text-mostarda-200 animate-bounce" />
              <span>Dinda de Gatos</span>
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">Painel de Gerenciamento</h1>
            
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-mostarda-50 shadow-inner backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{formatFullDateTime(currentDateTime)}</span>
            </div>

            <p className="mt-3 max-w-2xl text-warmBg-50/95 text-sm">
              Gerencie entradas, saídas e o status de cada serviço prestado.
            </p>
          </div>

          <button
            onClick={onToggleTheme}
            className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 text-mostarda-50 hover:text-white shadow-inner backdrop-blur-md transition-all duration-200 flex-shrink-0"
            title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={20} className="animate-pulse text-amber-350" /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
