import type { Transacao, DadosPlanilha, IndicadoresFinanceiros, EvolucaoMensal, DespesaPorCategoria, Parcelada, DadosProjecaoBar, DadosSemana, DadosMetodologia, ProjecaoFinanceira, IndicadoresPerfil } from './types';
import { calcularValorParMembro, transacaoVisivel, calcularProporcoesSimples, calcularParteFixa, parseDivisao } from './perfil-config';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// ─── Utilitários ─────────────────────────────────────────────────────────────

function filtrarPorMes(ts: Transacao[], mes: number, ano: number): Transacao[] {
  return ts.filter(t => {
    const d = t.data instanceof Date ? t.data
      : new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
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

function salariosDoPerfil(salarioLeticia: number, salarioGiovanna: number) {
  return { leticia: salarioLeticia, giovanna: salarioGiovanna };
}

// ─── Evolução Mensal ─────────────────────────────────────────────────────────

export function calcularEvolucaoMensal(ts: Transacao[]): EvolucaoMensal[] {
  const hoje = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const tsMes = filtrarPorMes(ts, d.getMonth(), d.getFullYear());
    const tot = calcularTotais(tsMes);
    const ehAtual = d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    const label = ehAtual
      ? `${MESES[d.getMonth()]} ●`
      : `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    return { mes: label, receitas: tot.receitas, despesas: tot.despesas, saldo: tot.receitas - tot.despesas };
  });
}

// ─── Despesas por Categoria ──────────────────────────────────────────────────

function calcularCategorias(
  ts: Transacao[],
  mes: number,
  ano: number,
  contasFixasConfig: Array<{ valor: number; categoria: string; descricao: string }>,
  perfil?: 'leticia' | 'giovanna',
  salarioLeticia = 0,
  salarioGiovanna = 0,
): DespesaPorCategoria[] {
  const salarios = salariosDoPerfil(salarioLeticia, salarioGiovanna);
  const tsMes = filtrarPorMes(ts, mes, ano).filter(t => t.tipo === 'despesa' && t.categoria !== 'Salário');

  const porCat: Record<string, number> = {};
  let total = 0;

  tsMes.forEach(t => {
    let val: number;
    if (perfil) {
      // Verificar se a transação é visível para este perfil
      const visivel = transacaoVisivel(
        { valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente, totalParcelas: t.totalParcelas },
        perfil, salarios
      );
      if (!visivel) return;
      val = calcularValorParMembro(
        { valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente },
        perfil, salarios
      );
    } else {
      val = t.valor;
    }
    if (val <= 0) return;
    porCat[t.categoria] = (porCat[t.categoria] || 0) + val;
    total += val;
  });

  // Adicionar fixas do planejamento (apenas se não vieram como transações reais)
  if (contasFixasConfig.length > 0) {
    const fixasValor = perfil
      ? contasFixasConfig.reduce((acc, c) => acc + calcularParteFixa(c.valor, perfil, salarioLeticia, salarioGiovanna), 0)
      : contasFixasConfig.reduce((acc, c) => acc + c.valor, 0);

    if (fixasValor > 0) {
      porCat['Despesas Fixas'] = (porCat['Despesas Fixas'] || 0) + fixasValor;
      total += fixasValor;
    }
  }

  return Object.entries(porCat)
    .map(([categoria, valor]) => ({ categoria, valor, percentual: total > 0 ? (valor / total) * 100 : 0 }))
    .sort((a, b) => b.valor - a.valor);
}

export function calcularDespesasPorCategoriaPerfil(
  ts: Transacao[],
  perfil: 'leticia' | 'giovanna',
  salarioLeticia: number,
  salarioGiovanna: number,
  contasFixasConfig: Array<{ descricao: string; valor: number; categoria: string }>,
  mes?: number,
  ano?: number,
): DespesaPorCategoria[] {
  const hoje = new Date();
  return calcularCategorias(ts, mes ?? hoje.getMonth(), ano ?? hoje.getFullYear(), contasFixasConfig, perfil, salarioLeticia, salarioGiovanna);
}

export function calcularDespesasPorCategoriaPerfilMes(
  ts: Transacao[],
  perfil: 'leticia' | 'giovanna',
  salarioLeticia: number,
  salarioGiovanna: number,
  contasFixasConfig: Array<{ descricao: string; valor: number; categoria: string }>,
  mes: number,
  ano: number,
): DespesaPorCategoria[] {
  return calcularCategorias(ts, mes, ano, contasFixasConfig, perfil, salarioLeticia, salarioGiovanna);
}

// ─── Parceladas ──────────────────────────────────────────────────────────────

export function calcularParceladas(
  ts: Transacao[],
  mesAtual: Date,
  perfil?: 'leticia' | 'giovanna',
  salarioLeticia = 0,
  salarioGiovanna = 0,
): Parcelada[] {
  const salarios = salariosDoPerfil(salarioLeticia, salarioGiovanna);

  return ts
    .filter(t => t.tipo === 'despesa' && t.totalParcelas && t.totalParcelas > 1)
    .filter(t => {
      if (!perfil) return true;
      return transacaoVisivel(
        { valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente, totalParcelas: t.totalParcelas },
        perfil, salarios
      );
    })
    .map(t => {
      const parcelaAtual = t.parcelaAtual || 1;
      const totalParcelas = t.totalParcelas || 1;
      const parcelasRestantes = totalParcelas - parcelaAtual;
      const fim = new Date(mesAtual);
      fim.setMonth(fim.getMonth() + parcelasRestantes);

      const valorParcela = perfil
        ? calcularValorParMembro({ valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente }, perfil, salarios)
        : t.valor;

      return {
        descricao: t.descricao,
        categoria: t.categoria,
        valorParcela,
        parcelaAtual,
        totalParcelas,
        parcelasRestantes,
        comprometimentoFuturo: valorParcela * parcelasRestantes,
        mesTermino: `${MESES[fim.getMonth()]}/${String(fim.getFullYear()).slice(2)}`,
      };
    })
    .filter(p => p.parcelasRestantes > 0)
    .sort((a, b) => b.comprometimentoFuturo - a.comprometimentoFuturo);
}

// ─── Projeção de Gastos ──────────────────────────────────────────────────────

export function calcularProjecaoBar(
  ts: Transacao[],
  mes: number,
  ano: number,
  limite: number,
  fixas = 0,
  perfil?: 'leticia' | 'giovanna',
  salarioLeticia = 0,
  salarioGiovanna = 0,
): DadosProjecaoBar {
  const salarios = salariosDoPerfil(salarioLeticia, salarioGiovanna);
  const hoje = new Date();
  const tsMes = filtrarPorMes(ts, mes, ano).filter(t => t.tipo === 'despesa' && !t.recorrente);

  const gastoAtual = tsMes.reduce((acc, t) => {
    const val = perfil
      ? calcularValorParMembro({ valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente }, perfil, salarios)
      : t.valor;
    return acc + val;
  }, 0) + fixas;

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const diaAtual = mes === mesAtual && ano === anoAtual ? Math.max(hoje.getDate(), 1) : 30;
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diasConsiderados = Math.max(diaAtual, 5);
  const projecao = gastoAtual > 0
    ? Math.min((gastoAtual / diasConsiderados) * diasNoMes, gastoAtual * 2)
    : 0;
  const percentualAtual = limite > 0 ? (gastoAtual / limite) * 100 : 0;
  const percentualProjetado = limite > 0 ? (projecao / limite) * 100 : 0;
  const status = projecao > limite ? 'perigo' : projecao > limite * 0.8 ? 'atencao' : 'ok';

  return { gastoAtual, projecao, limite, percentualAtual, percentualProjetado, status };
}

// ─── Semanas do Mês ──────────────────────────────────────────────────────────

function calcularSemanasDoMes(ano: number, mes: number) {
  const semanas: Array<{ inicio: Date; fim: Date }> = [];
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  let inicio = new Date(primeiroDia);
  while (inicio <= ultimoDia) {
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + (6 - fim.getDay()));
    semanas.push({ inicio: new Date(inicio), fim: fim > ultimoDia ? new Date(ultimoDia) : new Date(fim) });
    inicio = new Date(fim);
    inicio.setDate(inicio.getDate() + 1);
  }
  return semanas;
}

function calcularMetodologia(
  ts: Transacao[],
  mes: number,
  ano: number,
  percentualInvestimento: number,
  contasFixasConfig: Array<{ valor: number; categoria: string; descricao: string }>,
): DadosMetodologia {
  const hoje = new Date();
  const tsMes = filtrarPorMes(ts, mes, ano);
  const receitas = tsMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const contasFixasTotal = contasFixasConfig.reduce((acc, c) => acc + Number(c.valor), 0);
  const reserva = receitas * (percentualInvestimento / 100);
  const totalGastosVariaveis = tsMes
    .filter(t => t.tipo === 'despesa' && !t.recorrente)
    .reduce((acc, t) => acc + t.valor, 0);

  const semanasDoMes = calcularSemanasDoMes(ano, mes);
  const mediaGastoSemanal = semanasDoMes.length > 0 ? totalGastosVariaveis / semanasDoMes.length : 0;

  let semanaAtualNumero = semanasDoMes.length;
  for (let i = 0; i < semanasDoMes.length; i++) {
    if (hoje >= semanasDoMes[i].inicio && hoje <= semanasDoMes[i].fim) {
      semanaAtualNumero = i + 1; break;
    }
  }

  const semanas: DadosSemana[] = semanasDoMes.map((semana, i) => {
    const numero = i + 1;
    const gastosSemanais = tsMes
      .filter(t => t.tipo === 'despesa' && !t.recorrente)
      .filter(t => {
        const d = t.data instanceof Date ? t.data : new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
        return d >= semana.inicio && d <= semana.fim;
      })
      .reduce((acc, t) => acc + t.valor, 0);

    const status = numero < semanaAtualNumero ? 'passado' : numero === semanaAtualNumero ? 'atual' : 'futuro';
    const disponivel = mediaGastoSemanal - gastosSemanais;
    return { numero, gastos: gastosSemanais, disponivel, limite: mediaGastoSemanal, status, inicio: semana.inicio, fim: semana.fim };
  });

  const saldoLivre = receitas - contasFixasTotal - reserva - totalGastosVariaveis;

  return {
    contasFixas: contasFixasTotal,
    reserva,
    totalGastosVariaveis,
    saldoLivre,
    semanas,
    semanaAtual: semanaAtualNumero,
    mediaGastoSemanal,
  };
}

// ─── Projeção Futura ─────────────────────────────────────────────────────────

function calcularProjecao(ts: Transacao[]): ProjecaoFinanceira[] {
  const hoje = new Date();
  const evolucao = calcularEvolucaoMensal(ts);
  const media = evolucao.reduce((acc, e) => acc + e.saldo, 0) / evolucao.length;
  let saldo = evolucao.reduce((acc, e) => acc + e.saldo, 0);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);
    saldo += media;
    return {
      mes: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      saldoProjetado: saldo,
      saldoOtimista: saldo + media * 0.2 * (i + 1),
      saldoPessimista: saldo - media * 0.3 * (i + 1),
    };
  });
}

// ─── Alertas e Sugestões ─────────────────────────────────────────────────────

export function gerarAlertas(
  totaisAtual: { receitas: number; despesas: number },
  totaisAnterior: { receitas: number; despesas: number },
  categorias: DespesaPorCategoria[],
  parceladas: Parcelada[],
  limite: number,
  projecao: number,
): any[] {
  const alertas: any[] = [];
  const saldo = totaisAtual.receitas - totaisAtual.despesas;

  if (saldo < 0) alertas.push({ id: 'saldo-neg', tipo: 'erro', titulo: 'Saldo negativo', mensagem: `Despesas superam receitas em R$ ${Math.abs(saldo).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.` });
  if (projecao > limite) alertas.push({ id: 'proj-limite', tipo: 'aviso', titulo: 'Projeção acima do limite', mensagem: `Projetado R$ ${projecao.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} vs limite R$ ${limite.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.` });

  const totalParcMes = parceladas.reduce((acc, p) => acc + p.valorParcela, 0);
  if (limite > 0 && totalParcMes / limite > 0.3) alertas.push({ id: 'parcelas-alto', tipo: 'aviso', titulo: 'Parcelas comprometem o limite', mensagem: `Parcelas = ${Math.round((totalParcMes / limite) * 100)}% do limite.` });

  const proxMesDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  const proxMesLabel = `${MESES[proxMesDate.getMonth()]}/${String(proxMesDate.getFullYear()).slice(2)}`;
  parceladas.forEach(p => {
    if (p.mesTermino === proxMesLabel) {
      alertas.push({ id: `fim-${p.descricao}`, tipo: 'sucesso', titulo: `${p.descricao} termina em ${proxMesLabel}`, mensagem: `R$ ${p.valorParcela.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} liberados no próximo mês.` });
    }
  });

  return alertas;
}

export function gerarSugestoes(
  totais: { receitas: number; despesas: number },
  categorias: DespesaPorCategoria[],
  _parceladas: any[],
): any[] {
  const sugestoes: any[] = [];
  const taxaPoupanca = totais.receitas > 0 ? ((totais.receitas - totais.despesas) / totais.receitas) * 100 : 0;
  if (taxaPoupanca < 10) sugestoes.push({ id: 'poupanca-baixa', tipo: 'dica', titulo: 'Taxa de poupança baixa', mensagem: 'Tente guardar pelo menos 10% da renda mensal.' });
  const lazer = categorias.find(c => c.categoria === 'Lazer');
  if (lazer && lazer.percentual > 20) sugestoes.push({ id: 'lazer-alto', tipo: 'dica', titulo: 'Lazer acima de 20%', mensagem: `Lazer representa ${Math.round(lazer.percentual)}% dos gastos.` });
  return sugestoes;
}

// ─── Indicadores por Perfil ──────────────────────────────────────────────────

function calcularIndicadoresPerfil(
  ts: Transacao[],
  perfil: 'leticia' | 'giovanna',
  salario: number,
  salarioLeticia: number,
  salarioGiovanna: number,
  contasFixasConfig: Array<{ valor: number; categoria: string; descricao: string }>,
  parceladas: Parcelada[],
  percentualInvestimento: number,
  mes: number,
  ano: number,
): IndicadoresPerfil {
  const salarios = salariosDoPerfil(salarioLeticia, salarioGiovanna);
  const proporcaoRenda = salarios[perfil] ?? 0.5;

  const tsMes = filtrarPorMes(ts, mes, ano).filter(t => t.tipo === 'despesa');

  const parteFixas = contasFixasConfig.reduce(
    (acc, c) => acc + calcularParteFixa(c.valor, perfil, salarioLeticia, salarioGiovanna), 0
  );

  const gastosVariaveis = tsMes
    .filter(t => !t.recorrente)
    .reduce((acc, t) => {
      const val = calcularValorParMembro(
        { valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente },
        perfil, salarios
      );
      return acc + val;
    }, 0);

  const investimento = salario * (percentualInvestimento / 100);
  const saldoLivre = salario - parteFixas - gastosVariaveis - investimento;

  const categorias = calcularCategorias(ts, mes, ano, contasFixasConfig, perfil, salarioLeticia, salarioGiovanna);

  return {
    salario,
    parteFixas,
    gastosVariaveis,
    investimento,
    saldoLivre,
    categorias,
    proporcaoRenda,
    metaEconomia: salario * 0.2,
    progressoMeta: salario > 0 ? (saldoLivre / (salario * 0.2)) * 100 : 0,
  };
}

// ─── INDICADORES COMPLETOS ───────────────────────────────────────────────────

export function calcularTodosIndicadores(dados: DadosPlanilha): IndicadoresFinanceiros {
  const {
    transacoes, limiteMensal, metaEmergencia, percentualInvestimento,
    contasFixasConfig, salarioLeticia, salarioGiovanna, mesAlvo, anoAlvo,
  } = dados;

  const hoje = new Date();
  const mes = mesAlvo !== undefined ? mesAlvo : hoje.getMonth();
  const ano = anoAlvo !== undefined ? anoAlvo : hoje.getFullYear();
  const mesAnt = mes === 0 ? 11 : mes - 1;
  const anoAnt = mes === 0 ? ano - 1 : ano;

  const tsMes = filtrarPorMes(transacoes, mes, ano);
  const tsMesAnt = filtrarPorMes(transacoes, mesAnt, anoAnt);
  const totaisAtual = calcularTotais(tsMes);
  const totaisAnterior = calcularTotais(tsMesAnt);

  const saldoAtual = totaisAtual.receitas - totaisAtual.despesas;
  const saldoAnterior = totaisAnterior.receitas - totaisAnterior.despesas;

  const variacaoSaldo    = saldoAnterior !== 0 ? ((saldoAtual - saldoAnterior) / Math.abs(saldoAnterior)) * 100 : 0;
  const variacaoReceitas = totaisAnterior.receitas > 0 ? ((totaisAtual.receitas - totaisAnterior.receitas) / totaisAnterior.receitas) * 100 : 0;
  const variacaoDespesas = totaisAnterior.despesas > 0 ? ((totaisAtual.despesas - totaisAnterior.despesas) / totaisAnterior.despesas) * 100 : 0;
  const taxaPoupanca     = totaisAtual.receitas > 0 ? (saldoAtual / totaisAtual.receitas) * 100 : 0;

  const despesasPorCategoria = calcularCategorias(transacoes, mes, ano, contasFixasConfig);
  const evolucaoMensal       = calcularEvolucaoMensal(transacoes);
  const projecao             = calcularProjecao(transacoes);
  const metodologia          = calcularMetodologia(transacoes, mes, ano, percentualInvestimento, contasFixasConfig);

  const contasFixasTotal = contasFixasConfig.reduce((acc, c) => acc + Number(c.valor), 0);
  const projecaoBar = calcularProjecaoBar(transacoes, mes, ano, limiteMensal, contasFixasTotal);

  const parceladas = calcularParceladas(transacoes, new Date(ano, mes, 1));
  const comprometimentoTotal = parceladas.reduce((acc, p) => acc + p.comprometimentoFuturo, 0);

  const perfilLeticia = calcularIndicadoresPerfil(
    transacoes, 'leticia', salarioLeticia, salarioLeticia, salarioGiovanna,
    contasFixasConfig, parceladas, percentualInvestimento, mes, ano,
  );
  const perfilGiovanna = calcularIndicadoresPerfil(
    transacoes, 'giovanna', salarioGiovanna, salarioLeticia, salarioGiovanna,
    contasFixasConfig, parceladas, percentualInvestimento, mes, ano,
  );

  const alertas  = gerarAlertas(totaisAtual, totaisAnterior, despesasPorCategoria, parceladas, limiteMensal, projecaoBar.projecao);
  const sugestoes = gerarSugestoes(totaisAtual, despesasPorCategoria, parceladas);

  return {
    saldoAtual,
    receitasMes: totaisAtual.receitas,
    despesasMes: totaisAtual.despesas,
    taxaPoupanca,
    variacaoSaldo,
    variacaoReceitas,
    variacaoDespesas,
    despesasPorCategoria,
    evolucaoMensal,
    projecao,
    metodologia,
    parceladas,
    comprometimentoTotal,
    alertas,
    sugestoes,
    perfilLeticia,
    perfilGiovanna,
  };
}
