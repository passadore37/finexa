import { TabNav } from '@/components/tab-nav'
import { Logo } from '@/components/logo'

function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block">
            <span className="text-base font-black text-[#08080f] leading-none tracking-tight">Finexa</span>
            <p className="text-[10px] font-bold text-[#08080f]/40 uppercase tracking-widest mt-0.5">Seu dinheiro, com clareza.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5330ff] to-[#ff64ca] shadow-lg border-2 border-white" />
        </div>
      </div>
    </header>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <AppHeader />
      <main className="pt-16 pb-24">
        {children}
      </main>
      <TabNav />
    </div>
  )
}
