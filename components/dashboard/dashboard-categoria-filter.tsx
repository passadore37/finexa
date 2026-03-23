'use client';

/**
 * Hook compartilhado de filtro por categoria.
 * CategoriasPieChart chama onCategoriaSelect quando clica numa fatia.
 * HistoricoView recebe categoriaFiltro e filtra os lançamentos.
 * Dashboard orquestra os dois via este estado.
 */

import { useState, useCallback } from 'react';

export function useCategoriaFiltro() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const toggle = useCallback((cat: string | null) => {
    setCategoriaAtiva(prev => prev === cat ? null : cat);
  }, []);

  const limpar = useCallback(() => setCategoriaAtiva(null), []);

  return { categoriaAtiva, toggle, limpar };
}
