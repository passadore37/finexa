'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { NeobrutalistButton } from '@/components/neobrutalist';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar Neobrutalista Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 dark:bg-[#08080f]/80 backdrop-blur-md border-b-2 border-[#08080f] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#comece-agora" className="font-bold hover:text-[#5330ff] transition-colors">Onde estar?</a>
            <a href="/#como-funciona" className="font-bold hover:text-[#5330ff] transition-colors">Como Funciona</a>
            <a href="/#diferenciais" className="font-bold hover:text-[#5330ff] transition-colors">Diferenciais</a>
            <a href="/#planos" className="font-bold hover:text-[#5330ff] transition-colors">Planos</a>
          </nav>

          {/* Ações Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(8,8,15,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <Link
              href="/login"
              className="font-bold px-6 py-2 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-[#ff64ca] hover:text-[#08080f] hover:border-[#ff64ca] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(8,8,15,1),0_0_20px_#ff64ca] transition-all"
            >
              Entrar
            </Link>
            
            <NeobrutalistButton href="/cadastro" className="text-sm">
              Começar grátis
            </NeobrutalistButton>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-3">
             <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-[#08080f] border-b-2 border-[#08080f] dark:border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col p-4 gap-4">
              {['#comece-agora', '#como-funciona', '#diferenciais', '#planos'].map((href, i) => (
                <a
                  key={href}
                  href={`/${href}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 font-bold border-b border-[#08080f]/10 dark:border-white/10"
                >
                  {['Onde você está?', 'Como Funciona', 'Diferenciais', 'Planos'][i]}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="border-2 border-[#08080f] dark:border-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#08080f] text-[#08080f] dark:text-white py-3 font-bold flex items-center justify-center hover:bg-[#ff64ca] hover:text-[#08080f] transition-colors"
                >
                  Entrar
                </Link>
                <Link 
                  href="/cadastro" 
                  onClick={() => setMenuOpen(false)}
                  className="border-2 border-[#08080f] dark:border-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-[#5330ff] text-white py-3 font-bold flex items-center justify-center"
                >
                  Começar grátis
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
