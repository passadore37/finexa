// hooks/use-categorias.ts — carrega categorias padrão + customizadas
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORIAS_DISPONIVEIS, getCorCategoria } from '@/lib/types';

export interface CategoriaCustom {
  id: string;
  nome: string;
  cor: string;
  perfis: string[]; // quais perfis veem na aba lançar. [] = todos
  criada_por: string;
}

export function useCategorias(perfilAtivo?: string) {
  const [customizadas, setCustomizadas] = useState<CategoriaCustom[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/categorias');
      const json = await res.json();
      if (json.success) setCustomizadas(json.data || []);
    } catch { /* silencioso */ }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Categorias padrão — sempre visíveis para todos
  const categoriasPadrao = CATEGORIAS_DISPONIVEIS.map(nome => ({
    nome,
    cor: getCorCategoria(nome),
    customizada: false,
    perfis: [] as string[],
  }));

  // Categorias customizadas filtradas pelo perfil ativo
  // Se perfis=[] → visível para todos
  // Se perfis=['membro0'] → só aparece para Membro 1 na aba lançar
  const categoriasCustomFiltradas = customizadas
    .filter(c => {
      if (!perfilAtivo || perfilAtivo === 'casal') return true; // casal vê tudo
      if (!c.perfis || c.perfis.length === 0) return true;      // sem restrição = todos
      return c.perfis.includes(perfilAtivo);                    // ou específico do perfil
    })
    .map(c => ({
      nome: c.nome,
      cor: c.cor,
      customizada: true,
      perfis: c.perfis,
      id: c.id,
    }));

  // Cor de qualquer categoria (padrão ou custom)
  function getCor(nome: string): string {
    const custom = customizadas.find(c => c.nome === nome);
    if (custom) return custom.cor;
    return getCorCategoria(nome);
  }

  async function criarCategoria(nome: string, cor: string, perfis: string[], criada_por: string) {
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cor, perfis, criada_por }),
    });
    const json = await res.json();
    if (json.success) {
      setCustomizadas(prev => [...prev, json.data]);
      return { ok: true };
    }
    return { ok: false, erro: json.error };
  }

  async function deletarCategoria(id: string) {
    await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' });
    setCustomizadas(prev => prev.filter(c => c.id !== id));
  }

  return {
    categoriasPadrao,
    categoriasCustom: categoriasCustomFiltradas,
    todasCustomizadas: customizadas,
    carregando,
    getCor,
    criarCategoria,
    deletarCategoria,
    recarregar: carregar,
  };
}
