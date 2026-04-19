'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMembros } from '@/hooks/use-membros';

export type PlanoId = 'individual' | 'casal' | 'familia';

export interface PlanoConfig {
  plano: PlanoId;
  isMaster: boolean;
  maxMembros: number;
  perfisVisiveis: { role: string; nome: string; cor: string }[];
  temGeral: boolean;
  temDivisao: boolean;
  temDivisaoMembros: boolean;
  temUpgrade: boolean;
  upgradePara: PlanoId[];
  precoPorMembroExtra: number;
}

export function usePlano(): PlanoConfig {
  const { perfil } = useAuth();
  const { membros } = useMembros();

  const plano    = (perfil?.plano ?? 'casal') as PlanoId;
  const isMaster = perfil?.is_master ?? false;
  const meuRole  = perfil?.role ?? 'membro';

  const CORES = ['#82a1fd', '#ff64ca', '#ffa857', '#01b695'];

  function getPerfisVisiveis() {
    if (!Array.isArray(membros) || membros === undefined) return [];
    if (plano === 'individual') {
      const eu = membros[0];
      return eu ? [{ role: eu.role, nome: eu.nome, cor: eu.cor }] : [];
    }

    const qtd = plano === 'casal' ? 2 : 4;
    // Preencher slots vazios para manter os painéis mesmo sem convite aceito
    const slots = Array(qtd).fill(null).map((_, i) => {
      const m = membros[i];
      return m
        ? { role: m.role, nome: m.nome, cor: m.cor }
        : { role: `slot${i}`, nome: `Membro ${i + 1}`, cor: CORES[i] ?? '#82a1fd' };
    });

    if (plano === 'familia' && !isMaster) {
      // Não-mestre só vê o próprio painel
      const eu = membros.find(m => m.role === meuRole) ?? membros[0];
      return eu ? [{ role: eu.role, nome: eu.nome, cor: eu.cor }] : [];
    }

    return [
      { role: 'casal', nome: 'Geral', cor: '#ffa857' },
      ...slots,
    ];
  }

  return {
    plano,
    isMaster,
    maxMembros: plano === 'individual' ? 1 : plano === 'casal' ? 2 : 4,
    perfisVisiveis: getPerfisVisiveis(),
    temGeral:           plano !== 'individual',
    temDivisao:         plano !== 'individual',
    temDivisaoMembros:  plano === 'familia',
    temUpgrade:         plano !== 'familia',
    upgradePara: plano === 'individual' ? ['casal', 'familia'] : plano === 'casal' ? ['familia'] : [],
    precoPorMembroExtra: 7,
  };
}
