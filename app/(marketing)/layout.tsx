'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Menu, X } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#08080f] selection:bg-[#ff64ca] selection:text-white">
      {/* Navbar Premium Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-lg border-b border-[#08080f]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#como-funciona" className="text-sm font-semibold text-[#08080f]/70 hover:text-[#5330ff] transition-colors">Como Funciona</a>
            <a href="#diferenciais" className="text-sm font-semibold text-[#08080f]/70 hover:text-[#5330ff] transition-colors">Diferenciais</a>
            <a href="#planos" className="text-sm font-semibold text-[#08080f]/70 hover:text-[#5330ff] transition-colors">Planos</a>
          </nav>

          {/* Ações Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-bold text-[#08080f]/80 hover:text-[#08080f] transition-colors"
            >
              Entrar
            </Link>
            
            <Link
              href="/cadastro"
              className="px-6 py-2.5 bg-[#5330ff] text-white text-sm font-bold rounded-full shadow-lg shadow-[#5330ff]/20 hover:bg-[#4320ee] hover:shadow-xl hover:shadow-[#5330ff]/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Começar grátis
            </Link>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#08080f]"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#08080f]/5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col p-6 gap-6">
              {['#como-funciona', '#diferenciais', '#planos'].map((href, i) => (
                <a
                  key={href}
                  href={`/${href}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-bold text-[#08080f]/80"
                >
                  {['Como Funciona', 'Diferenciais', 'Planos'][i]}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-4 border-t border-[#08080f]/5">
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-4 text-center font-bold text-[#08080f]"
                >
                  Entrar
                </Link>
                <Link 
                  href="/cadastro" 
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-4 text-center bg-[#5330ff] text-white font-bold rounded-2xl shadow-lg"
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
