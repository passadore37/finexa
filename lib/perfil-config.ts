// Configuração de cores e identidade por perfil

export type Perfil = 'leticia' | 'giovanna' | 'casal';

export const PERFIL_CONFIG: Record<Perfil, {
  cor: string;
  corSecundaria: string;
  corBg: string;
  nome: string;
  emoji: string;
}> = {
  leticia: {
    cor: '#D4537E',
    corSecundaria: '#99294F',
    corBg: 'rgba(212,83,126,0.1)',
    nome: 'Letícia',
    emoji: '🌸',
  },
  giovanna: {
    cor: '#7B5EA7',
    corSecundaria: '#4A3468',
    corBg: 'rgba(123,94,167,0.1)',
    nome: 'Giovanna',
    emoji: '💜',
  },
  casal: {
    cor: '#D4537E',
    corSecundaria: '#99294F',
    corBg: 'rgba(212,83,126,0.1)',
    nome: 'Todas',
    emoji: '🏠',
  },
};

export function aplicarCorPerfil(perfil: Perfil) {
  if (typeof document === 'undefined') return;
  const config = PERFIL_CONFIG[perfil];
  document.documentElement.style.setProperty('--primary', config.cor);
  document.documentElement.style.setProperty('--ring', config.cor);
}

// Calcula proporção de cada uma baseado nos salários
export function calcularProporcoes(salarioLeticia: number, salarioGiovanna: number) {
  const total = salarioLeticia + salarioGiovanna;
  if (total === 0) return { leticia: 0.5, giovanna: 0.5 };
  return {
    leticia: salarioLeticia / total,
    giovanna: salarioGiovanna / total,
  };
}

// Calcula parte proporcional de uma conta fixa
export function calcularParteFixa(
  valorTotal: number,
  perfil: 'leticia' | 'giovanna',
  salarioLeticia: number,
  salarioGiovanna: number
): number {
  const prop = calcularProporcoes(salarioLeticia, salarioGiovanna);
  return valorTotal * prop[perfil];
}
