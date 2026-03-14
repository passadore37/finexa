export interface Transacao {
  id: string;
  data: Date;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  responsavel?: string;
  divisao?: string;
  recorrente?: boolean;
  parcelaAtual?: number;
  totalParcelas?: number;
  valorTotalCompromisso?: number;
}

export interface Parcelada {
  descricao: string;
  categoria: string;
  valorParcela: number;
  parcelaAtual: number;
  totalParcelas: number;
  parcelasRestantes: number;
  comprometimentoFuturo: number;
  mesTermino: string;
}

export interface ContaFixaConfig {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
}

export interface DadosPlanilha {
  transacoes: Transacao[];
  limiteMensal: number;
  metaEmergencia: number;
  orcamentoCategoria: Record<string, number>;
  salarioLeticia: number;
  salarioGiovanna: number;
  percentualInvestimento: number;
  contasFixasConfig: ContaFixaConfig[];
}

export interface EvolucaoMensal {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface DespesaPorCategoria {
  categoria: string;
  valor: number;
  percentual: number;
}

export const CATEGORIAS_DISPONIVEIS = [
  'Alimentação', 'Assinaturas', 'Casa', 'Compras', 'Educação',
  'Energia', 'Gás', 'Gatos', 'Lazer', 'Moradia', 'Saúde', 'Transporte', 'Outros',
] as const;

export type CategoriaFinanceira = typeof CATEGORIAS_DISPONIVEIS[number];

export interface ProjecaoFinanceira {
  mes: string;
  saldoProjetado: number;
  saldoOtimista: number;
  saldoPessimista: number;
}

export interface Alerta {
  id: string;
  tipo: 'critico' | 'atencao' | 'info' | 'sucesso';
  titulo: string;
  mensagem: string;
  acao?: string;
}

export interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'economia' | 'investimento' | 'seguranca' | 'meta' | 'geral';
  impacto?: string;
}

export interface DadosProjecaoBar {
  gastoAtual: number;
  projecao: number;
  limite: number;
}

export interface DadosSemana {
  numero: number;
  inicio: Date;
  fim: Date;
  orcamento: number;
  gasto: number;
  disponivel: number;
  percentualGasto: number;
  status: 'futuro' | 'atual' | 'passado';
}

export interface MetodologiaOrcamento {
  salarioMes: number;
  investimento: number;
  percentualInvestimento: number;
  contasFixas: number;
  listaContasFixas: Array<{ descricao: string; valor: number; categoria: string }>;
  totalGastosVariaveis: number;
  semanas: DadosSemana[];
  semanaAtual: number;
  saldoLivre: number;
}

// Indicadores personalizados por perfil
export interface IndicadoresPerfil {
  perfil: 'leticia' | 'giovanna';
  salario: number;
  proporcaoRenda: number; // % do salário total
  parteFixas: number;     // parte proporcional das fixas
  parteParceladas: number;
  gastosVariaveis: number;
  saldoLivre: number;
  comprometimento: number; // % do salário comprometido
  envelopeSemanal: number;
  metaEconomia: number;
  progressoMeta: number;
  categorias: DespesaPorCategoria[];
}

export interface IndicadoresFinanceiros {
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  taxaPoupanca: number;
  variacaoSaldo: number;
  variacaoReceitas: number;
  variacaoDespesas: number;
  limiteMensal: number;
  progressoMeta: number;
  evolucaoMensal: EvolucaoMensal[];
  despesasPorCategoria: DespesaPorCategoria[];
  projecao: ProjecaoFinanceira[];
  projecaoBar: DadosProjecaoBar;
  parceladas: Parcelada[];
  comprometimentoTotal: number;
  metodologia: MetodologiaOrcamento;
  alertas: Alerta[];
  sugestoes: Sugestao[];
  // Indicadores por perfil
  perfilLeticia: IndicadoresPerfil;
  perfilGiovanna: IndicadoresPerfil;
}
