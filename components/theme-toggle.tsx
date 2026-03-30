'use client';

import { useTheme } from '@/components/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar erro de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border-2 border-border bg-card" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 rounded-xl border-2 border-border flex items-center justify-center text-foreground bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-90 active:duration-75 group"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400 fill-yellow-400/20 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-[#5330ff] fill-[#5330ff]/10 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
