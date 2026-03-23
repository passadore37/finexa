// Tipos para transações financeiras
export interface Transacao {
  id: string;
  data: Date;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  responsavel?: string;
  observacoes?: string;
  recorrente?: boolean;
  // Campos para parceladas
  parcelaAtual?: number;
  totalParcelas?: number;
  valorTotalCompromisso?: number;
}

// Parceladas
export interface Parcelada {
  descricao: string;
  categoria: string;
  valorParcela: number;
  parcelaAtual: number;
  totalParcelas: number;
  parcelasRestantes: number;
  comprometimentoFuturo: number; // valorParcela * parcelasRestantes
  mesTermino: string; // calcular a partir do mês atual
}

// Dados da planilha
export interface ContaFixaConfig {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
}

export interface DadosPlanilha {
  transacoes: Transacao[];
  metaMensal: number;
  metaEmergencia: number;
  orcamentoCategoria: Record<string, number>;
  // Campos de salário e planejamento
  salarioLeticia?: number;
  salarioGiovanna?: number;
  percentualInvestimento?: number;
  limiteMensal?: number;
  contasFixasConfig?: ContaFixaConfig[];
}

// Evolução mensal
export interface EvolucaoMensal {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

// Despesas por categoria
export interface DespesaPorCategoria {
  categoria: string;
  valor: number;
  percentual: number;
}

// Categorias disponíveis
export const CATEGORIAS_DISPONIVEIS = [
  'Alimentação',
  'Assinaturas',
  'Casa',
  'Compras',
  'Educação',
  'Energia',
  'Gás',
  'Gatos',
  'Lazer',
  'Moradia',
  'Saúde',
  'Transporte',
  'Outros',
] as const;

export type CategoriaFinanceira = typeof CATEGORIAS_DISPONIVEIS[number];

// Projeção financeira
export interface ProjecaoFinanceira {
  mes: string;
  saldoProjetado: number;
  saldoOtimista: number;
  saldoPessimista: number;
}

// Tipos de alerta
export interface Alerta {
  id: string;
  tipo: 'critico' | 'atencao' | 'info' | 'sucesso';
  titulo: string;
  mensagem: string;
  acao?: string;
}

// Triggers para alertas
export interface AlertaTrigger {
  id: string;
  tipo: 'limite_excedido' | 'categoria_limite' | 'saldo_baixo' | 'meta_atingida' | 'gasto_alto';
  ativo: boolean;
  parametro?: number; // ex: percentual do limite
  descricao: string;
}

// Sugestão de otimização
export interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'economia' | 'investimento' | 'seguranca' | 'meta' | 'geral';
  impacto?: string;
}

// Dados da barra de projeção (gauge)
export interface DadosProjecaoBar {
  gastoAtual: number;
  projecao: number;
  limite: number;
}

// Metodologia de Orçamento Semanal
export interface DadosSemana {
  numero: number; // 1, 2, 3, 4 (ou 5)
  inicio: Date;
  fim: Date;
  orcamento: number; // valor destinado para a semana
  gasto: number; // valor já gasto
  disponivel: number; // orcamento - gasto
  percentualGasto: number;
  status: 'futuro' | 'atual' | 'passado';
}

export interface MetodologiaOrcamento {
  // Etapa 1: Salário
  salarioMes: number;
  
  // Etapa 2: Investimento (10%)
  investimento: number;
  percentualInvestimento: number;
  
  // Etapa 3: Contas Fixas
  contasFixas: number;
  listaContasFixas: Array<{
    descricao: string;
    valor: number;
    categoria: string;
  }>;
  
  // Etapa 4: Dinheiro para Gastos (dividido em semanas)
  totalGastosVariaveis: number;
  semanas: DadosSemana[];
  semanaAtual: number;
  
  // Status geral
  saldoLivre: number; // o que sobrou após tudo
}

// Contexto de usuária
export interface ContextoUsuaria {
  usuariaAtiva: 'leticia' | 'giovanna' | 'casal';
  mostrarApenasGastos: boolean;
}

// Indicadores financeiros calculados
// Indicadores por perfil individual
export interface IndicadoresPerfil {
  salario: number;
  proporcaoRenda: number;
  parteFixas: number;
  parteParceladas: number;
  gastosVariaveis: number;
  saldoLivre: number;
  comprometimento: number;
  envelopeSemanal: number;
  metaEconomia: number;
  progressoMeta: number;
  categorias: DespesaPorCategoria[];
}

export interface IndicadoresFinanceiros {
  // KPIs principais
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  taxaPoupanca: number;
  
  // Variações
  variacaoSaldo: number;
  variacaoReceitas: number;
  variacaoDespesas: number;
  
  // Meta
  metaMensal: number;
  progressoMeta: number;
  
  // Dados para gráficos
  evolucaoMensal: EvolucaoMensal[];
  despesasPorCategoria: DespesaPorCategoria[];
  projecao: ProjecaoFinanceira[];
  projecaoBar: DadosProjecaoBar;
  
  // Parceladas
  parceladas: Parcelada[];
  comprometimentoTotal: number;
  
  // Metodologia de Orçamento Semanal
  metodologia: MetodologiaOrcamento;
  
  // Alertas e sugestões
  alertas: Alerta[];
  sugestoes: Sugestao[];
  // Indicadores por perfil
  perfilLeticia: IndicadoresPerfil;
  perfilGiovanna: IndicadoresPerfil;
}
