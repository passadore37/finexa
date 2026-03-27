import { useState, useEffect } from 'react';
import type { Perfil } from '@/lib/perfil-config';

export function usePushNotifications(perfil: Perfil) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      verificarAssinatura();
    } else {
      setVerificando(false);
    }
  }, []);

  async function verificarAssinatura() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
      if (sub && Notification.permission !== 'granted') {
          setIsSubscribed(false);
      }
    } catch(e) {
      // Ignorar
    } finally {
      setVerificando(false);
    }
  }

  async function registrar(forcarPerfil?: string) {
    if (!isSupported) return false;
    const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!VAPID_PUBLIC) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
        });
      }

      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, perfil: forcarPerfil || perfil || 'geral' }),
      });
      setIsSubscribed(true);
      return true;
    } catch (e) {
      console.warn('Erro ao registrar push:', e);
      return false;
    }
  }

  return { isSupported, isSubscribed, verificando, registrar };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
