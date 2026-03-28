'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-bold tracking-tight">Finexa</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
          <a href="/#missao" className="hover:text-primary transition-colors">Nossa Missão</a>
          <a href="/#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
          <a href="/#diferenciais" className="hover:text-primary transition-colors">Diferenciais</a>
          <a href="/#planos" className="hover:text-primary transition-colors">Planos</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm font-semibold">Entrar</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-indigo hover:bg-indigo/90 text-white font-black px-6 shadow-[4px_4px_0px_0px_var(--indigo-light)] border-2 border-white/10 uppercase tracking-tight transition-all hover:-translate-y-1">
                Começar Agora
              </Button>
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b-4 border-indigo p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <a href="/#missao" className="font-black uppercase tracking-widest text-sm" onClick={() => setIsMenuOpen(false)}>Nossa Missão</a>
          <a href="/#como-funciona" className="font-black uppercase tracking-widest text-sm" onClick={() => setIsMenuOpen(false)}>Como Funciona</a>
          <a href="/#diferenciais" className="font-black uppercase tracking-widest text-sm" onClick={() => setIsMenuOpen(false)}>Diferenciais</a>
          <a href="/#planos" className="font-black uppercase tracking-widest text-sm" onClick={() => setIsMenuOpen(false)}>Planos</a>
          <hr className="border-border" />
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-center font-black uppercase">Entrar</Button>
            </Link>
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full bg-indigo text-white font-black uppercase shadow-[6px_6px_0px_0px_var(--indigo-light)]">Começar Agora</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12 text-left">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xl font-bold tracking-tight">Finexa</span>
          </div>
          <p className="text-sm text-muted-foreground">O controle financeiro que traz clareza para o seu futuro.</p>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-indigo uppercase text-xs tracking-widest">Produto</h4>
          <ul className="space-y-4 text-sm font-medium text-muted-foreground">
            <li><a href="/#como-funciona" className="hover:text-indigo">Como Funciona</a></li>
            <li><a href="/#diferenciais" className="hover:text-indigo">Funcionalidades</a></li>
            <li><a href="/#planos" className="hover:text-indigo">Preços</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-indigo uppercase text-xs tracking-widest">Legal</h4>
          <ul className="space-y-4 text-sm font-medium text-muted-foreground">
            <li><Link href="/termos" className="hover:text-indigo">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-indigo">Privacidade</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-indigo uppercase text-xs tracking-widest">Contato</h4>
          <ul className="space-y-4 text-sm font-medium text-muted-foreground">
            <li><a href="mailto:contato@passadore.com" className="hover:text-indigo">Suporte por E-mail</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          © 2026 FINEXA SAAS PASSADORE. TODOS OS DIREITOS RESERVADOS.
        </p>
      </div>
    </footer>
  );
}
