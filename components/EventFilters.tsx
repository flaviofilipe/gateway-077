'use client';

import { Search, X } from 'lucide-react';
import type { SchemaOptions } from '@/types/event';

interface EventFiltersProps {
  schema: SchemaOptions;
  uf: string;
  modalidade: string;
  tags: string[];
  search: string;
  onUfChange: (uf: string) => void;
  onModalidadeChange: (m: string) => void;
  onTagToggle: (tag: string) => void;
  onSearchChange: (q: string) => void;
  onClear: () => void;
}

const inputClass =
  'rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-stone-600 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20';

export default function EventFilters({
  schema, uf, modalidade, tags, search,
  onUfChange, onModalidadeChange, onTagToggle, onSearchChange, onClear,
}: EventFiltersProps) {
  const hasFilters = uf || modalidade || tags.length > 0 || search;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar evento..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar eventos"
          className={`w-full py-2 pl-9 pr-4 ${inputClass}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {schema.ufs.length > 0 && (
          <>
            <label htmlFor="filter-uf" className="sr-only">Filtrar por estado</label>
            <select id="filter-uf" value={uf} onChange={(e) => onUfChange(e.target.value)} className={`px-3 py-1.5 ${inputClass}`}>
              <option value="">Todos os estados</option>
              {schema.ufs.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </>
        )}

        {schema.modalidades.length > 0 && (
          <>
            <label htmlFor="filter-modalidade" className="sr-only">Filtrar por modalidade</label>
            <select id="filter-modalidade" value={modalidade} onChange={(e) => onModalidadeChange(e.target.value)} className={`px-3 py-1.5 ${inputClass}`}>
              <option value="">Todas as modalidades</option>
              {schema.modalidades.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </>
        )}

        {schema.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tag">
            {schema.tags.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  aria-pressed={active}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    active
                      ? 'bg-amber-500 text-black'
                      : 'bg-[var(--surface)] border border-[var(--border)] text-stone-400 hover:border-amber-500/40 hover:text-amber-500'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {hasFilters && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-500 transition-colors focus-visible:outline-none focus-visible:underline">
            <X size={11} aria-hidden="true" /> Limpar
          </button>
        )}
      </div>
    </div>
  );
}
