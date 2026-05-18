'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CalendarX } from 'lucide-react';
import type { Event, SchemaOptions, ViewMode } from '@/types/event';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import TimelineView from './TimelineView';
import CalendarView from './CalendarView';
import ViewToggle from './ViewToggle';

interface EventListProps {
  events: Event[];
  schema: SchemaOptions;
}

function matchesFilters(event: Event, uf: string, modalidade: string, tags: string[], search: string): boolean {
  if (uf && event.uf !== uf) return false;
  if (modalidade && event.modalidade !== modalidade) return false;
  if (tags.length > 0 && !tags.some((t) => event.tags.includes(t))) return false;
  if (search) {
    const q = search.toLowerCase();
    if (!event.nome.toLowerCase().includes(q) && !event.descricao.toLowerCase().includes(q)) return false;
  }
  return true;
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((new Date(Date.UTC(y, m - 1, d)).getTime() - today.getTime()) / 86_400_000);
}

interface Group { label: string; events: Event[] }

function groupUpcoming(events: Event[]): Group[] {
  const semana: Event[] = [], mes: Event[] = [], proximos: Event[] = [];
  for (const e of events) {
    if (!e.dataInicio) { proximos.push(e); continue; }
    const d = daysUntil(e.dataInicio);
    if (d <= 7) semana.push(e);
    else if (d <= 30) mes.push(e);
    else proximos.push(e);
  }
  const groups: Group[] = [];
  if (semana.length)   groups.push({ label: 'Esta semana', events: semana });
  if (mes.length)      groups.push({ label: 'Este mês', events: mes });
  if (proximos.length) groups.push({ label: 'Próximos', events: proximos });
  return groups;
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-bold uppercase tracking-widest text-amber-500">{label}</span>
      <span className="text-xs text-stone-600">{count}</span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

export default function EventList({ events, schema }: EventListProps) {
  const [uf, setUf]               = useState('');
  const [modalidade, setModalidade] = useState('');
  const [tags, setTags]           = useState<string[]>([]);
  const [search, setSearch]       = useState('');
  const [pastOpen, setPastOpen]   = useState(false);
  const [view, setView]           = useState<ViewMode>('grid');

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }
  function clearFilters() { setUf(''); setModalidade(''); setTags([]); setSearch(''); }

  const filtered  = events.filter((e) => matchesFilters(e, uf, modalidade, tags, search));
  const upcoming  = filtered.filter((e) => !e.isPast);
  const past      = filtered.filter((e) => e.isPast);
  const groups    = groupUpcoming(upcoming);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters + View toggle */}
      <div className="flex flex-col gap-3">
        <EventFilters
          schema={schema}
          uf={uf}
          modalidade={modalidade}
          tags={tags}
          search={search}
          onUfChange={setUf}
          onModalidadeChange={setModalidade}
          onTagToggle={toggleTag}
          onSearchChange={setSearch}
          onClear={clearFilters}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-600">
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
          </p>
          <ViewToggle mode={view} onChange={setView} />
        </div>
      </div>

      {/* Views */}
      {view === 'timeline' && <TimelineView events={filtered} />}
      {view === 'calendar' && <CalendarView events={filtered} />}

      {view === 'grid' && (
        <>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-stone-500">
              <CalendarX size={40} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm">Nenhum evento encontrado.</p>
              {(uf || modalidade || tags.length > 0 || search) && (
                <button onClick={clearFilters} className="text-sm text-amber-500 hover:underline focus-visible:outline-none">
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {groups.map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <SectionLabel label={group.label} count={group.events.length} />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.events.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                </section>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <section aria-label="Eventos passados">
              <button
                onClick={() => setPastOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-stone-500 hover:text-[var(--text)] hover:border-amber-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-expanded={pastOpen}
              >
                <span>Passados <span className="text-stone-600 normal-case font-normal">({past.length})</span></span>
                {pastOpen ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
              </button>
              {pastOpen && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((event) => <EventCard key={event.id} event={event} past />)}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
