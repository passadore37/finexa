export type Perfil = string;

export const CORES_PERFIL = [
  { cor: '#82a1fd', corSecundaria: '#5330ff', corBg: 'rgba(130,161,253,0.1)' },
  { cor: '#ff64ca', corSecundaria: '#de7ed1', corBg: 'rgba(255,100,202,0.1)' },
  { cor: '#ffa857', corSecundaria: '#e08020', corBg: 'rgba(255,168,87,0.1)' },
  { cor: '#01b695', corSecundaria: '#008257', corBg: 'rgba(1,182,149,0.1)' },
];

// Mantido para compatibilidade com código existente
export const PERFIL_CONFIG: Record<string, {
  cor: string; corSecundaria: string; corBg: string; nome: string; emoji: string;
}> = {
  membro0:  { cor: '#82a1fd', corSecundaria: '#5330ff', corBg: 'rgba(130,161,253,0.1)', nome: 'Membro 1',  emoji: '' },
  membro1: { cor: '#ff64ca', corSecundaria: '#de7ed1', corBg: 'rgba(255,100,202,0.1)', nome: 'Membro 2', emoji: '' },
  casal:    { cor: '#ffa857', corSecundaria: '#e08020', corBg: 'rgba(255,168,87,0.1)',  nome: 'Geral',    emoji: '' },
  membro:   { cor: '#82a1fd', corSecundaria: '#5330ff', corBg: 'rgba(130,161,253,0.1)', nome: 'Eu',       emoji: '' },
  geral:    { cor: '#ffa857', corSecundaria: '#e08020', corBg: 'rgba(255,168,87,0.1)',  nome: 'Geral',    emoji: '' },
};

export function aplicarCorPerfil(perfil: Perfil) {
  if (typeof document === 'undefined') return;
  const config = PERFIL_CONFIG[perfil] ?? PERFIL_CONFIG['membro'];
  document.documentElement.style.setProperty('--primary', config.cor);
  document.documentElement.style.setProperty('--ring', config.cor);
}

export function calcularProporcoes(salarios: Record<string, number>): Record<string, number> {
  const total = Object.values(salarios).reduce((s, v) => s + v, 0);
  if (total === 0) {
    const n = Object.keys(salarios).length || 1;
    return Object.fromEntries(Object.keys(salarios).map(k => [k, 1 / n]));
  }
  return Object.fromEntries(Object.entries(salarios).map(([k, v]) => [k, v / total]));
}

export function calcularProporcoesSimples(salarioMembro0: number, salarioMembro1: number) {
  const props = calcularProporcoes({ membro0: salarioMembro0, membro1: salarioMembro1 });
  return { membro0: props.membro0 ?? 0.5, membro1: props.membro1 ?? 0.5 };
}

export function calcularParteFixa(valorTotal: number, perfil: string, salarioMembro0: number, salarioMembro1: number): number {
  const props = calcularProporcoesSimples(salarioMembro0, salarioMembro1);
  return valorTotal * (props[perfil as 'membro0' | 'membro1'] ?? 0);
}

export function parseDivisao(divisao: string | undefined, perfil: string, membros: string[] = ['membro0', 'membro1']): number | null {
  if (!divisao || divisao === 'pessoal') return null;
  if (divisao === '50/50') return 0.5;
  const partes = divisao.split('/').map(Number);
  if (partes.length >= 2 && partes.every(p => !isNaN(p))) {
    const total = partes.reduce((s, p) => s + p, 0);
    if (total === 0) return null;
    const idx = membros.indexOf(perfil);
    if (idx >= 0 && idx < partes.length) return partes[idx] / total;
  }
  return null;
}

export function calcularValorParMembro(
  transacao: { valor: number; perfil?: string; responsavel?: string; divisao?: string; recorrente?: boolean },
  membroAlvo: string,
  salarios: Record<string, number>
): number {
  const { valor, divisao, recorrente } = transacao;
  const responsavel = transacao.perfil || transacao.responsavel;
  const props = calcularProporcoes(salarios);
  const propMembro = props[membroAlvo] ?? 0;
  if (recorrente) return valor * propMembro;
  if (divisao === 'pessoal') return responsavel === membroAlvo ? valor : 0;
  const membros = Object.keys(salarios);
  const prop = parseDivisao(divisao, membroAlvo, membros);
  if (prop !== null) return valor * prop;
  if (responsavel === membroAlvo) return valor;
  if (!responsavel || responsavel === 'casal' || responsavel === 'geral') return valor * propMembro;
  return 0;
}

export function transacaoVisivel(
  transacao: { valor: number; perfil?: string; responsavel?: string; divisao?: string; recorrente?: boolean; totalParcelas?: number },
  membroAlvo: string,
  salarios: Record<string, number>
): boolean {
  if (transacao.totalParcelas && transacao.totalParcelas > 1) return true;
  return calcularValorParMembro(transacao, membroAlvo, salarios) > 0;
}
