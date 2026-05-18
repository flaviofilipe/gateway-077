'use client';

import Link from 'next/link';
import { Moon, Sun, Monitor, Plus } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    const order: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme as 'dark' | 'light' | 'system') + 1) % 3];
    setTheme(next);
  }

  const ThemeIcon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="text-lg font-bold tracking-tight text-[var(--text)] group-hover:text-amber-500 transition-colors">
            Caravana
          </span>
          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-black leading-none">
            GW077
          </span>
        </Link>

        <nav aria-label="Ações principais">
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              aria-label="Alternar tema"
              className="rounded-lg p-2 text-stone-500 hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <ThemeIcon size={17} aria-hidden="true" />
            </button>

            <Link
              href="/novo"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <Plus size={15} aria-hidden="true" />
              Adicionar
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
