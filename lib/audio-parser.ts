// lib/audio-parser.ts — interpreta texto de voz e extrai dados financeiros

export interface AudioResultado {
  valor: number | null;
  descricao: string;
  categoria: string;
  textoOriginal: string;
}

const REGRAS_CATEGORIA: { palavras: string[]; categoria: string }[] = [
  { palavras: ['uber','99','indriver','cabify','corrida','táxi','taxi','gasolina','combustível','combustivel','posto','metrô','metro','ônibus','onibus','passagem'], categoria: 'Transporte' },
  { palavras: ['ifood','i food','rappi','delivery','restaurante','lanchonete','pizza','hamburguer','hamburger','mc donalds','mcdonalds','burger','subway','café','cafe','padaria','mercado','supermercado','feira','açougue','carrefour','extra','atacadão','atacadao','assai','almoço','almoco','jantar','lanche','comida'], categoria: 'Alimentação' },
  { palavras: ['farmácia','farmacia','drogaria','drogasil','remédio','remedio','médico','medico','hospital','consulta','exame','dentista','odonto','unimed','plano de saúde'], categoria: 'Saúde' },
  { palavras: ['netflix','spotify','amazon','disney','hbo','globoplay','youtube','assinatura','mensalidade','deezer'], categoria: 'Assinaturas' },
  { palavras: ['energia','luz','enel','cemig','água','agua','sabesp','gás','gas','comgás','comgas','conta de luz','conta de água'], categoria: 'Energia' },
  { palavras: ['academia','smartfit','bodytech','bluefit','gym','musculação','musculacao'], categoria: 'Academia' },
  { palavras: ['escola','faculdade','curso','livro','material escolar','mensalidade escolar'], categoria: 'Educação' },
  { palavras: ['shopee','mercado livre','magazine','americanas','casas bahia','roupa','sapato','shopping','zara'], categoria: 'Compras' },
  { palavras: ['hotel','airbnb','hospedagem','voo','latam','gol','azul','viagem'], categoria: 'Viagem' },
  { palavras: ['salão','manicure','barbearia','cabelo','beleza','estética','estetica'], categoria: 'Beleza' },
  { palavras: ['aluguel','condomínio','condominio','iptu'], categoria: 'Moradia' },
  { palavras: ['celular','notebook','computador','eletrônico','eletronico','apple','samsung'], categoria: 'Eletrônicos' },
  { palavras: ['pet','pets','ração','racao','veterinário','veterinario','petshop'], categoria: 'Pets' },
  { palavras: ['presente','presentes'], categoria: 'Presentes' },
  { palavras: ['seguro','porto seguro'], categoria: 'Seguro' },
  { palavras: ['farmácia','farmacia','remédio','remedio'], categoria: 'Farmácia' },
];

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

function extensoParaNumero(texto: string): number | null {
  const palavras = texto.toLowerCase()
    .replace(/\be\b/g, '')
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
 * Extrai valor monetário do texto falado.
 * Suporta dígitos diretos ("23 reais", "45,90") e extenso ("vinte e três reais").
 */
export function extrairValorAudio(texto: string): number | null {
  const lower = texto.toLowerCase().trim();

  // Padrão 1: número com centavos — "45,90" ou "45.90"
  const matchDecimal = lower.match(/(\d{1,5})[,.](\d{2})/);
  if (matchDecimal) {
    return parseFloat(`${matchDecimal[1]}.${matchDecimal[2]}`);
  }

  // Padrão 2: inteiro com "reais" e centavos por extenso — "45 reais e 90 centavos"
  const matchReaisCentavos = lower.match(/(\d{1,5})\s*(?:reais?|real)?\s+e\s+(\d{1,2})\s*(?:centavos?)/i);
  if (matchReaisCentavos) {
    return parseFloat(`${matchReaisCentavos[1]}.${matchReaisCentavos[2].padEnd(2,'0')}`);
  }

  // Padrão 3: inteiro simples com palavra de valor — "45 reais", "45 pila"
  const matchInteiro = lower.match(/(\d{1,5})\s*(?:reais?|real|contos?|pilas?|mangos?|mangão)/i);
  if (matchInteiro) {
    return parseInt(matchInteiro[1]);
  }

  // Padrão 4: número isolado no final ou início — "uber 45", "23 mercado"
  // (quando o usuário fala sem "reais")
  const matchNumeroSolto = lower.match(/\b(\d{1,5})\b/);
  if (matchNumeroSolto) {
    const num = parseInt(matchNumeroSolto[1]);
    // Ignorar números muito pequenos que provavelmente são parte de nomes ("99", "24h")
    // mas aceitar se for o único número e fizer sentido como valor
    if (num >= 1 && num <= 9999) return num;
  }

  // Padrão 5: valor totalmente por extenso — "vinte e três reais"
  const semPalavrasValor = lower
    .replace(/(?:reais?|real|contos?|pilas?)/gi, '')
    .replace(/\b(gastei|gasto|paguei|pago|comprei|foi|de|no|na|do|da|o|a)\b/gi, '')
    .trim();

  const valorExtenso = extensoParaNumero(semPalavrasValor);
  if (valorExtenso) return valorExtenso;

  return null;
}

/**
 * Determina a categoria com base nas palavras do texto
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

  const conhecidos: { palavras: string[]; nome: string }[] = [
    // Transporte
    { palavras: ['uber'], nome: 'Uber' },
    { palavras: ['99','noventa e nove'], nome: '99' },
    { palavras: ['indriver','in driver'], nome: 'InDriver' },
    { palavras: ['cabify'], nome: 'Cabify' },
    { palavras: ['buser'], nome: 'Buser' },

    // Delivery
    { palavras: ['ifood','i food'], nome: 'iFood' },
    { palavras: ['rappi'], nome: 'Rappi' },
    { palavras: ['james delivery','james'], nome: 'James Delivery' },
    { palavras: ['deliveroo'], nome: 'Deliveroo' },

    // Fast food
    { palavras: ['mc donalds','mcdonalds','mcdonald'], nome: "McDonald's" },
    { palavras: ['burger king','burguer king'], nome: 'Burger King' },
    { palavras: ['subway'], nome: 'Subway' },
    { palavras: ['bob','bobs'], nome: "Bob's" },
    { palavras: ['giraffas'], nome: 'Giraffas' },
    { palavras: ['popeyes','popeye'], nome: "Popeyes" },
    { palavras: ['china in box','china inbox'], nome: 'China in Box' },
    { palavras: ['dominos','dominós'], nome: "Domino's" },
    { palavras: ['pizza hut'], nome: 'Pizza Hut' },
    { palavras: ['outback'], nome: 'Outback' },
    { palavras: ['madero'], nome: 'Madero' },
    { palavras: ['spoleto'], nome: 'Spoleto' },
    { palavras: ['habib','habibs',"habib's"], nome: "Habib's" },

    // Café / padaria
    { palavras: ['starbucks'], nome: 'Starbucks' },
    { palavras: ['padaria'], nome: 'Padaria' },
    { palavras: ['café','cafe'], nome: 'Café' },
    { palavras: ['kopenhagen'], nome: 'Kopenhagen' },
    { palavras: ['cacau show'], nome: 'Cacau Show' },

    // Supermercados
    { palavras: ['pão de açúcar','pao de acucar','pao de açucar'], nome: 'Pão de Açúcar' },
    { palavras: ['carrefour'], nome: 'Carrefour' },
    { palavras: ['extra'], nome: 'Extra' },
    { palavras: ['atacadão','atacadao'], nome: 'Atacadão' },
    { palavras: ['assai','assaí'], nome: "Assaí" },
    { palavras: ['sam\'s club','sams club','sams'], nome: "Sam's Club" },
    { palavras: ['costco'], nome: 'Costco' },
    { palavras: ['dia supermercado','supermercado dia'], nome: 'Dia' },
    { palavras: ['sendas'], nome: 'Sendas' },
    { palavras: ['prezunic'], nome: 'Prezunic' },
    { palavras: ['mundial'], nome: 'Supermercado Mundial' },
    { palavras: ['hortifruti'], nome: 'Hortifruti' },
    { palavras: ['natural da terra'], nome: 'Natural da Terra' },
    { palavras: ['mercadinho','mercadão'], nome: 'Mercado' },

    // Streaming
    { palavras: ['netflix'], nome: 'Netflix' },
    { palavras: ['spotify'], nome: 'Spotify' },
    { palavras: ['amazon prime','prime video'], nome: 'Amazon Prime' },
    { palavras: ['disney','disney plus','disney+'], nome: 'Disney+' },
    { palavras: ['hbo','max','hbo max'], nome: 'Max' },
    { palavras: ['globoplay'], nome: 'Globoplay' },
    { palavras: ['youtube premium','youtube'], nome: 'YouTube Premium' },
    { palavras: ['apple tv','apple tv plus'], nome: 'Apple TV+' },
    { palavras: ['deezer'], nome: 'Deezer' },
    { palavras: ['tidal'], nome: 'Tidal' },
    { palavras: ['paramount','paramount plus'], nome: 'Paramount+' },
    { palavras: ['star plus','star+'], nome: 'Star+' },
    { palavras: ['mubi'], nome: 'Mubi' },
    { palavras: ['twitch'], nome: 'Twitch' },
    { palavras: ['crunchyroll'], nome: 'Crunchyroll' },

    // Academias
    { palavras: ['smartfit','smart fit'], nome: 'SmartFit' },
    { palavras: ['bodytech','body tech'], nome: 'Bodytech' },
    { palavras: ['bluefit','blue fit'], nome: 'Bluefit' },
    { palavras: ['bio ritmo','bioritmo'], nome: 'Bio Ritmo' },
    { palavras: ['competition','competition fitness'], nome: 'Competition' },
    { palavras: ['runner','runner fitness'], nome: 'Runner' },
    { palavras: ['selfit','sel fit'], nome: 'Selfit' },
    { palavras: ['crossfit'], nome: 'CrossFit' },
    { palavras: ['academia'], nome: 'Academia' },

    // Farmácias
    { palavras: ['drogasil'], nome: 'Drogasil' },
    { palavras: ['droga raia','drogaraia'], nome: 'Droga Raia' },
    { palavras: ['ultrafarma'], nome: 'Ultrafarma' },
    { palavras: ['pacheco'], nome: 'Pacheco' },
    { palavras: ['pague menos'], nome: 'Pague Menos' },
    { palavras: ['panvel'], nome: 'Panvel' },
    { palavras: ['nissei'], nome: 'Nissei' },
    { palavras: ['droga mais','drogamais'], nome: 'Droga Mais' },
    { palavras: ['farmácia','farmacia'], nome: 'Farmácia' },

    // E-commerce
    { palavras: ['amazon'], nome: 'Amazon' },
    { palavras: ['mercado livre','mercadolivre'], nome: 'Mercado Livre' },
    { palavras: ['shopee'], nome: 'Shopee' },
    { palavras: ['americanas'], nome: 'Americanas' },
    { palavras: ['magazine luiza','magazine','magalu'], nome: 'Magazine Luiza' },
    { palavras: ['casas bahia','casasbahia'], nome: 'Casas Bahia' },
    { palavras: ['submarino'], nome: 'Submarino' },
    { palavras: ['aliexpress'], nome: 'AliExpress' },
    { palavras: ['shein'], nome: 'Shein' },
    { palavras: ['netshoes'], nome: 'Netshoes' },
    { palavras: ['centauro'], nome: 'Centauro' },

    // Moda
    { palavras: ['zara'], nome: 'Zara' },
    { palavras: ['hm','h&m','h e m'], nome: 'H&M' },
    { palavras: ['renner'], nome: 'Renner' },
    { palavras: ['riachuelo'], nome: 'Riachuelo' },
    { palavras: ['c&a','c e a'], nome: 'C&A' },
    { palavras: ['forever 21','forever21'], nome: 'Forever 21' },
    { palavras: ['farm'], nome: 'Farm' },
    { palavras: ['arezzo'], nome: 'Arezzo' },

    // Outros frequentes
    { palavras: ['spotify'], nome: 'Spotify' },
    { palavras: ['apple','apple store'], nome: 'Apple' },
    { palavras: ['google play','google'], nome: 'Google Play' },
    { palavras: ['steam'], nome: 'Steam' },
    { palavras: ['nubank'], nome: 'Nubank' },
    { palavras: ['inter','banco inter'], nome: 'Banco Inter' },
  ];

  for (const item of conhecidos) {
    if (item.palavras.some(p => lower.includes(p))) {
      return item.nome;
    }
  }

  // Remover números e palavras de valor para extrair nome
  const palavrasRemover = [
    'gastei','gasto','paguei','pago','comprei','foi','de','no','na',
    'do','da','o','a','uns','umas','reais','real','centavos','centavo',
    'contos','pila','pilas','e',
    ...Object.keys(NUMEROS_EXTENSO),
  ];

  const palavras = texto.split(/\s+/).filter(p => {
    const l = p.toLowerCase();
    return (
      !palavrasRemover.includes(l) &&
      !/^\d+([.,]\d+)?$/.test(p) &&
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