'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '@/types/event';

const MONTH_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const WEEK_DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function eventsOnDay(events: Event[], dayStr: string): Event[] {
  return events.filter((e) => {
    if (!e.dataInicio) return false;
    if (e.dataFinal) return dayStr >= e.dataInicio && dayStr <= e.dataFinal;
    return dayStr === e.dataInicio;
  });
}

const modalColors: Record<string, string> = {
  'Presencial': 'bg-amber-500/20 text-amber-400',
  'Online':     'bg-emerald-500/20 text-emerald-400',
  'Híbrido':    'bg-violet-500/20 text-violet-400',
};

interface CalendarViewProps {
  events: Event[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const now = new Date();
  const [year, setYear]   = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const firstDay   = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Monday-first: Mon=0 … Sun=6
  const paddingDays = (firstDay.getUTCDay() + 6) % 7;
  const todayStr    = now.toISOString().split('T')[0];

  const cells: Array<{ dayStr: string | null; day: number | null }> = [
    ...Array.from({ length: paddingDays }, () => ({ dayStr: null, day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      dayStr: toDateStr(year, month, i + 1),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          aria-label="Mês anterior"
          className="rounded-lg p-1.5 text-stone-400 hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h2 className="text-sm font-semibold text-[var(--text)]">
          {MONTH_PT[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          aria-label="Próximo mês"
          className="rounded-lg p-1.5 text-stone-400 hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 text-center">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-xl overflow-hidden border border-[var(--border)]">
        {cells.map((cell, idx) => {
          if (!cell.dayStr) {
            return <div key={`pad-${idx}`} className="bg-[var(--bg)] min-h-[80px] sm:min-h-[100px]" />;
          }

          const dayEvents  = eventsOnDay(events, cell.dayStr);
          const isToday    = cell.dayStr === todayStr;
          const isPast     = cell.dayStr < todayStr;
          const visible    = dayEvents.slice(0, 3);
          const overflow   = dayEvents.length - 3;

          return (
            <div
              key={cell.dayStr}
              className={`bg-[var(--surface)] min-h-[80px] sm:min-h-[100px] p-1.5 flex flex-col gap-1 ${isPast ? 'opacity-50' : ''}`}
            >
              <span
                className={`text-xs font-semibold self-start leading-none px-1 py-0.5 rounded ${
                  isToday
                    ? 'bg-amber-500 text-black'
                    : 'text-stone-500'
                }`}
              >
                {cell.day}
              </span>

              {visible.map((ev) => (
                <div
                  key={ev.id}
                  title={ev.nome}
                  className={`text-[10px] leading-tight rounded px-1 py-0.5 truncate font-medium ${
                    modalColors[ev.modalidade ?? ''] ?? 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {ev.nome}
                </div>
              ))}

              {overflow > 0 && (
                <span className="text-[10px] text-stone-600 px-1">+{overflow}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-stone-500">
        {Object.entries({ 'Presencial': 'text-amber-400', 'Online': 'text-emerald-400', 'Híbrido': 'text-violet-400' }).map(([label, cls]) => (
          <span key={label} className={`flex items-center gap-1 font-medium ${cls}`}>
            <span className="w-2 h-2 rounded-sm bg-current opacity-50" />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-500/10" />
          Sem modalidade
        </span>
      </div>
    </div>
  );
}
