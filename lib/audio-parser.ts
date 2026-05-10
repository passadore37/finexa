// lib/audio-parser.ts — interpreta texto de voz e extrai dados financeiros

export interface AudioResultado {
  valor: number | null;
  descricao: string;
  categoria: string;
  textoOriginal: string;
}

const REGRAS_CATEGORIA: { palavras: string[]; categoria: string }[] = [
  { palavras: ['uber','99','indriver','cabify','corrida','táxi','taxi','gasolina','combustível','combustivel','posto','metrô','metro','ônibus','onibus','passagem'], categoria: 'Transporte' },
  { palavras: ['ifood','i food','rappi','delivery','restaurante','lanchonete','pizza','hamburguer','hamburger','mc donalds','mcdonalds','burger','subway','café','cafe','padaria','mercado','supermercado','feira','açougue','carrefour','extra','atacadão','atacadao','assai','almoço','almoco','jantar','lanche'], categoria: 'Alimentação' },
  { palavras: ['farmácia','farmacia','drogaria','drogasil','remédio','remedio','médico','medico','hospital','consulta','exame','dentista','odonto','unimed','plano de saúde'], categoria: 'Saúde' },
  { palavras: ['netflix','spotify','amazon','disney','hbo','globoplay','youtube','assinatura','mensalidade','deezer'], categoria: 'Assinaturas' },
  { palavras: ['energia','luz','enel','cemig','água','agua','sabesp','gás','gas','comgás','comgas','conta de luz','conta de água'], categoria: 'Energia' },
  { palavras: ['academia','smartfit','bodytech','bluefit','gym','musculação','musculacao'], categoria: 'Academia' },
  { palavras: ['escola','faculdade','curso','livro','material escolar','mensalidade escolar'], categoria: 'Educação' },
  { palavras: ['amazon','shopee','mercado livre','magazine','americanas','casas bahia','roupa','sapato','shopping'], categoria: 'Compras' },
  { palavras: ['hotel','airbnb','hospedagem','passagem','voo','latam','gol','azul','viagem'], categoria: 'Viagem' },
  { palavras: ['salão','manicure','barbearia','cabelo','beleza','estética','estetica'], categoria: 'Beleza' },
  { palavras: ['aluguel','condomínio','condominio','iptu'], categoria: 'Moradia' },
  { palavras: ['celular','notebook','computador','eletrônico','eletronico','apple','samsung'], categoria: 'Eletrônicos' },
  { palavras: ['pet','pets','ração','racao','veterinário','veterinario','petshop'], categoria: 'Pets' },
  { palavras: ['presente','presentes','gift'], categoria: 'Presentes' },
];

// Palavras numéricas por extenso → número
const NUMEROS_EXTENSO: Record<string, number> = {
  'zero':0,'um':1,'uma':1,'dois':2,'duas':2,'três':3,'tres':3,'quatro':4,
  'cinco':5,'seis':6,'sete':7,'oito':8,'nove':9,'dez':10,'onze':11,
  'doze':12,'treze':13,'quatorze':14,'catorze':14,'quinze':15,
  'dezesseis':16,'dezessete':17,'dezoito':18,'dezenove':19,'vinte':20,
  'trinta':30,'quarenta':40,'cinquenta':50,'sessenta':60,'setenta':70,
  'oitenta':80,'noventa':90,'cem':100,'cento':100,'duzentos':200,
  'trezentos':300,'quatrocentos':400,'quinhentos':500,'seiscentos':600,
  'setecentos':700,'oitocentos':800,'novecentos':900,'mil':1000,
};

const PALAVRAS_CENTAVOS = ['centavos','centavo','reais e','real e'];
const PALAVRAS_REAIS    = ['reais','real','conto','contos','pila','pilas','mangos','mangão'];
const PALAVRAS_IGNORAR  = ['gastei','gasto','paguei','pago','comprei','foi','de','no','na','do','da','o','a','uns','umas','cerca','aproximadamente','mais ou menos'];

/**
 * Converte texto de números por extenso para número
 * Ex: "vinte e três" → 23, "cento e vinte" → 120
 */
function extensoParaNumero(texto: string): number | null {
  const palavras = texto.toLowerCase()
    .replace(/\be\b/g, '') // remover "e" de ligação
    .split(/\s+/)
    .filter(p => p.length > 0);

  let total = 0;
  let atual = 0;

  for (const palavra of palavras) {
    const num = NUMEROS_EXTENSO[palavra];
    if (num === undefined) continue;

    if (num === 1000) {
      atual = atual === 0 ? 1 : atual;
      total += atual * 1000;
      atual = 0;
    } else if (num >= 100) {
      atual += num;
    } else {
      atual += num;
    }
  }

  total += atual;
  return total > 0 ? total : null;
}

/**
 * Extrai valor monetário do texto falado
 * Suporta: "45 reais", "R$ 23,90", "vinte e três reais", "quarenta e cinco reais e noventa centavos"
 */
export function extrairValorAudio(texto: string): number | null {
  const lower = texto.toLowerCase().trim();

  // Padrão 1: número direto com R$ ou reais — "R$ 45,90" ou "45.90 reais"
  const padraoNumerico = /(?:r\$\s*)?(\d+)[,.](\d{2})\s*(?:reais?|real)?/i;
  const matchNumerico = lower.match(padraoNumerico);
  if (matchNumerico) {
    return parseFloat(`${matchNumerico[1]}.${matchNumerico[2]}`);
  }

  // Padrão 2: inteiro simples com "reais" — "45 reais"
  const padraoInteiro = /(\d+)\s*(?:reais?|real|contos?|pilas?)/i;
  const matchInteiro = lower.match(padraoInteiro);
  if (matchInteiro) {
    // Verificar se tem centavos depois
    const centavosMatch = lower.match(/(\d+)\s*(?:reais?|real)\s+e\s+(\d+)\s*(?:centavos?)/i);
    if (centavosMatch) {
      return parseFloat(`${centavosMatch[1]}.${centavosMatch[2].padEnd(2,'0')}`);
    }
    return parseInt(matchInteiro[1]);
  }

  // Padrão 3: valor por extenso — "vinte e três reais"
  // Separar parte de reais e centavos
  const partesReaisCentavos = lower.split(/\s+e\s+(?=\w+\s*centavos?)/i);

  const textoReais = partesReaisCentavos[0];
  const textoCentavos = partesReaisCentavos[1];

  // Remover palavras de reais para parsear o número
  const textoLimpo = textoReais
    .replace(/(?:reais?|real|contos?|pilas?)/gi, '')
    .replace(/\b(gastei|gasto|paguei|pago|comprei|foi|de|no|na|do|da)\b/gi, '')
    .trim();

  const valorReais = extensoParaNumero(textoLimpo);

  if (valorReais) {
    if (textoCentavos) {
      const textoCentavosLimpo = textoCentavos
        .replace(/centavos?/gi, '')
        .trim();
      const valorCentavos = extensoParaNumero(textoCentavosLimpo) ?? 0;
      return parseFloat(`${valorReais}.${String(valorCentavos).padEnd(2,'0').slice(0,2)}`);
    }
    return valorReais;
  }

  return null;
}

/**
 * Extrai categoria com base nas palavras do texto
 */
export function extrairCategoriaAudio(texto: string): string {
  const lower = texto.toLowerCase();
  for (const regra of REGRAS_CATEGORIA) {
    if (regra.palavras.some(p => lower.includes(p))) {
      return regra.categoria;
    }
  }
  return 'Outros';
}

/**
 * Extrai descrição curta do texto falado
 */
export function extrairDescricaoAudio(texto: string): string {
  const lower = texto.toLowerCase();

  // Verificar estabelecimentos conhecidos
  const conhecidos: { palavras: string[]; nome: string }[] = [
    { palavras: ['uber'], nome: 'Uber' },
    { palavras: ['99'], nome: '99' },
    { palavras: ['ifood','i food'], nome: 'iFood' },
    { palavras: ['rappi'], nome: 'Rappi' },
    { palavras: ['netflix'], nome: 'Netflix' },
    { palavras: ['spotify'], nome: 'Spotify' },
    { palavras: ['smartfit'], nome: 'SmartFit' },
    { palavras: ['carrefour'], nome: 'Carrefour' },
    { palavras: ['mercado livre'], nome: 'Mercado Livre' },
    { palavras: ['magazine','magalu'], nome: 'Magazine Luiza' },
    { palavras: ['drogasil'], nome: 'Drogasil' },
    { palavras: ['droga raia'], nome: 'Droga Raia' },
    { palavras: ['amazon'], nome: 'Amazon' },
  ];

  for (const item of conhecidos) {
    if (item.palavras.some(p => lower.includes(p))) {
      return item.nome;
    }
  }

  // Remover palavras de valor e palavras comuns para extrair o que sobra
  const palavrasRemover = [
    ...PALAVRAS_IGNORAR,
    ...PALAVRAS_REAIS,
    ...PALAVRAS_CENTAVOS,
    // números
    ...Object.keys(NUMEROS_EXTENSO),
  ];

  const palavras = texto.split(/\s+/).filter(p => {
    const lower = p.toLowerCase();
    return (
      !palavrasRemover.includes(lower) &&
      !/^\d+([.,]\d+)?$/.test(p) && // não é número
      p.length > 1
    );
  });

  return palavras.slice(0, 4).join(' ').slice(0, 40).trim();
}

/**
 * Função principal — processa texto de voz
 */
export function parsearAudio(texto: string): AudioResultado {
  const valor     = extrairValorAudio(texto);
  const categoria = extrairCategoriaAudio(texto);
  const descricao = extrairDescricaoAudio(texto);

  return { valor, descricao, categoria, textoOriginal: texto };
}