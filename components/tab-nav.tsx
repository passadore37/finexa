'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancar', label: 'Lançar', icon: PlusCircle },
  { href: '/metas', label: 'Metas', icon: Target },
] as const;

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around max-w-7xl mx-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 flex-1 text-[11px] font-medium transition-colors',
                ativo ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={ativo ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" fill="none" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
