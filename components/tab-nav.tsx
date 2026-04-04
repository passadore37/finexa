'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Target, CalendarDays } from 'lucide-react';

const tabs = [
  { label: 'Gastos', href: '/dashboard', icon: LayoutDashboard, color: 'var(--indigo)' },
  { label: 'Lançar', href: '/lancar', icon: PlusCircle, color: 'var(--teal)' },
  { label: 'Metas', href: '/metas', icon: Target, color: 'var(--magenta)' },
  { label: 'Despesas Fixas', href: '/planejamento', icon: CalendarDays, color: 'var(--orange)' },
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all duration-300 whitespace-nowrap border-2"
                style={active
                  ? { 
                      background: tab.color, 
                      color: '#fff', 
                      borderColor: 'rgba(255,255,255,0.2)',
                      boxShadow: `4px 4px 0px 0px ${tab.color}40`
                    }
                  : { 
                      color: tab.color, 
                      borderColor: 'transparent',
                      background: 'transparent'
                    }
                }
              >
                <Icon 
                  className="h-3.5 w-3.5 flex-shrink-0 transition-all duration-300" 
                  fill={active ? 'rgba(255,255,255,0.25)' : 'none'}
                  strokeWidth={active ? 2.5 : 2}
                />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
