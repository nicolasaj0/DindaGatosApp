import { useState, useMemo } from 'react';
import { Estadia, Gato, TipoServico } from '../types';
import { calculateEstadiaTotals } from '../utils';
import { Cat, DollarSign, Calendar, TrendingUp, Award, Clock, Sparkles } from 'lucide-react';

interface RelatoriosViewProps {
  estadias: Estadia[];
  gatos: Gato[];
}

export function RelatoriosView({ estadias, gatos }: RelatoriosViewProps) {
  const [sortBy, setSortBy] = useState<'spent' | 'nights'>('spent');
  const [reportServiceFilter, setReportServiceFilter] = useState<'todos' | TipoServico>('todos');

  // Parse YYYY-MM-DD to local Date object
  const parseLocalDate = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // Get current calendar week range (Monday to Sunday)
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);
    const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday + 6);

    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  // Helper to extract stay target values based on active report service filter
  const getStayReportValues = (e: Estadia, filter: 'todos' | TipoServico) => {
    const totals = calculateEstadiaTotals(e);
    const tipo = e.tipoServico || 'hospedagem';

    let targetValue = 0;
    let isRelevant = false;

    if (filter === 'todos') {
      targetValue = totals.valorTotal;
      isRelevant = true;
    } else if (filter === 'transporte') {
      if (tipo === 'transporte') {
        targetValue = totals.valorTotal;
        isRelevant = true;
      } else if (totals.valorTransporte > 0) {
        targetValue = totals.valorTransporte;
        isRelevant = true;
      }
    } else if (filter === tipo) {
      targetValue = totals.valorServico;
      isRelevant = true;
    }

    if (!isRelevant) {
      return { isRelevant: false, targetValue: 0, paidPortion: 0, unpaidPortion: 0, nights: 0 };
    }

    const paidTotal = e.valorPago || 0;
    const ratio = totals.valorTotal > 0 ? Math.min(1, paidTotal / totals.valorTotal) : 1;
    const paidPortion = targetValue * ratio;
    const unpaidPortion = targetValue * (1 - ratio);

    return {
      isRelevant: true,
      targetValue,
      paidPortion,
      unpaidPortion,
      nights: totals.nights,
    };
  };

  // 1. Calculate Period Statistics
  const periodStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const { monday, sunday } = getWeekRange();

    const week = { recebido: 0, aReceber: 0, projected: 0, nights: 0, staysCount: 0 };
    const month = { recebido: 0, aReceber: 0, projected: 0, nights: 0, staysCount: 0 };
    const year = { recebido: 0, aReceber: 0, projected: 0, nights: 0, staysCount: 0 };

    estadias.forEach((e) => {
      const rep = getStayReportValues(e, reportServiceFilter);
      if (!rep.isRelevant) return;

      const checkInDate = parseLocalDate(e.dataCheckIn);
      const isConcluido = e.status === 'concluido';

      // Check if current calendar week
      const isThisWeek = checkInDate >= monday && checkInDate <= sunday;
      if (isThisWeek) {
        week.nights += rep.nights;
        week.staysCount += 1;
        week.recebido += rep.paidPortion;
        if (isConcluido) {
          week.aReceber += rep.unpaidPortion;
        } else {
          week.projected += rep.unpaidPortion;
        }
      }

      // Check if current calendar month
      const isThisMonth = checkInDate.getFullYear() === currentYear && checkInDate.getMonth() === currentMonth;
      if (isThisMonth) {
        month.nights += rep.nights;
        month.staysCount += 1;
        month.recebido += rep.paidPortion;
        if (isConcluido) {
          month.aReceber += rep.unpaidPortion;
        } else {
          month.projected += rep.unpaidPortion;
        }
      }

      // Check if current calendar year
      const isThisYear = checkInDate.getFullYear() === currentYear;
      if (isThisYear) {
        year.nights += rep.nights;
        year.staysCount += 1;
        year.recebido += rep.paidPortion;
        if (isConcluido) {
          year.aReceber += rep.unpaidPortion;
        } else {
          year.projected += rep.unpaidPortion;
        }
      }
    });

    return { week, month, year };
  }, [estadias, reportServiceFilter]);

  // 2. Calculate Feline Guest Analytics
  const catAnalytics = useMemo(() => {
    const catsData = gatos.map((g) => {
      const catStays = estadias.filter((e) => e.gatoId === g.id);

      let totalNights = 0;
      let totalSpent = 0;
      let relevantStaysCount = 0;

      catStays.forEach((e) => {
        const rep = getStayReportValues(e, reportServiceFilter);
        if (rep.isRelevant) {
          totalNights += rep.nights;
          totalSpent += rep.targetValue;
          relevantStaysCount += 1;
        }
      });

      return {
        ...g,
        nights: totalNights,
        spent: totalSpent,
        staysCount: relevantStaysCount,
      };
    });

    const activeCats = catsData.filter((c) => c.nights > 0 || c.spent > 0);

    return { catsData, activeCats };
  }, [gatos, estadias, reportServiceFilter]);

  // 3. Highlight Metrics (KPIs)
  const highlights = useMemo(() => {
    const { catsData } = catAnalytics;
    if (catsData.length === 0) return null;

    let vipCat = catsData[0];
    let topEarner = catsData[0];
    let totalNightsAll = 0;
    let totalSpentAll = 0;

    catsData.forEach((c) => {
      totalNightsAll += c.nights;
      totalSpentAll += c.spent;
      if (c.nights > vipCat.nights) {
        vipCat = c;
      }
      if (c.spent > topEarner.spent) {
        topEarner = c;
      }
    });

    const averageNights = catsData.length > 0 ? totalNightsAll / catsData.length : 0;

    return {
      vipCat: vipCat.nights > 0 ? vipCat : null,
      topEarner: topEarner.spent > 0 ? topEarner : null,
      totalSpentAll,
      totalNightsAll,
      averageNights,
    };
  }, [catAnalytics]);

  // Sorted list for chart rendering
  const sortedCats = useMemo(() => {
    const list = [...catAnalytics.activeCats];
    if (sortBy === 'spent') {
      return list.sort((a, b) => b.spent - a.spent);
    } else {
      return list.sort((a, b) => b.nights - a.nights);
    }
  }, [catAnalytics.activeCats, sortBy]);

  // Max bounds for normalization of bars length
  const maxValues = useMemo(() => {
    const { activeCats } = catAnalytics;
    if (activeCats.length === 0) return { spent: 1, nights: 1 };

    return {
      spent: Math.max(...activeCats.map((c) => c.spent), 1),
      nights: Math.max(...activeCats.map((c) => c.nights), 1),
    };
  }, [catAnalytics.activeCats]);

  return (
    <div className="space-y-5 font-body text-ink">
      {/* Filtro por Tipo de Serviço em Relatórios */}
      <div className="flex flex-wrap items-center gap-2 bg-parchment-elevated border border-border-ledger rounded-card p-3.5 shadow-sm transition-colors duration-150">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted mr-1 flex items-center gap-1">
          Serviço do Relatório:
        </span>
        {[
          { id: 'todos', label: 'Todos os Serviços' },
          { id: 'hospedagem', label: 'Hospedagem' },
          { id: 'cat_sitter', label: 'Cat Sitter' },
          { id: 'transporte', label: 'Transporte' },
        ].map((btn) => {
          const isSelected = reportServiceFilter === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setReportServiceFilter(btn.id as any)}
              className={`rounded-card px-2.5 py-1 text-xs font-body border transition-colors ${
                isSelected
                  ? 'bg-stamp-plum text-parchment border-stamp-plum font-semibold'
                  : 'bg-parchment text-ink-subtle border-border-ledger hover:border-border-ledger-hover hover:text-ink'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* 1. KPIs / Destaques Gerais */}
      {highlights && (
        <div className="grid gap-3 md:grid-cols-3">
          {/* Card Destaque 1: Faturamento Geral */}
          <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex items-center gap-3.5 transition-colors duration-150">
            <div className="rounded-card border border-border-ledger bg-parchment p-2.5 text-stamp-moss">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Receita Total Gerada</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-ink mt-0.5">R$ {highlights.totalSpentAll.toFixed(0)}</p>
              <p className="text-[11px] font-mono text-ink-subtle mt-0.5">{highlights.totalNightsAll} diárias registradas</p>
            </div>
          </div>

          {/* Card Destaque 2: Gato VIP */}
          <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex items-center gap-3.5 transition-colors duration-150">
            <div className="rounded-card border border-border-ledger bg-parchment p-2.5 text-stamp-plum">
              <Award size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Mais Frequente</p>
              {highlights.vipCat ? (
                <>
                  <p className="text-lg font-bold font-display text-ink mt-0.5 truncate">{highlights.vipCat.nomeGato}</p>
                  <p className="text-xs font-mono text-ink-subtle mt-0.5 truncate">
                    {highlights.vipCat.nights} diárias • Tutor: {highlights.vipCat.nomeTutor}
                  </p>
                </>
              ) : (
                <p className="text-xs font-body text-ink-muted mt-1">Nenhum registro</p>
              )}
            </div>
          </div>

          {/* Card Destaque 3: Mais Rentável */}
          <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex items-center gap-3.5 transition-colors duration-150">
            <div className="rounded-card border border-border-ledger bg-parchment p-2.5 text-stamp-gold">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Maior Valor Acumulado</p>
              {highlights.topEarner ? (
                <>
                  <p className="text-lg font-bold font-display text-ink mt-0.5 truncate">{highlights.topEarner.nomeGato}</p>
                  <p className="text-xs font-mono text-ink-subtle mt-0.5 truncate">
                    R$ {highlights.topEarner.spent.toFixed(0)} • Tutor: {highlights.topEarner.nomeTutor}
                  </p>
                </>
              ) : (
                <p className="text-xs font-body text-ink-muted mt-1">Nenhum registro</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Overview Períodos (Semanal, Mensal, Anual) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Semanal */}
        <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex flex-col justify-between transition-colors duration-150">
          <div>
            <div className="flex items-center justify-between border-b border-border-ledger pb-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Ganhos da Semana</p>
              <Calendar size={13} className="text-ink-muted" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
              R$ {(periodStats.week.recebido + periodStats.week.aReceber).toFixed(0)}
            </p>

            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stamp-moss">
                <span>Recebido:</span>
                <span className="font-bold">R$ {periodStats.week.recebido.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-stamp-gold">
                <span>A Receber:</span>
                <span className="font-bold">R$ {periodStats.week.aReceber.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-border-ledger pt-1 text-ink-muted text-[11px]">
                <span>Previsto (em aberto):</span>
                <span>R$ {periodStats.week.projected.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-ink-subtle">
                <span>Diárias:</span>
                <span className="font-semibold text-ink">{periodStats.week.nights}</span>
              </div>
            </div>
          </div>

          {/* Progress bar sólida */}
          <div className="mt-4 space-y-1">
            <div className="w-full h-1.5 bg-parchment rounded-card border border-border-ledger overflow-hidden flex">
              <div
                className="h-full bg-stamp-moss"
                style={{ width: `${(periodStats.week.recebido / (periodStats.week.recebido + periodStats.week.aReceber || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              <span>Recebido</span>
              <span>A Receber</span>
            </div>
          </div>
        </div>

        {/* Card 2: Mês */}
        <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex flex-col justify-between transition-colors duration-150">
          <div>
            <div className="flex items-center justify-between border-b border-border-ledger pb-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Ganhos do Mês</p>
              <TrendingUp size={13} className="text-ink-muted" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
              R$ {(periodStats.month.recebido + periodStats.month.aReceber).toFixed(0)}
            </p>

            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stamp-moss">
                <span>Recebido:</span>
                <span className="font-bold">R$ {periodStats.month.recebido.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-stamp-gold">
                <span>A Receber:</span>
                <span className="font-bold">R$ {periodStats.month.aReceber.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-border-ledger pt-1 text-ink-muted text-[11px]">
                <span>Previsto (em aberto):</span>
                <span>R$ {periodStats.month.projected.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-ink-subtle">
                <span>Diárias:</span>
                <span className="font-semibold text-ink">{periodStats.month.nights}</span>
              </div>
            </div>
          </div>

          {/* Progress bar sólida */}
          <div className="mt-4 space-y-1">
            <div className="w-full h-1.5 bg-parchment rounded-card border border-border-ledger overflow-hidden flex">
              <div
                className="h-full bg-stamp-moss"
                style={{ width: `${(periodStats.month.recebido / (periodStats.month.recebido + periodStats.month.aReceber || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              <span>Recebido</span>
              <span>A Receber</span>
            </div>
          </div>
        </div>

        {/* Card 3: Anual */}
        <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 shadow-sm flex flex-col justify-between transition-colors duration-150">
          <div>
            <div className="flex items-center justify-between border-b border-border-ledger pb-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Ganhos do Ano</p>
              <Sparkles size={13} className="text-ink-muted" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
              R$ {(periodStats.year.recebido + periodStats.year.aReceber).toFixed(0)}
            </p>

            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stamp-moss">
                <span>Recebido:</span>
                <span className="font-bold">R$ {periodStats.year.recebido.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-stamp-gold">
                <span>A Receber:</span>
                <span className="font-bold">R$ {periodStats.year.aReceber.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-border-ledger pt-1 text-ink-muted text-[11px]">
                <span>Previsto (em aberto):</span>
                <span>R$ {periodStats.year.projected.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-ink-subtle">
                <span>Diárias:</span>
                <span className="font-semibold text-ink">{periodStats.year.nights}</span>
              </div>
            </div>
          </div>

          {/* Progress bar sólida */}
          <div className="mt-4 space-y-1">
            <div className="w-full h-1.5 bg-parchment rounded-card border border-border-ledger overflow-hidden flex">
              <div
                className="h-full bg-stamp-moss"
                style={{ width: `${(periodStats.year.recebido / (periodStats.year.recebido + periodStats.year.aReceber || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              <span>Recebido</span>
              <span>A Receber</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Seção do Gráfico */}
      <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 sm:p-5 shadow-sm transition-colors duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-ledger pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold font-display text-ink">
              Desempenho por Hóspede Felino
            </h3>
            <p className="text-xs font-body text-ink-subtle mt-0.5">Comparação de diárias e receitas geradas por cada felino.</p>
          </div>

          {/* Sorting Toggles */}
          <div className="flex items-center gap-1 rounded-card border border-border-ledger bg-parchment p-0.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortBy('spent')}
              className={`px-2.5 py-1 rounded-card text-xs font-body transition-colors ${
                sortBy === 'spent'
                  ? 'bg-stamp-plum text-parchment font-semibold'
                  : 'text-ink-subtle hover:text-ink'
              }`}
            >
              Ganhos
            </button>
            <button
              type="button"
              onClick={() => setSortBy('nights')}
              className={`px-2.5 py-1 rounded-card text-xs font-body transition-colors ${
                sortBy === 'nights'
                  ? 'bg-stamp-plum text-parchment font-semibold'
                  : 'text-ink-subtle hover:text-ink'
              }`}
            >
              Diárias
            </button>
          </div>
        </div>

        {/* Custom Bars Render Grid */}
        {sortedCats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted border border-dashed border-border-ledger rounded-card bg-parchment">
            <span className="text-3xl mb-2 opacity-70">📊</span>
            <p className="text-sm font-body font-medium text-ink">Nenhum registro para este filtro</p>
            <p className="text-xs font-body text-ink-muted mt-0.5">Cadastre e conclua serviços para visualizar o gráfico comparativo.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
            {sortedCats.map((cat) => {
              const nightsWidth = (cat.nights / maxValues.nights) * 100;
              const spentWidth = (cat.spent / maxValues.spent) * 100;

              return (
                <div
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3.5 bg-parchment p-3 rounded-card border border-border-ledger hover:border-border-ledger-hover transition-colors duration-150"
                >
                  {/* Cat Photo and Name */}
                  <div className="flex items-center gap-2.5 w-full sm:w-52 flex-shrink-0">
                    <div className="h-10 w-10 overflow-hidden rounded-card bg-parchment-elevated border border-border-ledger flex-shrink-0 flex items-center justify-center">
                      {cat.fotoUrl ? (
                        <img src={cat.fotoUrl} alt={cat.nomeGato} className="h-full w-full object-cover" />
                      ) : (
                        <Cat size={18} className="text-ink-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-display text-ink truncate">{cat.nomeGato}</p>
                      <p className="text-[11px] font-body text-ink-subtle truncate">Tutor: <span className="font-medium text-ink">{cat.nomeTutor}</span></p>
                    </div>
                  </div>

                  {/* Progressive Horizontal Bar Chart */}
                  <div className="flex-1 space-y-2">
                    {/* Diárias Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                        <span>Diárias</span>
                        <span className="text-ink">{cat.nights} {cat.nights === 1 ? 'diária' : 'diárias'} ({cat.staysCount} {cat.staysCount === 1 ? 'reserva' : 'reservas'})</span>
                      </div>
                      <div className="w-full h-2 bg-parchment-elevated border border-border-ledger rounded-card overflow-hidden">
                        <div
                          className="h-full bg-stamp-moss rounded-card transition-all duration-500 ease-out"
                          style={{ width: `${nightsWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* Ganhos Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                        <span>Receita</span>
                        <span className="text-stamp-gold font-bold">R$ {cat.spent.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-2 bg-parchment-elevated border border-border-ledger rounded-card overflow-hidden">
                        <div
                          className="h-full bg-stamp-gold rounded-card transition-all duration-500 ease-out"
                          style={{ width: `${spentWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
