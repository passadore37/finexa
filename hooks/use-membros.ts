// hooks/use-membros.ts — carrega membros reais da família do banco
'use client';

import { useState, useEffect } from 'react';
import { CORES_PERFIL } from '@/lib/perfil-config';

export interface Membro {
  id: string;
  nome: string;
  role: string;
  cor: string;
  corSecundaria: string;
  corBg: string;
}

export interface MembrosContexto {
  membros: Membro[];
  carregando: boolean;
  // Perfil "Geral" sempre disponível no casal/família
  temGeral: boolean;
  // Encontrar membro pelo role
  getMembro: (role: string) => Membro | undefined;
  // Cor de qualquer perfil — inclui 'casal'/'geral'
  getCorPerfil: (role: string) => string;
  getNomePerfil: (role: string) => string;
}

export function useMembros(): MembrosContexto {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/perfis')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const lista = (data.data as any[]).map((p, i) => ({
            id:           p.id,
            nome:         p.nome,
            role:         p.role,
            cor:          CORES_PERFIL[i % CORES_PERFIL.length].cor,
            corSecundaria: CORES_PERFIL[i % CORES_PERFIL.length].corSecundaria,
            corBg:        CORES_PERFIL[i % CORES_PERFIL.length].corBg,
          }));
          setMembros(lista);
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const temGeral = membros.length > 1;

  function getMembro(role: string) {
    return membros.find(m => m.role === role);
  }

  function getCorPerfil(role: string): string {
    if (role === 'casal' || role === 'geral') return '#ffa857';
    return getMembro(role)?.cor ?? '#82a1fd';
  }

  function getNomePerfil(role: string): string {
    if (role === 'casal' || role === 'geral') return 'Geral';
    return getMembro(role)?.nome ?? role;
  }

  return { membros, carregando, temGeral, getMembro, getCorPerfil, getNomePerfil };
}
