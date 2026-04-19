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
  mesAlvo?: number;   // mês sendo visualizado (0-11)
  anoAlvo?: number;   // ano sendo visualizado
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
  'Vestuário', 'Beleza', 'Higiene', 'Pets', 'Viagem', 'Presentes', 'Eletrônicos',
  'Serviços', 'Impostos', 'Dívidas', 'Investimentos', 'Seguro', 'Cuidados', 
  'Academia', 'Trabalho', 'Carro', 'Farmácia'
] as const;

export type CategoriaFinanceira = typeof CATEGORIAS_DISPONIVEIS[number];

export const CORES_CATEGORIAS: Record<string, string> = {
  // Cores principais de altíssimo destaque e contraste
  Alimentação: '#E63946', // Vermelho forte
  Transporte: '#4361EE', // Azul escuro
  Lazer: '#F77F00',      // Laranja
  Casa: '#2A9D8F',       // Teal / Verde escuro
  Assinaturas: '#7209B7',// Roxo escuro
  Saúde: '#F15BB5',      // Rosa Magenta
  Gatos: '#FEE440',      // Amarelo
  Moradia: '#00BBF9',    // Ciano
  Compras: '#9B5DE5',    // Lilás
  Educação: '#38B000',   // Verde forte
  Energia: '#FF9F1C',    // Laranja amarelado
  Gás: '#5F0F40',        // Vinho
  Outros: '#8A817C',     // Cinza
  Vestuário: '#FF5400',
  Beleza: '#FF0054',
  Higiene: '#00F5D4',
  Pets: '#FFD166',
  Viagem: '#0077B6',
  Presentes: '#D90429',
  Eletrônicos: '#48CAE4',
  Serviços: '#6C757D',
  Impostos: '#370617',
  Dívidas: '#03045E',
  Investimentos: '#023E8A',
  Seguro: '#0096C7',
  Cuidados: '#FFB5A7',
  Academia: '#E36414',
  Trabalho: '#0F4C5C',
  Carro: '#9A031E',
  Farmácia: '#CB997E'
};

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function getCorCategoria(cat: string): string {
  if (!cat) return '#8A817C';
  if (CORES_CATEGORIAS[cat]) return CORES_CATEGORIAS[cat];
  
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  // Criar uma cor vibrante para categorias desconhecidas
  return hslToHex(hue, 75, 55); 
}

export function getTextSobreCor(hexCor: string): string {
  // Converte a cor Hex para garantir leitura preta em fundos claros
  const hex = hexCor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.5 ? '#1a1a1a' : '#ffffff';
}

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
  gastoAtualComFixas?: number;
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
