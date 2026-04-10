'use client';

import { useState, useEffect } from 'react';

export function useUsuarioContext() {
  const [usuariaAtiva, setUsuariaAtiva] = useState<string>('casal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('finexa_perfil');
    if (saved) setUsuariaAtiva(saved);
    setMounted(true);
  }, []);

  const handleChange = (perfil: string) => {
    setUsuariaAtiva(perfil);
    localStorage.setItem('finexa_perfil', perfil);
  };

  return { usuariaAtiva, setUsuariaAtiva: handleChange, mounted };
}

export function filtrarTransacoesPorUsuaria(transacoes: any[], usuaria: string) {
  if (usuaria === 'casal' || usuaria === 'geral') return transacoes;
  return transacoes.filter((t: any) =>
    t.perfil === usuaria || t.responsavel === usuaria ||
    t.responsavel === 'casal' || !t.responsavel
  );
}
