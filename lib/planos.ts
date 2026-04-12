export type PlanoId = 'individual' | 'casal' | 'familia';

export interface Plano {
  id: PlanoId;
  nome: string;
  preco: number;
  maxMembros: number;
  cor: string;
  features: string[];
}

export const PLANOS: Record<PlanoId, Plano> = {
  individual: {
    id: 'individual', nome: 'Individual', preco: 19, maxMembros: 1, cor: '#01b695',
    features: ['Dashboard pessoal completo', 'Metas de poupança', 'Orçamento semanal', 'Relatórios mensais'],
  },
  casal: {
    id: 'casal', nome: 'Casal', preco: 29, maxMembros: 2, cor: '#5330ff',
    features: ['Tudo do Individual', 'Divisão proporcional ao salário', 'Dashboard consolidado do casal', 'Convite para 1 parceiro(a)'],
  },
  familia: {
    id: 'família', nome: 'Família', preco: 39, maxMembros: 4, cor: '#ffa857',
    features: ['Tudo do Casal', 'Até 4 membros inclusos', 'Controle de privacidade', 'R$7 por membro extra'],
  },
};

export const PRECO_MEMBRO_EXTRA = 7;

export function getPlano(id: string): Plano {
  return PLANOS[id as PlanoId] ?? PLANOS.casal;
}

export function getUpgrades(planoAtual: PlanoId): Plano[] {
  if (planoAtual === 'individual') return [PLANOS.casal, PLANOS.familia];
  if (planoAtual === 'casal')      return [PLANOS.familia];
  return []; // família não tem upgrade de plano — só membro extra
}
