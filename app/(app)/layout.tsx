'use client';

import { Logo } from '@/components/logo';
import { TabNav } from '@/components/tab-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { FeedbackModal } from '@/components/beta/feedback-modal';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { perfil, signOut } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-base font-bold text-foreground leading-none tracking-tight">Finexa</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Seu dinheiro, com clareza.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <button onClick={() => setMenuAberto(!menuAberto)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:bg-secondary transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-black text-primary">
                  {perfil?.nome?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-xs font-medium text-foreground hidden sm:block max-w-[100px] truncate">
                  {perfil?.nome ?? 'Usuário'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">{perfil?.nome}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">Plano {perfil?.plano ?? 'casal'}</p>
                    </div>
                    <button onClick={() => { setMenuAberto(false); signOut(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#E24B4A] hover:bg-[#E24B4A]/10 transition-colors">
                      <LogOut className="h-4 w-4" />Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <TabNav />
      <main className="pb-20 sm:pb-0">{children}</main>
      <FeedbackModal />
    </>
  );
}
