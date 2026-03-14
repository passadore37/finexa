'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Target, CalendarDays } from 'lucide-react';

const tabs = [
  { label: 'Gastos', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lançar', href: '/lancar', icon: PlusCircle },
  { label: 'Metas', href: '/metas', icon: Target },
  { label: 'Contas Fixas', href: '/planejamento', icon: CalendarDays },
];

export function TabNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-border bg-card sticky top-[61px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 py-1.5 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                style={active
                  ? { background: 'var(--indigo)', color: '#fff', border: '1.5px solid rgba(130,161,253,0.4)' }
                  : { color: 'var(--muted-foreground)', border: '1.5px solid transparent' }
                }
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
