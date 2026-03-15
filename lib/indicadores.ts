import type {
  Transacao, DadosPlanilha, IndicadoresFinanceiros, EvolucaoMensal,
  DespesaPorCategoria, DadosProjecaoBar, Parcelada, MetodologiaOrcamento,
  DadosSemana, Alerta, Sugestao, IndicadoresPerfil, ProjecaoFinanceira,
} from './types';
import { calcularProporcoes, calcularParteFixa } from './perfil-config';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function filtrarPorMes(ts: Transacao[], mes: number, ano: number) {
  return ts.filter(t => {
    const d = new Date(t.data);
    return d.getMonth() === mes && d.getFullYear() === ano;
  });
}

function calcularTotais(ts: Transacao[]) {
  return ts.reduce(
    (acc, t) => {
      if (t.tipo === 'receita') acc.receitas += t.valor;
      else acc.despesas += t.valor;
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );
}

function calcularEvolucaoMensal(ts: Transacao[]): EvolucaoMensal[] {
  const hoje = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const tot = calcularTotais(filtrarPorMes(ts, d.getMonth(), d.getFullYear()));
    return { mes: MESES[d.getMonth()], receitas: tot.receitas, despesas: tot.despesas, saldo: tot.receitas - tot.despesas };
  });
}

function calcularDespesasPorCategoria(ts: Transacao[]): DespesaPorCategoria[] {
  const hoje = new Date();
  const despesas = filtrarPorMes(ts, hoje.getMonth(), hoje.getFullYear())
    .filter(t => t.tipo === 'despesa' && t.categoria !== 'Salário');
  const porCat: Record<string, number> = {};
  let total = 0;
  despesas.forEach(t => { porCat[t.categoria] = (porCat[t.categoria] || 0) + t.valor; total += t.valor; });
  return Object.entries(porCat)
    .map(([categoria, valor]) => ({ categoria, valor, percentual: total > 0 ? valor / total * 100 : 0 }))
    .sort((a, b) => b.valor - a.valor);
}

function parseDivisaoParaPerfil(divisao: string | undefined, perfil: 'leticia' | 'giovanna'): number | null {
  if (!divisao) return null;
  if (divisao === '50/50') return 0.5;
  const partes = divisao.split('/');
  if (partes.length === 2) {
    const a = parseFloat(partes[0]);
    const b = parseFloat(partes[1]);
    if (!isNaN(a) && !isNaN(b) && (a + b) > 0) {
      return perfil === 'leticia' ? a / (a + b) : b / (a + b);
    }
  }
  return null;
}

function calcularValorParaPerfil(
  t: Transacao,
  perfil: 'leticia' | 'giovanna',
  propPerfil: number
): number {
  if (t.recorrente) {
    // Fixas: usar proporção do salário (ou a divisão explícita, se for um ratio válido)
    const prop = parseDivisaoParaPerfil(t.divisao, perfil);
    return t.valor * (prop ?? propPerfil);
  }
  if (t.responsavel === perfil) {
    return t.valor;
  }
  if (t.divisao === '50/50') {
    return t.valor / 2;
  }
  return 0;
}

function calcularDespesasPorCategoriaPerfil(
  ts: Transacao[],
  perfil: 'leticia' | 'giovanna',
  salarioLeticia: number,
  salarioGiovanna: number
): DespesaPorCategoria[] {
  const hoje = new Date();
  const prop = calcularProporcoes(salarioLeticia, salarioGiovanna);
  const propPerfil = prop[perfil];

  const despesas = filtrarPorMes(ts, hoje.getMonth(), hoje.getFullYear())
    .filter(t => t.tipo === 'despesa' && t.categoria !== 'Salário')
    .filter(t =>
      t.recorrente ||
      t.responsavel === perfil ||
      t.divisao === '50/50'
    );

  const porCat: Record<string, number> = {};
  let total = 0;

  despesas.forEach(t => {
    const val = calcularValorParaPerfil(t, perfil, propPerfil);
    if (val <= 0) return;
    porCat[t.categoria] = (porCat[t.categoria] || 0) + val;
    total += val;
  });

  return Object.entries(porCat)
    .map(([categoria, valor]) => ({ categoria, valor, percentual: total > 0 ? valor / total * 100 : 0 }))
    .sort((a, b) => b.valor - a.valor);
}

function calcularParceladas(ts: Transacao[], mesAtual: Date): Parcelada[] {
  return ts
    .filter(t => t.tipo === 'despesa' && t.totalParcelas && t.totalParcelas > 1)
    .map(t => {
      const parcelaAtual = t.parcelaAtual || 1;
      const totalParcelas = t.totalParcelas || 1;
      const parcelasRestantes = totalParcelas - parcelaAtual;
      const fim = new Date(mesAtual);
      fim.setMonth(fim.getMonth() + parcelasRestantes);
      return {
        descricao: t.descricao, categoria: t.categoria, valorParcela: t.valor,
        parcelaAtual, totalParcelas, parcelasRestantes,
        comprometimentoFuturo: t.valor * parcelasRestantes,
        mesTermino: `${MESES[fim.getMonth()]}/${fim.getFullYear()}`,
      };
    })
    .filter(p => p.parcelasRestantes > 0)
    .sort((a, b) => b.comprometimentoFuturo - a.comprometimentoFuturo);
}

function calcularProjecaoBar(ts: Transacao[], mes: number, ano: number, limite: number): DadosProjecaoBar {
  const despesas = filtrarPorMes(ts, mes, ano).filter(t => t.tipo === 'despesa');
  const gastoAtual = despesas.reduce((acc, t) => acc + t.valor, 0);
  const hoje = new Date();
  const diaAtual = Math.max(hoje.getDate(), 1);
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const projecao = gastoAtual > 0 ? (gastoAtual / diaAtual) * diasNoMes : 0;
  return { gastoAtual, projecao, limite };
}

function calcularSemanasDoMes(ano: number, mes: number) {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const semanas: Array<{ inicio: Date; fim: Date }> = [];
  let inicio = new Date(primeiroDia);
  while (inicio <= ultimoDia) {
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + (6 - inicio.getDay()));
    if (fim > ultimoDia) fim.setTime(ultimoDia.getTime());
    semanas.push({ inicio: new Date(inicio), fim: new Date(fim) });
    inicio = new Date(fim);
    inicio.setDate(inicio.getDate() + 1);
  }
  return semanas;
}

function calcularMetodologia(
  ts: Transacao[], mes: number, ano: number,
  pctInvestimento: number,
  contasFixasConfig: Array<{ descricao: string; valor: number; categoria: string }>
): MetodologiaOrcamento {
  const tsMes = filtrarPorMes(ts, mes, ano);
  const hoje = new Date();
  const salarioMes = tsMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const investimento = salarioMes * (pctInvestimento / 100);
  const contasFixasTotal = contasFixasConfig.reduce((acc, c) => acc + Number(c.valor), 0);
  const totalGastosVariaveis = Math.max(0, salarioMes - investimento - contasFixasTotal);
  const semanasDoMes = calcularSemanasDoMes(ano, mes);
  const orcamentoPorSemana = semanasDoMes.length > 0 ? totalGastosVariaveis / semanasDoMes.length : 0;

  let semanaAtualNumero = semanasDoMes.length;
  for (let i = 0; i < semanasDoMes.length; i++) {
    if (hoje >= semanasDoMes[i].inicio && hoje <= semanasDoMes[i].fim) {
      semanaAtualNumero = i + 1;
      break;
    }
  }

  const gastosVariaveis = tsMes.filter(t => t.tipo === 'despesa' && !t.recorrente && !(t.totalParcelas && t.totalParcelas > 1));

  const semanas: DadosSemana[] = semanasDoMes.map((semana, i) => {
    const numero = i + 1;
    const gasto = gastosVariaveis
      .filter(t => { const d = new Date(t.data); return d >= semana.inicio && d <= semana.fim; })
      .reduce((acc, t) => acc + t.valor, 0);
    const disponivel = orcamentoPorSemana - gasto;
    const status: 'futuro' | 'atual' | 'passado' = numero < semanaAtualNumero ? 'passado' : numero === semanaAtualNumero ? 'atual' : 'futuro';
    return { numero, inicio: semana.inicio, fim: semana.fim, orcamento: orcamentoPorSemana, gasto, disponivel, percentualGasto: orcamentoPorSemana > 0 ? gasto / orcamentoPorSemana * 100 : 0, status };
  });

  const saldoLivre = semanas.filter(s => s.status !== 'futuro').reduce((acc, s) => acc + s.disponivel, 0);

  return { salarioMes, investimento, percentualInvestimento: pctInvestimento, contasFixas: contasFixasTotal, listaContasFixas: contasFixasConfig, totalGastosVariaveis, semanas, semanaAtual: semanaAtualNumero, saldoLivre };
}

function calcularProjecao(ts: Transacao[]): ProjecaoFinanceira[] {
  const hoje = new Date();
  const evolucao = calcularEvolucaoMensal(ts);
  const media = evolucao.reduce((acc, e) => acc + e.saldo, 0) / evolucao.length;
  let saldo = evolucao.reduce((acc, e) => acc + e.saldo, 0);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);
    saldo += media;
    return { mes: MESES[d.getMonth()], saldoProjetado: saldo, saldoOtimista: saldo + media * 0.2 * (i + 1), saldoPessimista: saldo - media * 0.3 * (i + 1) };
  });
}

function calcularIndicadoresPerfil(
  ts: Transacao[], perfil: 'leticia' | 'giovanna',
  salario: number, salarioLeticia: number, salarioGiovanna: number,
  contasFixasConfig: Array<{ descricao: string; valor: number; categoria: string }>,
  parceladas: Parcelada[], pctInvestimento: number
): IndicadoresPerfil {
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();
  const prop = calcularProporcoes(salarioLeticia, salarioGiovanna);
  const proporcaoRenda = prop[perfil];

  // Parte proporcional das fixas
  const parteFixas = contasFixasConfig.reduce((acc, c) => acc + calcularParteFixa(c.valor, perfil, salarioLeticia, salarioGiovanna), 0);

  // Parte proporcional das parceladas (50/50 dividido)
  const parteParceladas = parceladas.reduce((acc, p) => acc + p.valorParcela * 0.5, 0);

  // Gastos variáveis do perfil no mês
  const gastosMes = filtrarPorMes(ts, mes, ano)
    .filter(t => t.tipo === 'despesa' && !t.recorrente && !(t.totalParcelas && t.totalParcelas > 1))
    .filter(t =>
      t.responsavel === perfil ||
      t.responsavel === 'casal' ||
      !t.responsavel ||
      t.divisao === '50/50'
    )
    .reduce((acc, t) => acc + calcularValorParaPerfil(t, perfil, proporcaoRenda), 0);

  const investimento = salario * (pctInvestimento / 100);
  const saldoLivre = salario - investimento - parteFixas - gastosMes;
  const comprometimento = salario > 0 ? ((parteFixas + parteParceladas) / salario) * 100 : 0;

  // Envelope semanal baseado no salário individual
  const semanasDoMes = calcularSemanasDoMes(ano, mes);
  const envelopeTotal = Math.max(0, salario - investimento - parteFixas);
  const envelopeSemanal = semanasDoMes.length > 0 ? envelopeTotal / semanasDoMes.length : 0;

  return {
    perfil, salario, proporcaoRenda,
    parteFixas, parteParceladas,
    gastosVariaveis: gastosMes,
    saldoLivre, comprometimento, envelopeSemanal,
    metaEconomia: salario * 0.2, // meta padrão 20%
    progressoMeta: salario > 0 ? (saldoLivre / (salario * 0.2)) * 100 : 0,
    categorias: calcularDespesasPorCategoriaPerfil(ts, perfil, salarioLeticia, salarioGiovanna),
  };
}

function gerarAlertas(
  totaisAtual: { receitas: number; despesas: number },
  totaisAnterior: { receitas: number; despesas: number },
  cats: DespesaPorCategoria[], parceladas: Parcelada[],
  limite: number, projecao: number
): Alerta[] {
  const alertas: Alerta[] = [];
  const pct = limite > 0 ? (totaisAtual.despesas / limite) * 100 : 0;
  const varD = totaisAnterior.despesas > 0 ? ((totaisAtual.despesas - totaisAnterior.despesas) / totaisAnterior.despesas) * 100 : 0;

  if (projecao > limite) alertas.push({ id: 'proj-estouro', tipo: 'critico', titulo: 'Projeção ultrapassa o limite', mensagem: `No ritmo atual você vai gastar R$ ${(projecao - limite).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} além do limite.`, acao: 'Reduza gastos variáveis' });
  if (pct >= 90) alertas.push({ id: 'lim-90', tipo: 'critico', titulo: 'Limite quase esgotado', mensagem: `${Math.round(pct)}% do limite utilizado.` });
  else if (pct >= 70) alertas.push({ id: 'lim-70', tipo: 'atencao', titulo: 'Atenção ao limite', mensagem: `${Math.round(pct)}% do limite utilizado. Restam R$ ${(limite - totaisAtual.despesas).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.` });
  if (varD > 20) alertas.push({ id: 'aum-desp', tipo: 'atencao', titulo: 'Despesas aumentaram', mensagem: `Gastos ${varD.toFixed(0)}% acima do mês anterior.` });

  const top = cats[0];
  if (top && top.percentual > 30) alertas.push({ id: `cat-${top.categoria}`, tipo: 'atencao', titulo: `${top.categoria} domina os gastos`, mensagem: `${top.percentual.toFixed(0)}% das despesas.` });

  const totalParcMes = parceladas.reduce((acc, p) => acc + p.valorParcela, 0);
  if (limite > 0 && (totalParcMes / limite) > 0.30) alertas.push({ id: 'parc-altas', tipo: 'atencao', titulo: 'Parcelas comprometem o limite', mensagem: `Parcelas = ${Math.round((totalParcMes / limite) * 100)}% do limite.` });

  const proxMes = MESES[new Date(new Date().getFullYear(), new Date().getMonth() + 1).getMonth()];
  parceladas.forEach(p => { if (p.mesTermino.startsWith(proxMes)) alertas.push({ id: `fim-${p.descricao}`, tipo: 'sucesso', titulo: `${p.descricao} termina em ${proxMes}`, mensagem: `R$ ${p.valorParcela.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} liberados no próximo mês.` }); });

  if (alertas.length === 0) alertas.push({ id: 'ok', tipo: 'sucesso', titulo: 'Tudo em ordem!', mensagem: 'Nenhum alerta no momento.' });
  return alertas;
}

function gerarSugestoes(
  totaisAtual: { receitas: number; despesas: number },
  cats: DespesaPorCategoria[], catsAnt: DespesaPorCategoria[]
): Sugestao[] {
  const sugestoes: Sugestao[] = [];
  const saldo = totaisAtual.receitas - totaisAtual.despesas;

  if (saldo > 500) sugestoes.push({ id: 'reserva', titulo: 'Reforce a reserva de emergência', descricao: `Você tem R$ ${saldo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} de saldo. Considere alocar parte na reserva.`, categoria: 'seguranca', impacto: 'Alto' });

  const top = cats[0];
  if (top && top.percentual > 35) sugestoes.push({ id: 'top-cat', titulo: `Revise ${top.categoria}`, descricao: `${top.categoria} representa ${top.percentual.toFixed(0)}% das despesas.`, categoria: 'economia', impacto: 'Médio' });

  cats.forEach(c => {
    const ant = catsAnt.find(a => a.categoria === c.categoria);
    if (ant && c.valor > ant.valor * 1.3) sugestoes.push({ id: `subiu-${c.categoria}`, titulo: `${c.categoria} subiu muito`, descricao: `+${Math.round((c.valor / ant.valor - 1) * 100)}% vs mês anterior.`, categoria: 'economia', impacto: 'Médio' });
    if (ant && c.valor < ant.valor * 0.85) sugestoes.push({ id: `caiu-${c.categoria}`, titulo: `${c.categoria} reduziu`, descricao: `-${Math.round((1 - c.valor / ant.valor) * 100)}% — bom trabalho!`, categoria: 'meta', impacto: 'Positivo' });
  });

  return sugestoes.slice(0, 5);
}

export function calcularTodosIndicadores(dados: DadosPlanilha): IndicadoresFinanceiros {
  const { transacoes, limiteMensal, metaEmergencia, percentualInvestimento, contasFixasConfig, salarioLeticia, salarioGiovanna } = dados;
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();

  const tsMes = filtrarPorMes(transacoes, mes, ano);
  const tsMesAnt = filtrarPorMes(transacoes, mes === 0 ? 11 : mes - 1, mes === 0 ? ano - 1 : ano);
  const totaisAtual = calcularTotais(tsMes);
  const totaisAnterior = calcularTotais(tsMesAnt);

  const saldoAtual = totaisAtual.receitas - totaisAtual.despesas;
  const saldoAnterior = totaisAnterior.receitas - totaisAnterior.despesas;
  const taxaPoupanca = totaisAtual.receitas > 0 ? (saldoAtual / totaisAtual.receitas) * 100 : 0;
  const variacaoSaldo = saldoAnterior !== 0 ? ((saldoAtual - saldoAnterior) / Math.abs(saldoAnterior)) * 100 : 0;
  const variacaoReceitas = totaisAnterior.receitas > 0 ? ((totaisAtual.receitas - totaisAnterior.receitas) / totaisAnterior.receitas) * 100 : 0;
  const variacaoDespesas = totaisAnterior.despesas > 0 ? ((totaisAtual.despesas - totaisAnterior.despesas) / totaisAnterior.despesas) * 100 : 0;

  const despesasPorCategoria = calcularDespesasPorCategoria(transacoes);
  const catsAnt = (() => {
    const d = tsMesAnt.filter(t => t.tipo === 'despesa');
    const m: Record<string, number> = {}; let total = 0;
    d.forEach(t => { m[t.categoria] = (m[t.categoria] || 0) + t.valor; total += t.valor; });
    return Object.entries(m).map(([categoria, valor]) => ({ categoria, valor, percentual: total > 0 ? valor / total * 100 : 0 }));
  })();

  const evolucaoMensal = calcularEvolucaoMensal(transacoes);
  const projecao = calcularProjecao(transacoes);
  const projecaoBar = calcularProjecaoBar(transacoes, mes, ano, limiteMensal);
  const parceladas = calcularParceladas(transacoes, hoje);
  const comprometimentoTotal = parceladas.reduce((acc, p) => acc + p.comprometimentoFuturo, 0);
  const metodologia = calcularMetodologia(transacoes, mes, ano, percentualInvestimento, contasFixasConfig);
  const alertas = gerarAlertas(totaisAtual, totaisAnterior, despesasPorCategoria, parceladas, limiteMensal, projecaoBar.projecao);
  const sugestoes = gerarSugestoes(totaisAtual, despesasPorCategoria, catsAnt);

  const perfilLeticia = calcularIndicadoresPerfil(transacoes, 'leticia', salarioLeticia, salarioLeticia, salarioGiovanna, contasFixasConfig, parceladas, percentualInvestimento);
  const perfilGiovanna = calcularIndicadoresPerfil(transacoes, 'giovanna', salarioGiovanna, salarioLeticia, salarioGiovanna, contasFixasConfig, parceladas, percentualInvestimento);

  return {
    saldoAtual, receitasMes: totaisAtual.receitas, despesasMes: totaisAtual.despesas,
    taxaPoupanca, variacaoSaldo, variacaoReceitas, variacaoDespesas,
    limiteMensal, progressoMeta: limiteMensal > 0 ? (totaisAtual.despesas / limiteMensal) * 100 : 0,
    evolucaoMensal, despesasPorCategoria, projecao, projecaoBar,
    parceladas, comprometimentoTotal, metodologia, alertas, sugestoes,
    perfilLeticia, perfilGiovanna,
  };
}
