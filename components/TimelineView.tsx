'use client';

import { ExternalLink, MapPin } from 'lucide-react';
import type { Event } from '@/types/event';
import Badge from './Badge';

const MONTH_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const MONTH_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function parseDateUTC(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setUTCHours(0,0,0,0);
  return Math.round((parseDateUTC(iso).getTime() - today.getTime()) / 86_400_000);
}

interface Stop {
  monthKey: string;
  monthLabel: string;
  year: number;
  event: Event;
  date: Date;
}

function buildStops(events: Event[]): Stop[] {
  return events
    .filter((e) => e.dataInicio)
    .map((e) => {
      const date = parseDateUTC(e.dataInicio);
      const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      return {
        monthKey,
        monthLabel: MONTH_PT[date.getUTCMonth()],
        year: date.getUTCFullYear(),
        date,
        event: e,
      };
    });
}

const modalColors: Record<string, string> = {
  'Presencial': 'text-amber-400',
  'Online':     'text-emerald-400',
  'Híbrido':    'text-violet-400',
};

interface TimelineViewProps {
  events: Event[];
}

export default function TimelineView({ events }: TimelineViewProps) {
  const upcoming = events.filter((e) => !e.isPast);
  const past     = events.filter((e) => e.isPast).reverse();

  function renderSection(stops: Stop[], isPast: boolean) {
    let lastMonthKey = '';

    return stops.map((stop) => {
      const showMonth = stop.monthKey !== lastMonthKey;
      lastMonthKey = stop.monthKey;
      const days = !isPast ? daysUntil(stop.event.dataInicio) : null;

      return (
        <div key={stop.event.id}>
          {showMonth && (
            <div className="flex items-center gap-3 my-4 first:mt-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600 w-10 text-right shrink-0">
                {MONTH_SHORT[stop.date.getUTCMonth()]}
              </span>
              <div className="w-px h-4 bg-[var(--border)] ml-[5px]" />
              <span className="text-xs font-semibold text-stone-500">
                {stop.monthLabel} {stop.year}
              </span>
            </div>
          )}

          <div className="flex gap-3 group">
            {/* Left: date column with road line */}
            <div className="flex flex-col items-center w-10 shrink-0">
              <span className="text-xs font-bold text-stone-500 w-full text-right leading-none pt-1">
                {stop.date.getUTCDate()}
              </span>
              {/* Road dot */}
              <div className={`mt-1 w-2.5 h-2.5 rounded-full border-2 shrink-0 ${
                isPast
                  ? 'border-stone-700 bg-[var(--bg)]'
                  : days !== null && days <= 7
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-amber-500/60 bg-[var(--bg)]'
              }`} />
              <div className="flex-1 w-px bg-[var(--border)]" />
            </div>

            {/* Right: event card */}
            <div className={`mb-3 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 transition-all group-hover:border-amber-500/30 ${isPast ? 'opacity-50' : ''}`}>
              <div className="flex flex-wrap items-center gap-1 mb-1.5">
                {stop.event.uf && <Badge variant="uf">{stop.event.uf}</Badge>}
                {stop.event.modalidade && (
                  <span className={`text-xs font-medium ${modalColors[stop.event.modalidade] ?? 'text-stone-400'}`}>
                    {stop.event.modalidade}
                  </span>
                )}
                {days !== null && days === 0 && <span className="text-xs font-bold text-amber-500">Hoje</span>}
                {days !== null && days === 1 && <span className="text-xs font-bold text-amber-500">Amanhã</span>}
                {days !== null && days > 1 && days <= 7 && <span className="text-xs text-amber-400">em {days} dias</span>}
              </div>

              <h3 className="text-sm font-semibold text-[var(--text)] leading-snug">
                {stop.event.nome}
              </h3>

              {stop.event.cidade && (
                <p className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                  <MapPin size={10} aria-hidden="true" />
                  {stop.event.cidade}
                  {stop.event.dataFinal && stop.event.dataFinal !== stop.event.dataInicio && (
                    <span className="text-stone-600 ml-1">
                      → {new Date(stop.event.dataFinal + 'T00:00:00Z').getUTCDate()} {MONTH_SHORT[new Date(stop.event.dataFinal + 'T00:00:00Z').getUTCMonth()]}
                    </span>
                  )}
                </p>
              )}

              {stop.event.linkSite && (
                <a
                  href={stop.event.linkSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 mt-1.5 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Ver site <ExternalLink size={10} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="relative">
      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-center text-stone-500 py-16 text-sm">Nenhum evento encontrado.</p>
      )}

      {upcoming.length > 0 && (
        <section aria-label="Próximas paradas">
          {renderSection(buildStops(upcoming), false)}
        </section>
      )}

      {past.length > 0 && (
        <section aria-label="Histórico" className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">Histórico</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          {renderSection(buildStops(past), true)}
        </section>
      )}
    </div>
  );
}
