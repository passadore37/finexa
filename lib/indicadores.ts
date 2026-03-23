import type {
  Transacao,
  DadosPlanilha,
  IndicadoresFinanceiros,
  EvolucaoMensal,
  DespesaPorCategoria,
  ProjecaoFinanceira,
  DadosProjecaoBar,
  Parcelada,
  MetodologiaOrcamento,
  DadosSemana,
  Alerta,
  Sugestao,
} from './types';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Filtra transações por mês e ano
 */
function filtrarPorMes(transacoes: Transacao[], mes: number, ano: number): Transacao[] {
  return transacoes.filter((t) => {
    // Normalizar data para evitar problema de fuso (UTC vs local)
    // Datas ISO "2026-03-01T00:00:00Z" em UTC-3 viriam como "2026-02-28" localmente
    const raw = t.data as any;
    const data = raw instanceof Date
      ? raw
      : typeof raw === 'string' && raw.length === 10
        ? new Date(raw + 'T12:00:00')   // só data "YYYY-MM-DD" → forçar meio-dia local
        : new Date(raw);
    return data.getMonth() === mes && data.getFullYear() === ano;
  });
}

/**
 * Calcula totais de receitas e despesas
 */
function calcularTotais(transacoes: Transacao[]) {
  return transacoes.reduce(
    (acc, t) => {
      if (t.tipo === 'receita') {
        acc.receitas += t.valor;
      } else {
        acc.despesas += t.valor;
      }
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );
}

/**
 * Calcula totais com rateio proporcional para perfis individuais
 */
function calcularTotaisComRateio(
  transacoes: Transacao[],
  perfil: 'leticia' | 'giovanna',
  proporcao: number
) {
  return transacoes.reduce(
    (acc, t) => {
      if (t.tipo === 'receita') {
        // Receita: só conta se for do perfil
        if (t.responsavel === perfil) acc.receitas += t.valor;
      } else {
        // Despesa: aplicar rateio
        if (t.recorrente) {
          // Fixa: proporcional ao salário
          acc.despesas += t.valor * proporcao;
        } else if (t.responsavel === perfil) {
          // Gasto próprio: valor total
          acc.despesas += t.valor;
        } else if (t.divisao === '50/50' || t.responsavel === 'casal' || !t.responsavel) {
          // 50/50: metade
          acc.despesas += t.valor / 2;
        }
      }
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );
}

/**
 * Calcula evolução mensal dos últimos 6 meses
 */
export function calcularEvolucaoMensal(
  transacoesRaw: Transacao[],
  perfil?: 'leticia' | 'giovanna',
  proporcao?: number
): EvolucaoMensal[] {
  // Normalizar datas para evitar problema de fuso UTC→local
  const transacoes = transacoesRaw.map(t => {
    const raw = t.data as any;
    const data = raw instanceof Date
      ? raw
      : typeof raw === 'string' && raw.length === 10
        ? new Date(raw + 'T12:00:00')
        : new Date(raw);
    return { ...t, data };
  });
  const hoje = new Date();
  const resultado: EvolucaoMensal[] = [];

  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mes = data.getMonth();
    const ano = data.getFullYear();
    const transacoesMes = filtrarPorMes(transacoes, mes, ano);
    // Usar rateio proporcional quando chamado para perfil individual
    const totais = perfil && proporcao !== undefined
      ? calcularTotaisComRateio(transacoesMes, perfil, proporcao)
      : calcularTotais(transacoesMes);

    resultado.push({
      mes: MESES[mes],
      receitas: totais.receitas,
      despesas: totais.despesas,
      saldo: totais.receitas - totais.despesas,
    });
  }

  return resultado;
}

/**
 * Calcula despesas por categoria do mês atual
 */
function calcularDespesasPorCategoria(transacoes: Transacao[]): DespesaPorCategoria[] {
  const hoje = new Date();
  const transacoesMes = filtrarPorMes(transacoes, hoje.getMonth(), hoje.getFullYear());
  const despesas = transacoesMes.filter((t) => t.tipo === 'despesa');

  const porCategoria: Record<string, number> = {};
  let total = 0;

  despesas.forEach((t) => {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.valor;
    total += t.valor;
  });

  return Object.entries(porCategoria)
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: total > 0 ? (valor / total) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);
}

/**
 * Calcula parceladas ativas
 */
export function calcularParceladas(transacoes: Transacao[], mesAtual: Date, _perfilLegacy?: string, _proporcaoLegacy?: number): Parcelada[] {
  const parceladas = transacoes.filter(
    (t) => t.tipo === 'despesa' && t.totalParcelas && t.totalParcelas > 1
  );

  return parceladas
    .map((t) => {
      const parcelaAtual = t.parcelaAtual || 1;
      const totalParcelas = t.totalParcelas || 1;
      const parcelasRestantes = totalParcelas - parcelaAtual;
      const comprometimentoFuturo = t.valor * parcelasRestantes;

      // Calcular mês de término
      const mesTerminoDate = new Date(mesAtual);
      mesTerminoDate.setMonth(mesTerminoDate.getMonth() + parcelasRestantes);
      const mesTermino = MESES[mesTerminoDate.getMonth()] + '/' + mesTerminoDate.getFullYear();

      return {
        descricao: t.descricao,
        categoria: t.categoria,
        valorParcela: t.valor,
        parcelaAtual,
        totalParcelas,
        parcelasRestantes,
        comprometimentoFuturo,
        mesTermino,
      };
    })
    .filter((p) => p.parcelasRestantes > 0)
    .sort((a, b) => b.comprometimentoFuturo - a.comprometimentoFuturo);
}

/**
 * Calcula comprometimento total de parceladas
 */
function calcularComprometimentoTotal(parceladas: Parcelada[]): number {
  return parceladas.reduce((acc, p) => acc + p.comprometimentoFuturo, 0);
}

/**
 * Calcula dados para a barra de projeção (gauge)
 */
export function calcularProjecaoBar(
  transacoes: Transacao[],
  mes: number,
  ano: number,
  limite: number,
  _fixasLegacy?: number,
  _perfilLegacy?: string,
  _proporcaoLegacy?: number
): DadosProjecaoBar {
  const transacoesMes = filtrarPorMes(transacoes, mes, ano);
  const gastoAtual = transacoesMes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  // Projeção linear baseada no dia do mês
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const projecao = (gastoAtual / diaAtual) * diasNoMes;

  return {
    gastoAtual,
    projecao,
    limite,
  };
}

/**
 * Calcula as semanas do mês atual
 */
function calcularSemanasDoMes(ano: number, mes: number): Array<{ inicio: Date; fim: Date }> {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const semanas: Array<{ inicio: Date; fim: Date }> = [];
  
  let inicioSemana = new Date(primeiroDia);
  
  while (inicioSemana <= ultimoDia) {
    // Encontrar o fim da semana (domingo) ou último dia do mês
    const fimSemana = new Date(inicioSemana);
    const diasAteDomingo = 7 - inicioSemana.getDay();
    fimSemana.setDate(inicioSemana.getDate() + diasAteDomingo - 1);
    
    // Se passar do último dia do mês, usar o último dia
    if (fimSemana > ultimoDia) {
      fimSemana.setTime(ultimoDia.getTime());
    }
    
    semanas.push({
      inicio: new Date(inicioSemana),
      fim: new Date(fimSemana),
    });
    
    // Próxima semana começa no dia seguinte
    inicioSemana = new Date(fimSemana);
    inicioSemana.setDate(inicioSemana.getDate() + 1);
  }
  
  return semanas;
}

/**
 * Identifica qual semana do mês uma data pertence
 */
function identificarSemana(data: Date, semanas: Array<{ inicio: Date; fim: Date }>): number {
  for (let i = 0; i < semanas.length; i++) {
    if (data >= semanas[i].inicio && data <= semanas[i].fim) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calcula a metodologia de orçamento semanal
 * 1. Salário
 * 2. Separar 10% para investimento
 * 3. Pagar contas fixas
 * 4. Dividir o restante em semanas
 */
function calcularMetodologiaOrcamento(
  transacoes: Transacao[],
  mes: number,
  ano: number,
  percentualInvestimento: number = 10
): MetodologiaOrcamento {
  const transacoesMes = filtrarPorMes(transacoes, mes, ano);
  const hoje = new Date();
  
  // 1. Calcular salário do mês (receitas)
  const receitas = transacoesMes.filter(t => t.tipo === 'receita');
  const salarioMes = receitas.reduce((acc, t) => acc + t.valor, 0);
  
  // 2. Calcular investimento (10% do salário)
  const investimento = salarioMes * (percentualInvestimento / 100);
  
  // 3. Identificar e somar contas fixas
  // Contas fixas são: recorrentes ou categorias específicas
  const categoriasFixas = ['Moradia', 'Aluguel', 'Condomínio', 'Água', 'Luz', 'Gás', 'Internet', 'Telefone', 'Streaming', 'Seguros', 'Plano de Saúde', 'Educação'];
  
  const despesasMes = transacoesMes.filter(t => t.tipo === 'despesa');
  
  const contasFixasLista = despesasMes.filter(t => 
    t.recorrente || 
    categoriasFixas.some(cat => t.categoria.toLowerCase().includes(cat.toLowerCase())) ||
    (t.totalParcelas && t.totalParcelas > 1) // Parceladas também são fixas
  );
  
  const contasFixasTotal = contasFixasLista.reduce((acc, t) => acc + t.valor, 0);
  
  // 4. Calcular o dinheiro disponível para gastos variáveis
  const totalGastosVariaveis = salarioMes - investimento - contasFixasTotal;
  
  // Calcular semanas do mês
  const semanasDoMes = calcularSemanasDoMes(ano, mes);
  const orcamentoPorSemana = totalGastosVariaveis > 0 
    ? totalGastosVariaveis / semanasDoMes.length 
    : 0;
  
  // Gastos variáveis (não fixos)
  const gastosVariaveis = despesasMes.filter(t => 
    !t.recorrente && 
    !categoriasFixas.some(cat => t.categoria.toLowerCase().includes(cat.toLowerCase())) &&
    !(t.totalParcelas && t.totalParcelas > 1)
  );
  
  // Identificar semana atual
  const semanaAtualNumero = identificarSemana(hoje, semanasDoMes);
  
  // Calcular dados de cada semana
  const semanas: DadosSemana[] = semanasDoMes.map((semana, index) => {
    const numero = index + 1;
    
    // Filtrar gastos variáveis desta semana
    const gastosSemana = gastosVariaveis.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= semana.inicio && dataTransacao <= semana.fim;
    });
    
    const gasto = gastosSemana.reduce((acc, t) => acc + t.valor, 0);
    const disponivel = orcamentoPorSemana - gasto;
    const percentualGasto = orcamentoPorSemana > 0 ? (gasto / orcamentoPorSemana) * 100 : 0;
    
    // Determinar status
    let status: 'futuro' | 'atual' | 'passado';
    if (numero < semanaAtualNumero) {
      status = 'passado';
    } else if (numero === semanaAtualNumero) {
      status = 'atual';
    } else {
      status = 'futuro';
    }
    
    return {
      numero,
      inicio: semana.inicio,
      fim: semana.fim,
      orcamento: orcamentoPorSemana,
      gasto,
      disponivel,
      percentualGasto,
      status,
    };
  });
  
  // Calcular saldo livre (o que sobrou de todas as semanas passadas + atual)
  const saldoLivre = semanas
    .filter(s => s.status !== 'futuro')
    .reduce((acc, s) => acc + s.disponivel, 0);
  
  return {
    salarioMes,
    investimento,
    percentualInvestimento,
    contasFixas: contasFixasTotal,
    listaContasFixas: contasFixasLista.map(t => ({
      descricao: t.descricao,
      valor: t.valor,
      categoria: t.categoria,
    })),
    totalGastosVariaveis: totalGastosVariaveis > 0 ? totalGastosVariaveis : 0,
    semanas,
    semanaAtual: semanaAtualNumero,
    saldoLivre,
  };
}

/**
 * Calcula projeção financeira para os próximos 6 meses
 */
function calcularProjecao(transacoes: Transacao[], metaMensal: number): ProjecaoFinanceira[] {
  const evolucao = calcularEvolucaoMensal(transacoes);
  const mediaReceitas = evolucao.reduce((acc, e) => acc + e.receitas, 0) / evolucao.length;
  const mediaDespesas = evolucao.reduce((acc, e) => acc + e.despesas, 0) / evolucao.length;
  const mediaSaldo = mediaReceitas - mediaDespesas;

  const hoje = new Date();
  const resultado: ProjecaoFinanceira[] = [];
  let saldoAcumulado = evolucao.reduce((acc, e) => acc + e.saldo, 0);

  for (let i = 1; i <= 6; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    saldoAcumulado += mediaSaldo;

    resultado.push({
      mes: MESES[data.getMonth()],
      saldoProjetado: saldoAcumulado,
      saldoOtimista: saldoAcumulado + mediaSaldo * 0.2 * i,
      saldoPessimista: saldoAcumulado - mediaSaldo * 0.3 * i,
    });
  }

  return resultado;
}

/**
 * Gera alertas automáticos baseados nos indicadores
 */
export function gerarAlertas(
  transacoes: Transacao[],
  dados: DadosPlanilha,
  totaisMesAtual: { receitas: number; despesas: number },
  totaisMesAnterior: { receitas: number; despesas: number },
  despesasPorCategoria: DespesaPorCategoria[],
  parceladas: Parcelada[],
  limite: number
): Alerta[] {
  const alertas: Alerta[] = [];
  const saldo = totaisMesAtual.receitas - totaisMesAtual.despesas;
  const taxaPoupanca = totaisMesAtual.receitas > 0 
    ? (saldo / totaisMesAtual.receitas) * 100 
    : 0;

  // Alerta de saldo negativo
  if (saldo < 0) {
    alertas.push({
      id: 'saldo-negativo',
      tipo: 'critico',
      titulo: 'Saldo Negativo',
      mensagem: `Suas despesas superaram as receitas em R$ ${Math.abs(saldo).toFixed(2)} este mês.`,
      acao: 'Revise seus gastos urgentemente',
    });
  }

  // Alerta de taxa de poupança baixa
  if (taxaPoupanca < 10 && taxaPoupanca >= 0) {
    alertas.push({
      id: 'poupanca-baixa',
      tipo: 'atencao',
      titulo: 'Taxa de Poupança Baixa',
      mensagem: `Você está guardando apenas ${taxaPoupanca.toFixed(1)}% da sua renda.`,
      acao: 'Tente aumentar para pelo menos 20%',
    });
  }

  // Alerta de aumento de despesas
  const variacaoDespesas = totaisMesAnterior.despesas > 0
    ? ((totaisMesAtual.despesas - totaisMesAnterior.despesas) / totaisMesAnterior.despesas) * 100
    : 0;

  if (variacaoDespesas > 20) {
    alertas.push({
      id: 'aumento-despesas',
      tipo: 'atencao',
      titulo: 'Aumento de Despesas',
      mensagem: `Suas despesas aumentaram ${variacaoDespesas.toFixed(0)}% em relação ao mês anterior.`,
      acao: 'Identifique os principais aumentos',
    });
  }

  // Alerta de categoria estourada
  Object.entries(dados.orcamentoCategoria).forEach(([categoria, orcamento]) => {
    const despesa = despesasPorCategoria.find((d) => d.categoria === categoria);
    if (despesa && despesa.valor > orcamento) {
      alertas.push({
        id: `orcamento-${categoria}`,
        tipo: 'atencao',
        titulo: `Orçamento Excedido: ${categoria}`,
        mensagem: `Você gastou R$ ${(despesa.valor - orcamento).toFixed(2)} além do orçamento de ${categoria}.`,
        acao: 'Reduza gastos nesta categoria',
      });
    }
  });

  // Alerta de parceladas comprometendo muito do limite
  const totalParcelasMes = parceladas.reduce((acc, p) => acc + p.valorParcela, 0);
  const percentualParcelas = limite > 0 ? (totalParcelasMes / limite) * 100 : 0;
  
  if (percentualParcelas > 30) {
    alertas.push({
      id: 'parcelas-comprometem',
      tipo: 'atencao',
      titulo: 'Parcelas Fixas Altas',
      mensagem: `Parcelas comprometem ${percentualParcelas.toFixed(0)}% do seu limite este mês.`,
      acao: 'Evite novas compras parceladas',
    });
  }

  // Alerta positivo quando parcelada termina no próximo mês
  const proximoMes = new Date();
  proximoMes.setMonth(proximoMes.getMonth() + 1);
  const mesProximo = MESES[proximoMes.getMonth()];
  
  parceladas.forEach((p) => {
    if (p.mesTermino.startsWith(mesProximo)) {
      alertas.push({
        id: `parcela-termina-${p.descricao}`,
        tipo: 'sucesso',
        titulo: `${p.descricao} Termina em ${mesProximo}`,
        mensagem: `R$ ${p.valorParcela.toFixed(2)} serão liberados no caixa.`,
      });
    }
  });

  // Alerta positivo se tudo estiver bem
  if (alertas.length === 0 && taxaPoupanca >= 20) {
    alertas.push({
      id: 'otimo-progresso',
      tipo: 'sucesso',
      titulo: 'Excelente Progresso!',
      mensagem: `Você está guardando ${taxaPoupanca.toFixed(0)}% da sua renda. Continue assim!`,
    });
  }

  return alertas;
}

/**
 * Gera sugestões inteligentes baseadas nos dados
 */
export function gerarSugestoes(
  transacoes: Transacao[],
  dados: DadosPlanilha,
  totaisMesAtual: { receitas: number; despesas: number },
  despesasPorCategoria: DespesaPorCategoria[]
): Sugestao[] {
  const sugestoes: Sugestao[] = [];
  const saldo = totaisMesAtual.receitas - totaisMesAtual.despesas;
  const taxaPoupanca = totaisMesAtual.receitas > 0 
    ? (saldo / totaisMesAtual.receitas) * 100 
    : 0;

  // Sugestão de reserva de emergência
  const reservaAtual = saldo > 0 ? saldo * 6 : 0; // Estimativa simplificada
  if (reservaAtual < dados.metaEmergencia) {
    const falta = dados.metaEmergencia - reservaAtual;
    sugestoes.push({
      id: 'reserva-emergencia',
      titulo: 'Construa sua Reserva de Emergência',
      descricao: `Você ainda precisa de R$ ${falta.toFixed(2)} para atingir 6 meses de despesas.`,
      categoria: 'seguranca',
      impacto: 'Alto',
    });
  }

  // Sugestão de categoria com maior gasto
  const maiorCategoria = despesasPorCategoria[0];
  if (maiorCategoria && maiorCategoria.percentual > 35) {
    sugestoes.push({
      id: 'maior-categoria',
      titulo: `Reduza gastos com ${maiorCategoria.categoria}`,
      descricao: `${maiorCategoria.categoria} representa ${maiorCategoria.percentual.toFixed(0)}% das suas despesas. Considere alternativas mais econômicas.`,
      categoria: 'economia',
      impacto: 'Médio',
    });
  }

  // Sugestão de investimento
  if (taxaPoupanca >= 20 && saldo >= 500) {
    sugestoes.push({
      id: 'investir',
      titulo: 'Invista seu Excedente',
      descricao: `Com uma taxa de poupança de ${taxaPoupanca.toFixed(0)}%, considere investir o excedente para fazer seu dinheiro render.`,
      categoria: 'investimento',
      impacto: 'Alto',
    });
  }

  // Sugestão de meta
  if (saldo > 0 && saldo < dados.metaMensal) {
    const falta = dados.metaMensal - saldo;
    sugestoes.push({
      id: 'atingir-meta',
      titulo: 'Quase lá!',
      descricao: `Faltam R$ ${falta.toFixed(2)} para atingir sua meta de poupança mensal.`,
      categoria: 'meta',
      impacto: 'Médio',
    });
  }

  // Sugestão de gastos recorrentes
  const recorrentes = transacoes.filter((t) => t.recorrente && t.tipo === 'despesa');
  const totalRecorrente = recorrentes.reduce((acc, t) => acc + t.valor, 0);
  if (totalRecorrente > totaisMesAtual.despesas * 0.6) {
    sugestoes.push({
      id: 'gastos-recorrentes',
      titulo: 'Revise Gastos Fixos',
      descricao: `Seus gastos recorrentes representam mais de 60% do total. Renegocie contratos ou cancele serviços não essenciais.`,
      categoria: 'economia',
      impacto: 'Alto',
    });
  }

  return sugestoes;
}

/**
 * Calcula todos os indicadores financeiros
 */
export function calcularTodosIndicadores(dados: DadosPlanilha): IndicadoresFinanceiros {
  const { transacoes, metaMensal } = dados;
  const hoje = new Date();
  
  // Limite mensal (usar meta * 2 ou um valor padrão)
  const limiteMensal = metaMensal > 0 ? metaMensal * 3 : 10000;
  
  // Mês atual e anterior
  const transacoesMesAtual = filtrarPorMes(transacoes, hoje.getMonth(), hoje.getFullYear());
  const transacoesMesAnterior = filtrarPorMes(
    transacoes,
    hoje.getMonth() - 1 < 0 ? 11 : hoje.getMonth() - 1,
    hoje.getMonth() - 1 < 0 ? hoje.getFullYear() - 1 : hoje.getFullYear()
  );

  const totaisMesAtual = calcularTotais(transacoesMesAtual);
  const totaisMesAnterior = calcularTotais(transacoesMesAnterior);

  // KPIs principais
  const saldoAtual = totaisMesAtual.receitas - totaisMesAtual.despesas;
  const taxaPoupanca = totaisMesAtual.receitas > 0 
    ? (saldoAtual / totaisMesAtual.receitas) * 100 
    : 0;

  // Variações
  const saldoAnterior = totaisMesAnterior.receitas - totaisMesAnterior.despesas;
  const variacaoSaldo = saldoAnterior !== 0 
    ? ((saldoAtual - saldoAnterior) / Math.abs(saldoAnterior)) * 100 
    : 0;
  const variacaoReceitas = totaisMesAnterior.receitas > 0 
    ? ((totaisMesAtual.receitas - totaisMesAnterior.receitas) / totaisMesAnterior.receitas) * 100 
    : 0;
  const variacaoDespesas = totaisMesAnterior.despesas > 0 
    ? ((totaisMesAtual.despesas - totaisMesAnterior.despesas) / totaisMesAnterior.despesas) * 100 
    : 0;

  // Progresso da meta
  const progressoMeta = metaMensal > 0 ? (saldoAtual / metaMensal) * 100 : 0;

  // Dados para gráficos
  const evolucaoMensal = calcularEvolucaoMensal(transacoes);
  const despesasPorCategoria = calcularDespesasPorCategoria(transacoes);
  const projecao = calcularProjecao(transacoes, metaMensal);
  
  // Projeção em barra (gauge)
  const projecaoBar = calcularProjecaoBar(transacoes, hoje.getMonth(), hoje.getFullYear(), limiteMensal);
  
  // Parceladas
  const parceladas = calcularParceladas(transacoes, hoje);
  const comprometimentoTotal = calcularComprometimentoTotal(parceladas);
  
  // Metodologia de Orçamento Semanal
  const metodologia = calcularMetodologiaOrcamento(transacoes, hoje.getMonth(), hoje.getFullYear());

  // Alertas e sugestões
  const alertas = gerarAlertas(transacoes, dados, totaisMesAtual, totaisMesAnterior, despesasPorCategoria, parceladas, limiteMensal);
  const sugestoes = gerarSugestoes(transacoes, dados, totaisMesAtual, despesasPorCategoria);

  return {
    saldoAtual,
    receitasMes: totaisMesAtual.receitas,
    despesasMes: totaisMesAtual.despesas,
    taxaPoupanca,
    variacaoSaldo,
    variacaoReceitas,
    variacaoDespesas,
    metaMensal,
    progressoMeta,
    evolucaoMensal,
    despesasPorCategoria,
    projecao,
    projecaoBar,
    parceladas,
    comprometimentoTotal,
    metodologia,
    alertas,
    sugestoes,
  };
}
