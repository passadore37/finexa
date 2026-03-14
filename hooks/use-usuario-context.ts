import { useState, useEffect } from 'react';
import type { Perfil } from '@/lib/perfil-config';

export function useUsuarioContext() {
  const [usuariaAtiva, setUsuariaAtiva] = useState<Perfil>('casal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('finexa_perfil');
    if (saved && ['leticia', 'giovanna', 'casal'].includes(saved)) {
      setUsuariaAtiva(saved as Perfil);
    }
    setMounted(true);
  }, []);

  const handleChange = (perfil: Perfil) => {
    setUsuariaAtiva(perfil);
    localStorage.setItem('finexa_perfil', perfil);
  };

  return { usuariaAtiva, setUsuariaAtiva: handleChange, mounted };
}

export function filtrarTransacoesPorUsuaria(transacoes: any[], usuaria: Perfil) {
  if (usuaria === 'casal') return transacoes;
  return transacoes.filter((t: any) =>
    t.responsavel === usuaria || t.responsavel === 'casal' || !t.responsavel
  );
}
