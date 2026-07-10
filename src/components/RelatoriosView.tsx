import { useState, useMemo } from 'react';
import { Estadia, Gato } from '../types';
import { calculateNights } from '../utils';
import { Cat, DollarSign, Calendar, TrendingUp, Award, Clock, Sparkles } from 'lucide-react';

interface RelatoriosViewProps {
  estadias: Estadia[];
  gatos: Gato[];
}

export function RelatoriosView({ estadias, gatos }: RelatoriosViewProps) {
  const [sortBy, setSortBy] = useState<'spent' | 'nights'>('spent');

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

  // 1. Calculate Period Statistics
  const periodStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const { monday, sunday } = getWeekRange();

    const week = { realized: 0, projected: 0, nights: 0, staysCount: 0 };
    const month = { realized: 0, projected: 0, nights: 0, staysCount: 0 };
    const year = { realized: 0, projected: 0, nights: 0, staysCount: 0 };

    estadias.forEach((e) => {
      const nights = calculateNights(e.dataCheckIn, e.dataCheckOut);
      const value = nights * (e.valorDiaria || 50);
      const checkInDate = parseLocalDate(e.dataCheckIn);
      const isRealized = e.status !== 'agendado';

      // Check if current calendar week
      const isThisWeek = checkInDate >= monday && checkInDate <= sunday;
      if (isThisWeek) {
        week.nights += nights;
        week.staysCount += 1;
        if (isRealized) week.realized += value;
        else week.projected += value;
      }

      // Check if current calendar month
      const isThisMonth = checkInDate.getFullYear() === currentYear && checkInDate.getMonth() === currentMonth;
      if (isThisMonth) {
        month.nights += nights;
        month.staysCount += 1;
        if (isRealized) month.realized += value;
        else month.projected += value;
      }

      // Check if current calendar year
      const isThisYear = checkInDate.getFullYear() === currentYear;
      if (isThisYear) {
        year.nights += nights;
        year.staysCount += 1;
        if (isRealized) year.realized += value;
        else year.projected += value;
      }
    });

    return { week, month, year };
  }, [estadias]);

  // 2. Calculate Feline Guest Analytics
  const catAnalytics = useMemo(() => {
    const catsData = gatos.map((g) => {
      const catStays = estadias.filter((e) => e.gatoId === g.id);

      const totalNights = catStays.reduce((sum, e) => sum + calculateNights(e.dataCheckIn, e.dataCheckOut), 0);
      const totalSpent = catStays.reduce((sum, e) => {
        const nights = calculateNights(e.dataCheckIn, e.dataCheckOut);
        return sum + (nights * (e.valorDiaria || 50));
      }, 0);

      return {
        ...g,
        nights: totalNights,
        spent: totalSpent,
        staysCount: catStays.length,
      };
    });

    const activeCats = catsData.filter((c) => c.nights > 0);

    return { catsData, activeCats };
  }, [gatos, estadias]);

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
    <div className="space-y-6">
      {/* 1. KPIs / Destaques Gerais */}
      {highlights && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card Destaque 1: Faturamento Geral */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition duration-300">
              <TrendingUp size={120} className="text-terracota-500 dark:text-terracota-400" />
            </div>
            <div className="rounded-2xl bg-terracota-50 dark:bg-terracota-950/40 p-3 text-terracota-600 dark:text-terracota-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Receita Total Acumulada</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">R$ {highlights.totalSpentAll.toFixed(0)}</p>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">{highlights.totalNightsAll} diárias registradas</p>
            </div>
          </div>

          {/* Card Destaque 2: Gato VIP */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition duration-300">
              <Clock size={120} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-650 dark:text-emerald-400">
              <Award size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hóspede VIP (Mais Noites)</p>
              {highlights.vipCat ? (
                <>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">{highlights.vipCat.nomeGato}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    {highlights.vipCat.nights} diárias • Tutor: {highlights.vipCat.nomeTutor}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Nenhum registro</p>
              )}
            </div>
          </div>

          {/* Card Destaque 3: Mais Rentável */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition duration-300">
              <Sparkles size={120} className="text-purple-650 dark:text-purple-400" />
            </div>
            <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/40 p-3 text-purple-600 dark:text-purple-400">
              <Cat size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mais Rentável</p>
              {highlights.topEarner ? (
                <>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">{highlights.topEarner.nomeGato}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    R$ {highlights.topEarner.spent.toFixed(0)} • Tutor: {highlights.topEarner.nomeTutor}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Nenhum registro</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Overview Períodos (Semanal, Mensal, Anual) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Semanal */}
        <div className="rounded-3xl border-t-4 border-t-terracota-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ganhos da Semana</p>
              <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              R$ {(periodStats.week.realized + periodStats.week.projected).toFixed(0)}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Realizados:</span>
                <span className="font-bold text-slate-900 dark:text-white">R$ {periodStats.week.realized.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Projetados (Reservas):</span>
                <span className="font-semibold text-slate-500">R$ {periodStats.week.projected.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span>Diárias Ocupadas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">{periodStats.week.nights} {periodStats.week.nights === 1 ? 'noite' : 'noites'}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Médio da Diária:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">
                  R$ {periodStats.week.nights > 0 ? ((periodStats.week.realized + periodStats.week.projected) / periodStats.week.nights).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-1.5">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-terracota-500 dark:bg-terracota-400 transition-all duration-300"
                style={{ width: `${(periodStats.week.realized / (periodStats.week.realized + periodStats.week.projected || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Realizado</span>
              <span>Projetado</span>
            </div>
          </div>
        </div>

        {/* Card 2: Mês */}
        <div className="rounded-3xl border-t-4 border-t-emerald-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-5 shadow-sm flex flex-col justify-between flex-shrink-0">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ganhos do Mês</p>
              <TrendingUp size={14} className="text-slate-400 dark:text-slate-505" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              R$ {(periodStats.month.realized + periodStats.month.projected).toFixed(0)}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Realizados:</span>
                <span className="font-bold text-slate-900 dark:text-white">R$ {periodStats.month.realized.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Projetados (Reservas):</span>
                <span className="font-semibold text-slate-500">R$ {periodStats.month.projected.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span>Diárias Ocupadas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">{periodStats.month.nights} {periodStats.month.nights === 1 ? 'noite' : 'noites'}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Médio da Diária:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">
                  R$ {periodStats.month.nights > 0 ? ((periodStats.month.realized + periodStats.month.projected) / periodStats.month.nights).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-1.5">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                style={{ width: `${(periodStats.month.realized / (periodStats.month.realized + periodStats.month.projected || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Realizado</span>
              <span>Projetado</span>
            </div>
          </div>
        </div>

        {/* Card 3: Anual */}
        <div className="rounded-3xl border-t-4 border-t-purple-500 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-warmBg-900 p-5 shadow-sm flex flex-col justify-between flex-shrink-0">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ganhos do Ano</p>
              <Sparkles size={14} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              R$ {(periodStats.year.realized + periodStats.year.projected).toFixed(0)}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Realizados:</span>
                <span className="font-bold text-slate-900 dark:text-white">R$ {periodStats.year.realized.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Projetados (Reservas):</span>
                <span className="font-semibold text-slate-500">R$ {periodStats.year.projected.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span>Diárias Ocupadas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">{periodStats.year.nights} {periodStats.year.nights === 1 ? 'noite' : 'noites'}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Médio da Diária:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">
                  R$ {periodStats.year.nights > 0 ? ((periodStats.year.realized + periodStats.year.projected) / periodStats.year.nights).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-1.5">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300"
                style={{ width: `${(periodStats.year.realized / (periodStats.year.realized + periodStats.year.projected || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Realizado</span>
              <span>Projetado</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Seção do Gráfico */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-warmBg-900/80 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-150 dark:border-slate-800/60 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📈</span> Desempenho por Hóspede Felino
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comparação de diárias e ganhos gerados por cada felino cadastrado.</p>
          </div>

          {/* Sorting Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortBy('spent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${sortBy === 'spent'
                ? 'bg-white dark:bg-warmBg-800 text-terracota-600 dark:text-terracota-400 shadow-sm font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <span>💰</span>
              <span><span className="hidden sm:inline">Ordenar por </span>Ganhos</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('nights')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${sortBy === 'nights'
                ? 'bg-white dark:bg-warmBg-800 text-terracota-600 dark:text-terracota-400 shadow-sm font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <span>🌙</span>
              <span><span className="hidden sm:inline">Ordenar por </span>Diárias</span>
            </button>
          </div>
        </div>

        {/* Custom Bars Render Grid */}
        {sortedCats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/40">
            <span className="text-4xl mb-2">📊</span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Nenhum hóspede felino com diárias registradas</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Hospede um felino no hotel para visualizar os dados consolidados do gráfico.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {sortedCats.map((cat) => {
              const nightsWidth = (cat.nights / maxValues.nights) * 100;
              const spentWidth = (cat.spent / maxValues.spent) * 100;

              return (
                <div
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/40 dark:bg-slate-955/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 hover:shadow-md dark:hover:bg-slate-955/40 hover:border-terracota-500/30 transition duration-200 group"
                >
                  {/* Cat Photo and Name */}
                  <div className="flex items-center gap-3 w-full sm:w-56 flex-shrink-0">
                    <div className="h-11 w-11 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                      {cat.fotoUrl ? (
                        <img src={cat.fotoUrl} alt={cat.nomeGato} className="h-full w-full object-cover" />
                      ) : (
                        <Cat size={20} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-terracota-600 dark:group-hover:text-terracota-400 transition">{cat.nomeGato}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Tutor: <span className="font-semibold text-slate-700 dark:text-slate-350">{cat.nomeTutor}</span></p>
                    </div>
                  </div>

                  {/* Progressive Horizontal Bar Chart */}
                  <div className="flex-1 space-y-3">
                    {/* Diárias Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span>Diárias</span>
                        <span className="text-slate-700 dark:text-slate-350 font-bold">{cat.nights} {cat.nights === 1 ? 'diária' : 'diárias'} ({cat.staysCount} {cat.staysCount === 1 ? 'estadia' : 'estadias'})</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100/80 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${nightsWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* Ganhos Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span>Ganhos</span>
                        <span className="text-terracota-600 dark:text-terracota-400 font-bold">R$ {cat.spent.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100/80 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-terracota-500 to-mostarda-400 rounded-full transition-all duration-700 ease-out"
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
