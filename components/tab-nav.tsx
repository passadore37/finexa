'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, PlusCircle, Target } from 'lucide-react';

export function TabNav() {
  const pathname = usePathname();
  const tabs = [
    { label: 'Gastos', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Lançar', href: '/lancar', icon: PlusCircle },
    { label: 'Metas', href: '/metas', icon: Target },
    { label: 'Contas Fixas', href: '/planejamento', icon: CalendarDays },
  ];
  return (
    <div className="border-b border-border bg-card sticky top-[73px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 py-2">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[40px] ${
                  active ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
