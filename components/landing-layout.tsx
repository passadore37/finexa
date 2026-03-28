'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 bg-[#ff64ca] border-2 border-foreground flex items-center justify-center rounded-xl"
        style={{ boxShadow: '2px 2px 0 var(--foreground)' }}>
        <span className="text-[#08080f] font-black text-xl leading-none">F</span>
      </div>
      <div className="flex flex-col">
        <span className="font-black text-2xl tracking-tighter text-foreground leading-[0.85]">FINEXA</span>
        <div className="h-[3px] w-full bg-[#5330ff] mt-0.5 rounded-full" />
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
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTAs desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <button className="nb-btn bg-background text-foreground px-5 py-2.5 text-sm font-black uppercase tracking-wide">
              Entrar
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="nb-btn bg-[#5330ff] text-white px-5 py-2.5 text-sm font-black uppercase tracking-wide hover:bg-[#6b47ff]"
              style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
              Começar grátis
            </button>
          </Link>
        </div>

        {/* Hamburguer mobile */}
        <button className="md:hidden nb-btn p-2 bg-background" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b-4 border-[#5330ff] px-4 py-6 flex flex-col gap-4">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="font-black uppercase tracking-widest text-sm text-foreground py-2 border-b border-border">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <button className="nb-btn w-full py-3 bg-secondary text-foreground font-black uppercase text-sm">Entrar</button>
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <button className="nb-btn w-full py-3 bg-[#5330ff] text-white font-black uppercase text-sm">Começar grátis</button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-card py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed">
            O controle financeiro que traz clareza para casais e famílias.
          </p>
        </div>
        {[
          { titulo: 'Produto', items: [['Como Funciona','/#como-funciona'],['Diferenciais','/#diferenciais'],['Planos','/#planos']] },
          { titulo: 'Legal', items: [['Termos de Uso','/termos'],['Privacidade','/privacidade']] },
          { titulo: 'Contato', items: [['Suporte','mailto:contato@finexa.app']] },
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
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
          © 2026 Finexa · Todos os direitos reservados.
        </p>
        <p className="text-xs text-muted-foreground">
          Desenvolvido por <span className="font-bold text-foreground">Letícia Passadore</span>
        </p>
      </div>
    </footer>
  );
}
