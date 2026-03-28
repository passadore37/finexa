'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Target, PieChart } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancar', label: 'Lançar', icon: Receipt },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/planejamento', label: 'Planos', icon: PieChart },
]

export function TabNav() {
  const pathname = usePathname()

  return (
    <nav className="tab-nav-glass animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
      <div className="flex items-center justify-around h-16 relative px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 group ${
                isActive ? 'text-[#5330ff]' : 'text-[#08080f]/30 hover:text-[#08080f]/50'
              }`}
            >
              <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                isActive 
                ? 'bg-[#5330ff]/10 scale-110 shadow-lg shadow-[#5330ff]/5' 
                : 'bg-transparent group-hover:bg-black/[0.03]'
              }`}>
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2} 
                  className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                />
              </div>
              <span className={`text-[8px] font-black mt-1.5 uppercase tracking-[0.2em] transition-all duration-500 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 scale-90'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-[#5330ff] rounded-full shadow-[0_0_12px_rgba(83,48,255,0.8)] animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
