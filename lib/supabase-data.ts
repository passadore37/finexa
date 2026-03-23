import { supabase } from './supabase';
import type { Transacao, DadosPlanilha, ContaFixaConfig } from './types';

function getPrimeiroDiaMes(offset = 0): string {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1).toISOString().split('T')[0];
}

function getUltimoDiaMes(offset = 0): string {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() + offset + 1, 0).toISOString().split('T')[0];
}

function getMesAtualLabel(): string {
  const hoje = new Date();
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${meses[hoje.getMonth()]}-${String(hoje.getFullYear()).slice(2)}`;
}

// Retorna o primeiro valor numérico válido e positivo
function primeiroValido(...vals: (number | string | null | undefined)[]): number {
  for (const v of vals) {
    if (v === null || v === undefined) continue;
    const n = Number(v);
    if (!isNaN(n) && isFinite(n) && n > 0) return n;
  }
  return 0;
}

async function garantirConfiguracaoMes(mes: string) {
  const { data } = await supabase
    .from('configuracao_mensal')
    .select('*')
    .eq('mes', mes)
    .single();

  if (!data) {
    const { data: novo } = await supabase
      .from('configuracao_mensal')
      .insert({ mes, limite: 9000, salario_leticia: 0, salario_giovanna: 0 })
      .select()
      .single();
    return novo;
  }
  return data;
}

export async function fetchDadosPlanilha(): Promise<DadosPlanilha> {
  const mesAtual = getMesAtualLabel();

  const [resTransacoes, resPlanejamento] = await Promise.all([
    supabase
      .from('transacoes')
      .select('*')
      .gte('data', getPrimeiroDiaMes(-1))
      .lte('data', getUltimoDiaMes(0))
      .order('data', { ascending: false }),

    supabase
      .from('planejamento')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  if (resTransacoes.error) {
    throw new Error(`Erro ao buscar transações: ${resTransacoes.error.message}`);
  }

  const config = await garantirConfiguracaoMes(mesAtual);
  const pl = resPlanejamento.data;

  // Salários com fallback em cadeia — env vars como último recurso
  const salarioLeticia = primeiroValido(
    pl?.salario_leticia,
    config?.salario_leticia,
    process.env.SALARIO_LETICIA,
  );
  const salarioGiovanna = primeiroValido(
    pl?.salario_giovanna,
    config?.salario_giovanna,
    process.env.SALARIO_GIOVANNA,
  );
  const percentualInvestimento = primeiroValido(pl?.percentual_investimento, 10);
  const limiteMensal = primeiroValido(config?.limite, 9000);
  const contasFixasConfig: ContaFixaConfig[] = Array.isArray(pl?.contas_fixas) ? pl.contas_fixas : [];

  const rows = resTransacoes.data || [];
  const hoje = new Date();

  const transacoes: Transacao[] = rows.map((row) => ({
    id: row.id,
    data: new Date(row.data + 'T12:00:00'),
    descricao: row.descricao,
    categoria: row.categoria,
    // Ler tipo do banco — fallback para 'despesa' se não existir
    tipo: (row.tipo === 'receita' ? 'receita' : 'despesa') as 'receita' | 'despesa',
    valor: Number(row.valor),
    responsavel: row.perfil || undefined,
    divisao: row.divisao || '50/50',
    recorrente: Boolean(row.recorrente),
    parcelaAtual: Number(row.parcela_atual) || 1,
    totalParcelas: Number(row.total_parcelas) || 1,
    valorTotalCompromisso: row.valor_total_compromisso ? Number(row.valor_total_compromisso) : undefined,
  }));

  // Salários como receitas do mês atual
  if (salarioLeticia > 0) {
    transacoes.push({
      id: 'sal-let',
      data: new Date(`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-05T12:00:00`),
      descricao: 'Salário Letícia',
      categoria: 'Salário',
      tipo: 'receita',
      valor: salarioLeticia,
      responsavel: 'leticia',
      recorrente: true,
    });
  }

  if (salarioGiovanna > 0) {
    transacoes.push({
      id: 'sal-gio',
      data: new Date(`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-05T12:00:00`),
      descricao: 'Salário Giovanna',
      categoria: 'Salário',
      tipo: 'receita',
      valor: salarioGiovanna,
      responsavel: 'giovanna',
      recorrente: true,
    });
  }

  // Nota: contas fixas do planejamento NÃO são injetadas como transações sintéticas.
  // Elas são usadas apenas para cálculo de metodologia e rateio por perfil.
  // As transações reais vêm do Supabase (lançadas via n8n ou formulário).

  return {
    transacoes,
    limiteMensal,
    metaEmergencia: primeiroValido(process.env.META_EMERGENCIA, 30000),
    orcamentoCategoria: {},
    salarioLeticia,
    salarioGiovanna,
    percentualInvestimento,
    contasFixasConfig,
  };
}

export function gerarDadosDemo(): DadosPlanilha {
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();
  const antData = new Date(ano, mes - 1, 10);

  const transacoes: Transacao[] = [
    { id: 'sal-let', data: new Date(ano, mes, 1), descricao: 'Salário Letícia', categoria: 'Salário', tipo: 'receita', valor: 8500, responsavel: 'leticia', recorrente: true },
    { id: 'sal-gio', data: new Date(ano, mes, 1), descricao: 'Salário Giovanna', categoria: 'Salário', tipo: 'receita', valor: 6500, responsavel: 'giovanna', recorrente: true },
    { id: 'aluguel', data: new Date(ano, mes, 5), descricao: 'Aluguel', categoria: 'Moradia', tipo: 'despesa', valor: 2200, recorrente: true },
    { id: 'condo', data: new Date(ano, mes, 5), descricao: 'Condomínio', categoria: 'Moradia', tipo: 'despesa', valor: 650, recorrente: true },
    { id: 'internet', data: new Date(ano, mes, 5), descricao: 'Internet', categoria: 'Assinaturas', tipo: 'despesa', valor: 120, recorrente: true },
    { id: 'streaming', data: new Date(ano, mes, 5), descricao: 'Streaming', categoria: 'Assinaturas', tipo: 'despesa', valor: 69, recorrente: true },
    { id: 'saude', data: new Date(ano, mes, 5), descricao: 'Plano de Saúde', categoria: 'Saúde', tipo: 'despesa', valor: 890, recorrente: true },
    { id: 'gas', data: new Date(ano, mes, 5), descricao: 'Gás', categoria: 'Casa', tipo: 'despesa', valor: 80, recorrente: true },
    { id: 'energia', data: new Date(ano, mes, 5), descricao: 'Energia', categoria: 'Casa', tipo: 'despesa', valor: 180, recorrente: true },
    { id: 'sofa', data: new Date(ano, mes, 15), descricao: 'Sofá Retrátil', categoria: 'Casa', tipo: 'despesa', valor: 350, parcelaAtual: 3, totalParcelas: 10 },
    { id: 'cel', data: new Date(ano, mes, 10), descricao: 'iPhone 15', categoria: 'Compras', tipo: 'despesa', valor: 520, parcelaAtual: 5, totalParcelas: 12 },
    { id: 'alim', data: new Date(ano, mes, 8), descricao: 'Supermercado', categoria: 'Alimentação', tipo: 'despesa', valor: 1050, responsavel: 'casal', divisao: '50/50' },
    { id: 'transp-let', data: new Date(ano, mes, 9), descricao: 'Uber', categoria: 'Transporte', tipo: 'despesa', valor: 180, responsavel: 'leticia' },
    { id: 'transp-gio', data: new Date(ano, mes, 9), descricao: 'Combustível', categoria: 'Transporte', tipo: 'despesa', valor: 130, responsavel: 'giovanna' },
    { id: 'lazer', data: new Date(ano, mes, 11), descricao: 'Cinema + jantar', categoria: 'Lazer', tipo: 'despesa', valor: 320, responsavel: 'casal', divisao: '50/50' },
    { id: 'gatos', data: new Date(ano, mes, 12), descricao: 'Pet shop + ração', categoria: 'Gatos', tipo: 'despesa', valor: 280, responsavel: 'casal', divisao: '50/50' },
    { id: 'saude-let', data: new Date(ano, mes, 14), descricao: 'Consulta médica', categoria: 'Saúde', tipo: 'despesa', valor: 250, responsavel: 'leticia' },
    // Mês anterior
    { id: 'ant-sal-let', data: antData, descricao: 'Salário Letícia', categoria: 'Salário', tipo: 'receita', valor: 8500, responsavel: 'leticia', recorrente: true },
    { id: 'ant-sal-gio', data: antData, descricao: 'Salário Giovanna', categoria: 'Salário', tipo: 'receita', valor: 6500, responsavel: 'giovanna', recorrente: true },
    { id: 'ant-aluguel', data: antData, descricao: 'Aluguel', categoria: 'Moradia', tipo: 'despesa', valor: 2200, recorrente: true },
    { id: 'ant-condo', data: antData, descricao: 'Condomínio', categoria: 'Moradia', tipo: 'despesa', valor: 650, recorrente: true },
    { id: 'ant-alim', data: antData, descricao: 'Alimentação', categoria: 'Alimentação', tipo: 'despesa', valor: 920, responsavel: 'casal', divisao: '50/50' },
    { id: 'ant-transp', data: antData, descricao: 'Transporte', categoria: 'Transporte', tipo: 'despesa', valor: 280 },
    { id: 'ant-lazer', data: antData, descricao: 'Lazer', categoria: 'Lazer', tipo: 'despesa', valor: 290, responsavel: 'casal', divisao: '50/50' },
  ];

  const contasFixasConfig = [
    { id: '1', descricao: 'Aluguel', valor: 2200, categoria: 'Moradia' },
    { id: '2', descricao: 'Condomínio', valor: 650, categoria: 'Moradia' },
    { id: '3', descricao: 'Plano de Saúde', valor: 890, categoria: 'Saúde' },
    { id: '4', descricao: 'Internet', valor: 120, categoria: 'Assinaturas' },
    { id: '5', descricao: 'Streaming', valor: 69, categoria: 'Assinaturas' },
    { id: '6', descricao: 'Gás', valor: 80, categoria: 'Casa' },
    { id: '7', descricao: 'Energia', valor: 180, categoria: 'Casa' },
  ];

  return {
    transacoes,
    limiteMensal: 9000,
    metaEmergencia: 30000,
    orcamentoCategoria: {},
    salarioLeticia: 8500,
    salarioGiovanna: 6500,
    percentualInvestimento: 10,
    contasFixasConfig,
  };
}
