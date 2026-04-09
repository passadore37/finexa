// hooks/use-plano.ts — feature flags por plano
'use client';

import { useAuth } from '@/hooks/use-auth';

export type PlanoAtivo = 'individual' | 'casal' | 'familia';

interface PlanoFeatures {
  plano: PlanoAtivo;
  maxMembros: number;
  temDivisaoProporcional: boolean;  // casal + família
  temPerfilIndividual: boolean;     // casal + família
  temMetasConjuntas: boolean;       // casal + família
  temConvite: boolean;              // casal + família
  temVisaoGeral: boolean;           // casal + família
  temPlanejamentoFamilia: boolean;  // só família
  nomePerfisDisponiveis: string[];  // perfis que aparecem no seletor
}

export function usePlano(): PlanoFeatures {
  const { perfil } = useAuth();
  const plano = (perfil?.plano ?? 'casal') as PlanoAtivo;

  const base = {
    plano,
    maxMembros: plano === 'individual' ? 1 : plano === 'casal' ? 2 : 4,
  };

  if (plano === 'individual') {
    return {
      ...base,
      temDivisaoProporcional: false,
      temPerfilIndividual:    false,
      temMetasConjuntas:      false,
      temConvite:             false,
      temVisaoGeral:          false,
      temPlanejamentoFamilia: false,
      nomePerfisDisponiveis:  ['individual'],
    };
  }

  if (plano === 'casal') {
    return {
      ...base,
      temDivisaoProporcional: true,
      temPerfilIndividual:    true,
      temMetasConjuntas:      true,
      temConvite:             true,
      temVisaoGeral:          true,
      temPlanejamentoFamilia: false,
      nomePerfisDisponiveis:  ['casal', perfil?.role ?? 'membro'],
    };
  }

  // família
  return {
    ...base,
    temDivisaoProporcional: true,
    temPerfilIndividual:    true,
    temMetasConjuntas:      true,
    temConvite:             true,
    temVisaoGeral:          true,
    temPlanejamentoFamilia: true,
    nomePerfisDisponiveis:  ['familia'],
  };
}
