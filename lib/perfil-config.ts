// perfil-config.ts — identidade visual e lógica de rateio
// Escalável para N membros (Casal, Família, etc.)

export type Perfil = 'leticia' | 'giovanna' | 'casal';

export const PERFIL_CONFIG: Record<Perfil, {
  cor: string; corSecundaria: string; corBg: string; nome: string; emoji: string;
}> = {
  leticia:  { cor: '#82a1fd', corSecundaria: '#5330ff', corBg: 'rgba(130,161,253,0.1)', nome: 'Letícia',  emoji: '' },
  giovanna: { cor: '#ff64ca', corSecundaria: '#de7ed1', corBg: 'rgba(255,100,202,0.1)', nome: 'Giovanna', emoji: '' },
  casal:    { cor: '#ffa857', corSecundaria: '#e08020', corBg: 'rgba(255,168,87,0.1)',  nome: 'Geral',    emoji: '' },
};

export function aplicarCorPerfil(perfil: Perfil) {
  if (typeof document === 'undefined') return;
  const config = PERFIL_CONFIG[perfil];
  document.documentElement.style.setProperty('--primary', config.cor);
  document.documentElement.style.setProperty('--ring', config.cor);
}

// ─────────────────────────────────────────────────────────────
// LÓGICA DE RATEIO — escalável para N membros
// ─────────────────────────────────────────────────────────────

/**
 * Calcula proporção de cada membro baseado nos salários.
 * Regras:
 * - Salário 0 → não participa da divisão (proporção = 0)
 * - Todos com salário 0 → fallback 50/50 (ou igual entre N membros)
 */
export function calcularProporcoes(
  salarios: Record<string, number>
): Record<string, number> {
  const total = Object.values(salarios).reduce((s, v) => s + v, 0);

  if (total === 0) {
    // Fallback: dividir igualmente entre todos os membros
    const n = Object.keys(salarios).length || 1;
    return Object.fromEntries(Object.keys(salarios).map(k => [k, 1 / n]));
  }

  return Object.fromEntries(
    Object.entries(salarios).map(([k, v]) => [k, v / total])
  );
}

// Atalho para o par Letícia/Giovanna (compatibilidade)
export function calcularProporcoesSimples(
  salarioLeticia: number,
  salarioGiovanna: number
): { leticia: number; giovanna: number } {
  const props = calcularProporcoes({ leticia: salarioLeticia, giovanna: salarioGiovanna });
  return { leticia: props.leticia, giovanna: props.giovanna };
}

/**
 * Calcula a parte de um valor fixo (recorrente) para um membro específico.
 * Proporcional ao salário. Salário 0 = não paga nada.
 */
export function calcularParteFixa(
  valorTotal: number,
  perfil: string,
  salarioLeticia: number,
  salarioGiovanna: number
): number {
  const props = calcularProporcoesSimples(salarioLeticia, salarioGiovanna);
  return valorTotal * (props[perfil as 'leticia' | 'giovanna'] ?? 0);
}

/**
 * Interpreta o campo `divisao` de uma transação e retorna a proporção do membro.
 *
 * Regras:
 * - 'pessoal'  → null (tratado externamente: 100% de quem lançou)
 * - '50/50'    → 0.5
 * - '60/40'    → leticia=0.6, giovanna=0.4
 * - 'N/M/...'  → divide entre N membros proporcionalmente
 * - null/''    → null (sem divisão explícita)
 */
export function parseDivisao(
  divisao: string | undefined,
  perfil: string,
  membros: string[] = ['leticia', 'giovanna']
): number | null {
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

/**
 * FUNÇÃO CENTRAL DE RATEIO
 *
 * Dado uma transação e um perfil, retorna o valor que pertence a esse perfil.
 *
 * Regras (em ordem de precedência):
 * 1. recorrente=true → proporcional ao salário
 * 2. divisao='pessoal' → 100% de quem lançou (perfil da transação), 0% para os demais
 * 3. divisao='50/50' → 50% cada
 * 4. divisao='60/40' (ou qualquer X/Y) → proporção explícita
 * 5. responsavel === perfil (sem divisao) → 100%
 * 6. responsavel='casal' ou sem responsavel → proporcional ao salário (fallback)
 * 7. responsavel é outro perfil → 0%
 */
export function calcularValorParMembro(
  transacao: {
    valor: number;
    perfil?: string;
    responsavel?: string;
    divisao?: string;
    recorrente?: boolean;
  },
  membroAlvo: string,
  salarios: Record<string, number>
): number {
  const { valor, divisao, recorrente } = transacao;
  const responsavel = transacao.perfil || transacao.responsavel;
  const props = calcularProporcoes(salarios);
  const propMembro = props[membroAlvo] ?? 0;

  // 1. Fixas recorrentes → proporcional ao salário
  if (recorrente) {
    return valor * propMembro;
  }

  // 2. Pessoal → 100% de quem lançou
  if (divisao === 'pessoal') {
    return responsavel === membroAlvo ? valor : 0;
  }

  // 3. Divisão explícita (50/50, 60/40, etc.)
  const membros = Object.keys(salarios);
  const prop = parseDivisao(divisao, membroAlvo, membros);
  if (prop !== null) {
    return valor * prop;
  }

  // 4. Responsável é este membro
  if (responsavel === membroAlvo) {
    return valor;
  }

  // 5. Casal / sem responsável → proporcional ao salário
  if (!responsavel || responsavel === 'casal') {
    return valor * propMembro;
  }

  // 6. É de outro membro → não pertence a este
  return 0;
}

/**
 * Verifica se uma transação é visível para um membro.
 * Visível = tem valor > 0 para esse membro.
 */
export function transacaoVisivel(
  transacao: {
    valor: number;
    perfil?: string;
    responsavel?: string;
    divisao?: string;
    recorrente?: boolean;
    totalParcelas?: number;
  },
  membroAlvo: string,
  salarios: Record<string, number>
): boolean {
  // Parceladas sempre visíveis (para calcular compromisso futuro)
  if (transacao.totalParcelas && transacao.totalParcelas > 1) return true;

  return calcularValorParMembro(transacao, membroAlvo, salarios) > 0;
}
