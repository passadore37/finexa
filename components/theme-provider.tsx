'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'system',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('finexa-theme') as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.classList.toggle('dark', isDark);

    // Atualizar ícone do botão
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = isDark
        ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41M11 8a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      btn.onclick = () => {
        const next = isDark ? 'light' : 'dark';
        localStorage.setItem('finexa-theme', next);
        setThemeState(next);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
