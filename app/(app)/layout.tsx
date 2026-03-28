'use client';

import { Logo } from '@/components/logo';
import { TabNav } from '@/components/tab-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
          <ThemeToggle />
        </div>
      </header>
      <TabNav />
      <main className="pb-20 sm:pb-0">{children}</main>
    </>
  );
}
