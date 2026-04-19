'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMembros } from '@/hooks/use-membros';

export type PlanoId = 'individual' | 'casal';

export interface PlanoConfig {
  plano: PlanoId;
  isMaster: boolean;
  maxMembros: number;
  perfisVisiveis: { role: string; nome: string; cor: string }[];
  temGeral: boolean;
  temDivisao: boolean;
  temUpgrade: boolean;
}

export function usePlano(): PlanoConfig {
  const { perfil } = useAuth();
  const { membros } = useMembros();

  const planoRaw = perfil?.plano ?? 'casal';
  const plano    = (planoRaw === 'familia' ? 'casal' : planoRaw) as PlanoId;
  const isMaster = perfil?.is_master ?? false;

  const CORES = ['#82a1fd', '#ff64ca'];

  function getPerfisVisiveis() {
    if (!Array.isArray(membros)) return [];

    if (plano === 'individual') {
      const eu = membros[0];
      return eu ? [{ role: eu.role, nome: eu.nome, cor: eu.cor }] : [];
    }

    // Casal: Geral + 2 painéis individuais
    const slots = [0, 1].map(i => {
      const m = membros[i];
      return m
        ? { role: m.role, nome: m.nome, cor: m.cor }
        : { role: `slot${i}`, nome: `Membro ${i + 1}`, cor: CORES[i] };
    });

    return [
      { role: 'casal', nome: 'Geral', cor: '#ffa857' },
      ...slots,
    ];
  }

  return {
    plano,
    isMaster,
    maxMembros:     plano === 'individual' ? 1 : 2,
    perfisVisiveis: getPerfisVisiveis(),
    temGeral:       plano === 'casal',
    temDivisao:     plano === 'casal',
    temUpgrade:     plano === 'individual',
  };
}
