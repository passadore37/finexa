'use client';

import Link from 'next/link';
import { Mail, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: '#5330ff',
          border: '2px solid #82a1fd',
          boxShadow: '2px 2px 0px 0px #82a1fd',
        }}
      >
        F
      </div>
      <div>
        <span className="text-base font-bold text-foreground leading-none block tracking-tight">Finexa</span>
        <span className="text-[10px] text-muted-foreground block">Seu dinheiro, com clareza.</span>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: 'Como Funciona', href: '/#como-funciona' },
    { label: 'Diferenciais', href: '/#diferenciais' },
    { label: 'Planos', href: '/#planos' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-background/90 backdrop-blur-md border-b-2 border-border py-2'
        : 'bg-transparent py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <Link href="/"><Logo /></Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTAs + ThemeToggle desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <button className="nb-btn bg-card text-foreground px-4 py-2 text-sm font-bold">
              Entrar
            </button>
          </Link>
          <Link href="/cadastro">
            <button className="nb-btn bg-[#5330ff] text-white px-4 py-2 text-sm font-black"
              style={{ borderColor: '#5330ff', boxShadow: '3px 3px 0 #82a1fd60' }}>
              Começar grátis
            </button>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button className="nb-btn p-2 bg-card" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-background border-b-2 border-[#5330ff] px-4 py-5 flex flex-col gap-3">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="font-semibold text-sm text-foreground py-2 border-b border-border">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-1">
            <Link href="/login" onClick={() => setOpen(false)}>
              <button className="nb-btn w-full py-3 bg-card text-foreground font-bold text-sm">Entrar</button>
            </Link>
            <Link href="/cadastro" onClick={() => setOpen(false)}>
              <button className="nb-btn w-full py-3 bg-[#5330ff] text-white font-black text-sm">Começar grátis</button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-card py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed">
            O controle financeiro que traz clareza para casais e famílias.
          </p>
        </div>
        {[
          { titulo: 'Produto', items: [['Como Funciona','/#como-funciona'],['Diferenciais','/#diferenciais'],['Planos','/#planos']] },
          { titulo: 'Legal', items: [['Termos de Uso','/termos'],['Privacidade','/privacidade']] },
        ].map(col => (
          <div key={col.titulo}>
            <h4 className="font-black mb-4 text-[#5330ff] uppercase text-xs tracking-widest">{col.titulo}</h4>
            <ul className="space-y-3">
              {col.items.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-black mb-4 text-[#5330ff] uppercase text-xs tracking-widest">Contato</h4>
          <ul className="space-y-3">
            <li>
              <a href="mailto:contato@finexa.app"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                <Mail className="h-4 w-4 text-[#5330ff]" />
                contato@finexa.app
              </a>
            </li>
            <li>
              <a href="https://instagram.com/finexa.app" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                <Instagram className="h-4 w-4 text-[#ff64ca]" />
                @finexa.app
              </a>
            </li>
            <li>
              <span className="text-sm text-muted-foreground font-medium">Letícia Passadore</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          © 2026 Finexa · Todos os direitos reservados.
        </p>
        <p className="text-xs text-muted-foreground">
          Desenvolvido por <span className="font-bold text-foreground">Letícia Passadore</span>
        </p>
      </div>
    </footer>
  );
}