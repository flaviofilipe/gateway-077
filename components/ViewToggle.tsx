'use client';

import { LayoutGrid, Route, CalendarDays } from 'lucide-react';
import type { ViewMode } from '@/types/event';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

const views: { id: ViewMode; label: string; Icon: React.ElementType }[] = [
  { id: 'grid',     label: 'Grid',      Icon: LayoutGrid   },
  { id: 'timeline', label: 'Rota',      Icon: Route        },
  { id: 'calendar', label: 'Calendário',Icon: CalendarDays },
];

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label="Modo de visualização" className="flex rounded-lg border border-[var(--border)] overflow-hidden">
      {views.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset ${
              active
                ? 'bg-amber-500 text-black'
                : 'bg-[var(--surface)] text-stone-400 hover:text-[var(--text)] hover:bg-[var(--bg)]'
            }`}
          >
            <Icon size={13} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
