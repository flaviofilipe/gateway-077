'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id?: string;
  value: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
  hasError?: boolean;
}

export default function TagInput({ id, value, suggestions, onChange, hasError }: TagInputProps) {
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen]         = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const query     = inputVal.trim().toLowerCase();
  const available = suggestions.filter((s) => !value.includes(s));
  const filtered  = query ? available.filter((s) => s.toLowerCase().includes(query)) : available;
  const canCreate = query.length > 0
    && !suggestions.some((s) => s.toLowerCase() === query)
    && !value.map((v) => v.toLowerCase()).includes(query);

  const showDropdown = open && (filtered.length > 0 || canCreate);

  function add(tag: string) {
    const t = tag.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInputVal('');
    inputRef.current?.focus();
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      add(inputVal.trim());
    }
    if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      onChange(value.slice(0, -1));
    }
    if (e.key === 'Escape') setOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const borderCls = hasError
    ? 'border-red-500/50 focus-within:border-red-500/60 focus-within:ring-red-500/20'
    : 'border-[var(--border)] focus-within:border-amber-500/60 focus-within:ring-amber-500/20';

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex min-h-[40px] flex-wrap gap-1.5 rounded-lg border ${borderCls} bg-[var(--bg)] px-2.5 py-2 focus-within:ring-2 cursor-text`}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-400">
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(tag); }}
              aria-label={`Remover tag ${tag}`}
              className="text-amber-400/60 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? 'Buscar ou criar tags…' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--text)] placeholder:text-stone-600 outline-none"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
      </div>

      {showDropdown && (
        <ul
          role="listbox"
          aria-label="Sugestões de tags"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl"
        >
          {filtered.map((s) => (
            <li key={s} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                className="w-full px-3 py-1.5 text-left text-sm text-[var(--text)] hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
          {canCreate && (
            <li role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(inputVal.trim()); }}
                className="w-full px-3 py-1.5 text-left text-sm text-stone-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
              >
                Criar tag <span className="font-semibold text-amber-500">"{inputVal.trim()}"</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
