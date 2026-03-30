'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'system',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');

  // Carrega tema salvo
  useEffect(() => {
    const saved = localStorage.getItem('finexa-theme') as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  // Aplica classe dark no <html> sempre que o tema mudar
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.classList.toggle('dark', isDark);
  }, [theme]);

  // Salva no localStorage e atualiza estado
  const setTheme = (t: Theme) => {
    localStorage.setItem('finexa-theme', t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);