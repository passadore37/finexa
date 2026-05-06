'use client';

import { useState, useEffect } from 'react';

export function useUsuarioContext() {
  const [usuariaAtiva, setUsuariaAtiva] = useState<string>('casal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('finexa_perfil');
    // Aceitar apenas roles válidos do sistema atual — limpa valores legados
    // como 'leticia', 'giovanna' etc que quebravam a seleção de perfil
    const rolesValidos = ['casal', 'geral', 'master', 'membro', 'membro0', 'membro1'];
    if (saved && rolesValidos.includes(saved)) {
      setUsuariaAtiva(saved);
    } else if (saved) {
      // Role inválido/legado — limpar e voltar para 'casal'
      localStorage.removeItem('finexa_perfil');
    }
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