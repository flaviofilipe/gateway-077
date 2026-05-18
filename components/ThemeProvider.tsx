'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Default to 'dark' — the street aesthetic is dark-first
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'dark';
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
