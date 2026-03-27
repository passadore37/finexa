'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Menu, X } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar institucional */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo />
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Finexa
              </span>
            </Link>

            {/* Links desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
                Como funciona
              </a>
              <a href="#diferenciais" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
                Recursos
              </a>
              <a href="#planos" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
                Planos
              </a>
              <a href="#faq" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
                FAQ
              </a>
            </div>

            {/* CTAs desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                id="cta-nav"
                className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/50"
              >
                Começar grátis
              </Link>
            </div>

            {/* Menu hamburger mobile */}
            <button
              className="md:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-3">
            <a href="#como-funciona" className="text-sm text-white/70 hover:text-white py-2 font-medium" onClick={() => setMenuOpen(false)}>Como funciona</a>
            <a href="#diferenciais" className="text-sm text-white/70 hover:text-white py-2 font-medium" onClick={() => setMenuOpen(false)}>Recursos</a>
            <a href="#planos" className="text-sm text-white/70 hover:text-white py-2 font-medium" onClick={() => setMenuOpen(false)}>Planos</a>
            <a href="#faq" className="text-sm text-white/70 hover:text-white py-2 font-medium" onClick={() => setMenuOpen(false)}>FAQ</a>
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <Link href="/login" className="flex-1 text-center text-sm font-semibold text-white py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors">
                Entrar
              </Link>
              <Link href="/cadastro" className="flex-1 text-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl transition-colors">
                Começar grátis
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}
