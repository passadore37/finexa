// lib/planos.ts — fonte única de verdade sobre planos e preços

export const PLANOS = {
  individual: {
    id: 'individual',
    nome: 'Individual',
    preco: 24,
    usuarios: 1,
    cor: '#01b695',
    features: ['1 usuário', 'Dashboard completo', 'Metas pessoais', 'Histórico 12 meses', 'PWA nativo'],
  },
  casal: {
    id: 'casal',
    nome: 'Casal',
    preco: 34,
    usuarios: 2,
    cor: '#5330ff',
    features: ['2 usuários', 'Divisão proporcional ao salário', 'Dashboard individual + geral', 'Metas conjuntas', 'Orçamento semanal'],
    destaque: true,
  },
  familia: {
    id: 'familia',
    nome: 'Família',
    preco: 44,
    usuarios: 4,
    cor: '#ffa857',
    features: ['Até 4 usuários', 'Tudo do plano Casal', 'Perfis independentes', 'Visão consolidada', '+R$7/mês por membro extra'],
  },
} as const;

export type PlanoId = keyof typeof PLANOS;

export function getPlano(id: string) {
  return PLANOS[id as PlanoId] ?? PLANOS.casal;
}
