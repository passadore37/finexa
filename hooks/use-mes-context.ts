// hooks/use-mes-context.ts — mês visualizado globalmente entre todas as abas
'use client';

import { useState, useEffect } from 'react';

export function useMesContext() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('finexa_mes');
      if (saved) {
        const { mes: m, ano: a } = JSON.parse(saved);
        // Não restaurar meses futuros
        const hoje2 = new Date();
        if (typeof m === 'number' && typeof a === 'number') {
          const salvo = new Date(a, m, 1);
          const atual = new Date(hoje2.getFullYear(), hoje2.getMonth(), 1);
          if (salvo <= atual) { setMes(m); setAno(a); }
        }
      }
    } catch {}
    setMounted(true);
  }, []);

  function navegarMes(novoMes: number, novoAno: number) {
    setMes(novoMes);
    setAno(novoAno);
    try { localStorage.setItem('finexa_mes', JSON.stringify({ mes: novoMes, ano: novoAno })); } catch {}
  }

  function irParaHoje() {
    const hoje2 = new Date();
    navegarMes(hoje2.getMonth(), hoje2.getFullYear());
  }

  const ehMesAtual = mes === hoje.getMonth() && ano === hoje.getFullYear();

  return { mes, ano, navegarMes, irParaHoje, ehMesAtual, mounted };
}
