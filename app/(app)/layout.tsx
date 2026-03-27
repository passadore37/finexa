import { TabNav } from '@/components/tab-nav'
import { Logo } from '@/components/logo'

function AppHeader() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <span className="text-base font-bold text-foreground leading-none tracking-tight">Finexa</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Seu dinheiro, com clareza.</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

function ThemeToggle() {
  return (
    <button
      id="theme-toggle"
      className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      title="Alternar tema"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41M11 8a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <TabNav />
      <main>{children}</main>
    </>
  )
}
