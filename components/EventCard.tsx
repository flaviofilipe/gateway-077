import { ExternalLink, MapPin, Users } from 'lucide-react';
import type { Event } from '@/types/event';
import Badge from './Badge';

const MONTH_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function parseDateUTC(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  return Math.round((parseDateUTC(iso).getTime() - today.getTime()) / 86_400_000);
}

function formatEndDate(start: string, end: string): string {
  const s = parseDateUTC(start);
  const e = parseDateUTC(end);
  if (s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear()) {
    return `–${e.getUTCDate()}`;
  }
  return `– ${e.getUTCDate()} ${MONTH_SHORT[e.getUTCMonth()]}`;
}

function Countdown({ days }: { days: number }) {
  if (days === 0) return <span className="text-xs font-bold text-amber-500">Hoje</span>;
  if (days === 1) return <span className="text-xs font-bold text-amber-500">Amanhã</span>;
  if (days <= 7)  return <span className="text-xs text-amber-400">em {days} dias</span>;
  return null;
}

const modalStyles: Record<string, string> = {
  'Presencial': 'text-amber-400',
  'Online':     'text-emerald-400',
  'Híbrido':    'text-violet-400',
};

const precoStyles: Record<string, string> = {
  'Gratuito':    'bg-green-500/10 text-green-400 border border-green-500/20',
  'Pago':        'bg-[var(--bg)] text-stone-500 border border-[var(--border)]',
  'A confirmar': 'bg-[var(--bg)] text-stone-600 border border-dashed border-[var(--border)]',
};

interface EventCardProps {
  event: Event;
  past?: boolean;
}

export default function EventCard({ event, past = false }: EventCardProps) {
  const excerpt = event.descricao.length > 110
    ? event.descricao.slice(0, 110).trimEnd() + '…'
    : event.descricao;

  const hasDate  = !!event.dataInicio;
  const startDate = hasDate ? parseDateUTC(event.dataInicio) : null;
  const days      = hasDate && !past ? daysUntil(event.dataInicio) : null;

  return (
    <article className={`group flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-amber-500/40 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.12)] ${past ? 'opacity-55' : ''}`}>
      {/* Date tile */}
      {startDate ? (
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-[var(--bg)] border border-[var(--border)] group-hover:border-amber-500/30 transition-colors text-center">
          <span className="text-base font-bold leading-none text-[var(--text)]">
            {startDate.getUTCDate()}
            {event.dataFinal && event.dataFinal !== event.dataInicio && (
              <span className="text-[9px] text-stone-500 block">{formatEndDate(event.dataInicio, event.dataFinal)}</span>
            )}
          </span>
          <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase">
            {MONTH_SHORT[startDate.getUTCMonth()]}
          </span>
        </div>
      ) : (
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-[var(--bg)] border border-[var(--border)]" />
      )}

      <div className="flex flex-col gap-1.5 min-w-0">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1">
          {event.uf && <Badge variant="uf">{event.uf}</Badge>}
          {event.modalidade && (
            <span className={`text-xs font-medium ${modalStyles[event.modalidade] ?? 'text-stone-400'}`}>
              {event.modalidade}
            </span>
          )}
          {event.faixaPreco && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${precoStyles[event.faixaPreco] ?? ''}`}>
              {event.faixaPreco}
            </span>
          )}
          {event.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="tag">{tag}</Badge>)}
          {days !== null && <Countdown days={days} />}
        </div>

        <h2 className="text-sm font-semibold leading-snug text-[var(--text)] group-hover:text-amber-500 transition-colors">
          {event.nome}
        </h2>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-500">
          {event.cidade && (
            <span className="flex items-center gap-1">
              <MapPin size={10} aria-hidden="true" />{event.cidade}
            </span>
          )}
          {event.participantes && (
            <span className="flex items-center gap-1">
              <Users size={10} aria-hidden="true" />{event.participantes.toLocaleString('pt-BR')} participantes
            </span>
          )}
        </div>

        {excerpt && <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{excerpt}</p>}

        {event.linkSite && (
          <a
            href={event.linkSite}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Ver site <ExternalLink size={10} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
