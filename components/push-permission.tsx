'use client';

// components/push-permission.tsx
// Banner que solicita permissão de push notification uma única vez
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function PushPermission() {
  const { perfil } = useAuth();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Verificar se push é suportado e se ainda não foi solicitado
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission !== 'default') return;

    const dispensado = localStorage.getItem('push-dispensado');
    if (dispensado) return;

    // Mostrar banner após 3s (não interromper o carregamento)
    const t = setTimeout(() => setVisivel(true), 3000);
    return () => clearTimeout(t);
  }, []);

  async function solicitarPermissao() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setVisivel(false); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Salvar subscription no banco
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          perfil: perfil?.role ?? 'membro',
        }),
      });

      setVisivel(false);
    } catch (err) {
      console.error('[push] Erro ao registrar:', err);
      setVisivel(false);
    }
  }

  function dispensar() {
    localStorage.setItem('push-dispensado', '1');
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:w-80">
      <div className="nb-card bg-card p-4 flex items-start gap-3"
        style={{ boxShadow: '4px 4px 0 #5330ff30' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#5330ff15' }}>
          <Bell className="h-4 w-4" style={{ color: '#5330ff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground">Ativar lembretes?</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Receba notificações para lançar seus gastos e ficar no controle.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={solicitarPermissao}
              className="flex-1 py-2 rounded-lg text-xs font-black text-white"
              style={{ background: '#5330ff' }}>
              Ativar
            </button>
            <button onClick={dispensar}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-muted-foreground bg-secondary border border-border">
              Agora não
            </button>
          </div>
        </div>
        <button onClick={dispensar} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}