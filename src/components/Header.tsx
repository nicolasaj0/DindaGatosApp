import { useState, useEffect } from 'react';
import { Hospedagem } from '../types';
import { getLocalDateString, formatDateString } from '../utils';
import { Sun, Moon } from 'lucide-react';

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

  const hoje = getLocalDateString();

  const entradasHoje = hospedagens.filter((item) => item.dataCheckIn === hoje && item.status === 'agendado');
  const saidasHoje = hospedagens.filter((item) => item.dataCheckOut === hoje && item.status !== 'concluido');


  return (
    <header className="bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-slate-900 dark:to-indigo-950 text-white transition-all duration-300 shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex justify-between items-start w-full">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-100/80">Dinda de Gatos 🐱</p>
              <h1 className="mt-2 text-3xl font-semibold">Painel de Gerenciamento</h1>
              
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-cyan-50 shadow-inner backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{formatFullDateTime(currentDateTime)}</span>
              </div>

              <p className="mt-3 max-w-2xl text-slate-100/90 text-sm">
                Veja entradas, saídas e o status de cada hospedagem em um quadro visual.
              </p>
            </div>

            <button
              onClick={onToggleTheme}
              className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 text-cyan-50 hover:text-white shadow-inner backdrop-blur-md transition-all duration-200 flex-shrink-0"
              title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={20} className="animate-pulse text-amber-300" /> : <Moon size={20} />}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur">
              <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/80">Entradas Hoje</p>
              <strong className="mt-2 block text-3xl">{entradasHoje.length}</strong>
              {entradasHoje.slice(0, 2).map((item) => (
                <p key={item.id} className="mt-2 text-sm text-slate-100/85">
                  {item.nomeGato} — {formatDateString(item.dataCheckIn, true)}
                </p>
              ))}
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur">
              <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/80">Saídas Hoje</p>
              <strong className="mt-2 block text-3xl">{saidasHoje.length}</strong>
              {saidasHoje.slice(0, 2).map((item) => (
                <p key={item.id} className="mt-2 text-sm text-slate-100/85">
                  {item.nomeGato} — {formatDateString(item.dataCheckOut, true)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
