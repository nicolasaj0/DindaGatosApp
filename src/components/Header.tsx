import { useState, useEffect, memo } from 'react';
import { Sun, Moon, BookOpen } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header = memo(function Header({ theme, onToggleTheme }: HeaderProps) {
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
    <header className="bg-parchment-elevated border-b border-border-ledger text-ink transition-colors duration-150">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-stamp-plum">
              <BookOpen size={16} />
              <span className="text-xs font-mono font-bold uppercase tracking-widest">
                Dinda de Gatos — Caderneta de Registro
              </span>
            </div>

            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">
              Painel de Gerenciamento
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-card border border-border-ledger bg-parchment px-3 py-1 text-xs font-mono text-ink-subtle">
                <span className="h-1.5 w-1.5 rounded-stamp bg-stamp-moss inline-block" />
                <span>{formatFullDateTime(currentDateTime)}</span>
              </div>
              <span className="text-xs font-body text-ink-muted hidden sm:inline">
                Registro de entradas, estadias e controle financeiro
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-card border border-border-ledger bg-parchment-elevated hover:border-border-ledger-hover p-2 text-ink transition-colors duration-150 flex-shrink-0"
            title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={18} className="text-stamp-gold" /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
});
