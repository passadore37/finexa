// lib/ocr-parser.ts — interpreta texto bruto do Tesseract e extrai dados financeiros

export interface OcrResultado {
  valor: number | null;
  descricao: string;
  categoria: string;
  confianca: 'alta' | 'media' | 'baixa';
}

const REGRAS_CATEGORIA: { palavras: string[]; categoria: string }[] = [
  { palavras: ['uber','99','indriver','cabify','corrida','passagem','metro','metrô','ônibus','onibus','combustivel','gasolina','etanol','posto'], categoria: 'Transporte' },
  { palavras: ['ifood','rappi','delivery','restaurante','lanchonete','pizzaria','hamburger','hamburguer','mcdonalds','burger king','subway','starbucks','café','cafe','padaria','mercado','supermercado','hortifruti','feira','açougue','pão de açúcar','carrefour','extra','atacadão','assai'], categoria: 'Alimentação' },
  { palavras: ['farmácia','farmacia','drogaria','drogasil','ultrafarma','droga raia','pacheco','medico','médico','hospital','clinica','consulta','exame','laboratorio','odonto','dentista','unimed','amil'], categoria: 'Saúde' },
  { palavras: ['netflix','spotify','amazon prime','disney','hbo','globoplay','youtube premium','apple tv','deezer','assinatura','mensalidade'], categoria: 'Assinaturas' },
  { palavras: ['energia','enel','cemig','eletropaulo','cpfl','coelba','água','agua','sabesp','cedae','gás','gas','comgás','comgas'], categoria: 'Energia' },
  { palavras: ['academia','smartfit','bodytech','bluefit','gym'], categoria: 'Academia' },
  { palavras: ['escola','faculdade','universidade','curso','livro','livraria','material escolar'], categoria: 'Educação' },
  { palavras: ['amazon','mercado livre','shopee','magazine luiza','magalu','americanas','casas bahia','renner','riachuelo','zara','hm'], categoria: 'Compras' },
  { palavras: ['hotel','airbnb','hospedagem','passagem aérea','aérea','voo','latam','gol','azul','viagem'], categoria: 'Viagem' },
  { palavras: ['salão','beleza','manicure','barbearia','corte de cabelo','estética','estetica'], categoria: 'Beleza' },
  { palavras: ['aluguel','condomínio','condominio','iptu','seguro residencial'], categoria: 'Moradia' },
  { palavras: ['apple','samsung','notebook','celular','smartphone','eletrônico','eletronico'], categoria: 'Eletrônicos' },
  { palavras: ['petshop','ração','racao','veterinário','veterinario','pet'], categoria: 'Pets' },
  { palavras: ['seguro','porto seguro','bradesco seguros','sulamerica'], categoria: 'Seguro' },
];

// Palavras que indicam o nome do estabelecimento/serviço
const DESCRICOES_CONHECIDAS: { palavras: string[]; descricao: string }[] = [
  { palavras: ['uber'], descricao: 'Uber' },
  { palavras: ['99'], descricao: '99' },
  { palavras: ['ifood'], descricao: 'iFood' },
  { palavras: ['rappi'], descricao: 'Rappi' },
  { palavras: ['netflix'], descricao: 'Netflix' },
  { palavras: ['spotify'], descricao: 'Spotify' },
  { palavras: ['amazon prime'], descricao: 'Amazon Prime' },
  { palavras: ['disney'], descricao: 'Disney+' },
  { palavras: ['smartfit'], descricao: 'SmartFit' },
  { palavras: ['carrefour'], descricao: 'Carrefour' },
  { palavras: ['extra'], descricao: 'Supermercado Extra' },
  { palavras: ['pão de açúcar','pao de acucar'], descricao: 'Pão de Açúcar' },
  { palavras: ['atacadão','atacadao'], descricao: 'Atacadão' },
  { palavras: ['drogasil'], descricao: 'Drogasil' },
  { palavras: ['droga raia'], descricao: 'Droga Raia' },
  { palavras: ['magazine luiza','magalu'], descricao: 'Magazine Luiza' },
  { palavras: ['americanas'], descricao: 'Americanas' },
  { palavras: ['mercado livre'], descricao: 'Mercado Livre' },
];

/**
 * Extrai o maior valor monetário do texto OCR
 * Suporta formatos: R$ 45,90 | R$45.90 | 45,90 | Total: 120,00
 */
export function extrairValor(texto: string): number | null {
  const normalizado = texto.replace(/\s+/g, ' ');

  // Padrões em ordem de prioridade
  const padroes = [
    // Total / valor final (maior prioridade)
    /(?:total|valor total|a pagar|cobrado|cobrança|fatura|subtotal)[:\s]+R?\$?\s*(\d{1,6}[.,]\d{2})/gi,
    // R$ seguido de valor
    /R\$\s*(\d{1,6}[.,]\d{2})/gi,
    // Valor seguido de reais
    /(\d{1,6}[.,]\d{2})\s*(?:reais|BRL)/gi,
    // Qualquer número no formato de moeda
    /\b(\d{1,4}[.,]\d{2})\b/g,
  ];

  const candidatos: number[] = [];

  for (const padrao of padroes) {
    const matches = [...normalizado.matchAll(padrao)];
    for (const match of matches) {
      const raw = match[1].replace(',', '.');
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0.5 && num < 50000) {
        candidatos.push(num);
      }
    }
    if (candidatos.length > 0) break; // usar primeiro padrão que der resultado
  }

  if (candidatos.length === 0) return null;

  // Retornar o maior valor encontrado (geralmente é o total)
  return Math.max(...candidatos);
}

/**
 * Determina a categoria com base nas palavras do texto
 */
export function extrairCategoria(texto: string): string {
  const lower = texto.toLowerCase();

  for (const regra of REGRAS_CATEGORIA) {
    if (regra.palavras.some(p => lower.includes(p))) {
      return regra.categoria;
    }
  }

  return 'Outros';
}

/**
 * Extrai uma descrição curta do texto
 */
export function extrairDescricao(texto: string): string {
  const lower = texto.toLowerCase();

  // Verificar descricoes conhecidas primeiro
  for (const item of DESCRICOES_CONHECIDAS) {
    if (item.palavras.some(p => lower.includes(p))) {
      return item.descricao;
    }
  }

  // Tentar extrair o nome do estabelecimento da primeira linha não vazia
  const linhas = texto.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && l.length < 60)
    .filter(l => !/^\d+$/.test(l)) // ignorar linhas só com números
    .filter(l => !/^(r\$|cpf|cnpj|data|hora|tel|end)/i.test(l)); // ignorar campos técnicos

  if (linhas.length > 0) {
    // Limpar e truncar a primeira linha útil
    const descricao = linhas[0]
      .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40);

    if (descricao.length > 2) return descricao;
  }

  return '';
}

/**
 * Calcula a confiança baseada na qualidade do texto extraído
 */
export function calcularConfianca(
  texto: string,
  valor: number | null,
  categoria: string
): 'alta' | 'media' | 'baixa' {
  const palavras = texto.split(/\s+/).length;

  if (!valor) return 'baixa';

  // Texto muito curto = imagem ruim
  if (palavras < 5) return 'baixa';

  // Categoria identificada + valor encontrado = alta confiança
  if (categoria !== 'Outros' && valor > 0) return 'alta';

  // Valor encontrado mas categoria genérica
  if (valor > 0 && palavras >= 10) return 'media';

  return 'baixa';
}

/**
 * Função principal — processa texto OCR e retorna dados estruturados
 */
export function parsearTextoOcr(texto: string): OcrResultado {
  const valor     = extrairValor(texto);
  const categoria = extrairCategoria(texto);
  const descricao = extrairDescricao(texto);
  const confianca = calcularConfianca(texto, valor, categoria);

  return { valor, descricao, categoria, confianca };
}