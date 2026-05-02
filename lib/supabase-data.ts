import { createClient } from '@supabase/supabase-js';

// Service role bypassa RLS — seguro pois family_id é sempre filtrado explicitamente
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
import type { Transacao, DadosPlanilha, ContaFixaConfig } from './types';

function primeiroValido(...vals: (number | string | null | undefined)[]): number {
  for (const v of vals) {
    if (v === null || v === undefined) continue;
    const n = Number(v);
    if (!isNaN(n) && isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function getMesLabel(mes: number, ano: number): string {
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${meses[mes]}-${String(ano).slice(2)}`;
}

export async function fetchDadosPlanilha(
  family_id: string,
  mes?: number,
  ano?: number
): Promise<DadosPlanilha> {
  const hoje = new Date();
  const mesAlvo = mes !== undefined ? mes : hoje.getMonth();
  const anoAlvo = ano !== undefined ? ano : hoje.getFullYear();

  const inicioMes = new Date(anoAlvo, mesAlvo, 1).toISOString().split('T')[0];
  const fimMes    = new Date(anoAlvo, mesAlvo + 1, 0).toISOString().split('T')[0];
  const mesAntNum = mesAlvo === 0 ? 11 : mesAlvo - 1;
  const anoAntNum = mesAlvo === 0 ? anoAlvo - 1 : anoAlvo;
  const inicioAnt = new Date(anoAntNum, mesAntNum, 1).toISOString().split('T')[0];
  const fimAnt    = new Date(anoAntNum, mesAntNum + 1, 0).toISOString().split('T')[0];

  const [resMes, resAnt, resPl, resPerfis] = await Promise.all([
    getAdmin().from('transacoes').select('*').eq('family_id', family_id)
      .gte('data', inicioMes).lte('data', fimMes).order('data', { ascending: false }),
    getAdmin().from('transacoes').select('*').eq('family_id', family_id)
      .gte('data', inicioAnt).lte('data', fimAnt).order('data', { ascending: false }),
    getAdmin().from('planejamento').select('*').eq('family_id', family_id)
      .order('updated_at', { ascending: false }).limit(1).single(),
    getAdmin().from('perfis').select('id, nome, role').eq('family_id', family_id)
      .order('criado_em', { ascending: true }),
  ]);

  // Mapear perfis reais — membro[0] = 'leticia' lógico, membro[1] = 'giovanna' lógico
  const perfisReais = resPerfis.data || [];
  const roleMap: Record<string, string> = {};
  perfisReais.forEach((p, i) => {
    // Mapeia o role real para o role lógico usado nos cálculos
    if (p.role === 'leticia' || p.role === 'giovanna') {
      roleMap[p.role] = p.role; // manter compatibilidade
    } else {
      // Novos usuários: membro[0] vira 'leticia', membro[1] vira 'giovanna'
      roleMap[p.role] = i === 0 ? 'leticia' : 'giovanna';
    }
    roleMap[p.id] = i === 0 ? 'leticia' : 'giovanna';
  });

  if (resMes.error) throw new Error(`Erro transacoes: ${resMes.error.message}`);

  const pl = resPl.data;

  const salarioLeticia  = primeiroValido(pl?.salario_leticia, process.env.SALARIO_LETICIA);
  const salarioGiovanna = primeiroValido(pl?.salario_giovanna, process.env.SALARIO_GIOVANNA);
  const percentualInvestimento = primeiroValido(pl?.percentual_investimento, 0);
  const limiteMensal    = primeiroValido(pl?.limite_gasto_mensal, pl?.limite, 9000);
  const contasFixasConfig: ContaFixaConfig[] = Array.isArray(pl?.contas_fixas) ? pl.contas_fixas : [];

  function mapRows(rows: any[]): Transacao[] {
    return rows.map(row => {
      // Normalizar o responsavel para role lógico (leticia/giovanna)
      const responsavelOriginal = row.perfil || row.responsavel || undefined;
      const responsavelNormalizado = responsavelOriginal
        ? (roleMap[responsavelOriginal] ?? responsavelOriginal)
        : undefined;
      return {
        id: row.id,
        data: new Date(row.data + 'T12:00:00'),
        descricao: row.descricao,
        categoria: (row.recorrente && row.tipo !== 'receita') ? 'Despesas Fixas' : row.categoria,
        tipo: 'despesa' as const,
        valor: Number(row.valor),
        responsavel: responsavelNormalizado,
        divisao: row.divisao || '50/50',
        recorrente: Boolean(row.recorrente),
        parcelaAtual: Number(row.parcela_atual) || 1,
        totalParcelas: Number(row.total_parcelas) || 1,
        valorTotalCompromisso: row.valor_total_compromisso ? Number(row.valor_total_compromisso) : undefined,
      };
    });
  }

  const rowsMes = resMes.data || [];
  const rowsAnt = resAnt.data || [];
  const transacoes: Transacao[] = [...mapRows(rowsMes), ...mapRows(rowsAnt)];

  // Salários sintéticos — usa nomes reais dos membros
  const nomeMembro0 = perfisReais[0]?.nome ?? 'Membro 1';
  const nomeMembro1 = perfisReais[1]?.nome ?? 'Membro 2';
  if (rowsMes.length > 0) {
    if (salarioLeticia > 0) transacoes.push({ id: `sal-let-${mesAlvo}-${anoAlvo}`, data: new Date(anoAlvo, mesAlvo, 1, 12), descricao: `Salário ${nomeMembro0}`, categoria: 'Salário', tipo: 'receita', valor: salarioLeticia, responsavel: 'leticia', recorrente: true });
    if (salarioGiovanna > 0) transacoes.push({ id: `sal-gio-${mesAlvo}-${anoAlvo}`, data: new Date(anoAlvo, mesAlvo, 1, 12), descricao: `Salário ${nomeMembro1}`, categoria: 'Salário', tipo: 'receita', valor: salarioGiovanna, responsavel: 'giovanna', recorrente: true });
  }
  if (rowsAnt.length > 0) {
    if (salarioLeticia > 0) transacoes.push({ id: `sal-let-${mesAntNum}-${anoAntNum}`, data: new Date(anoAntNum, mesAntNum, 1, 12), descricao: `Salário ${nomeMembro0}`, categoria: 'Salário', tipo: 'receita', valor: salarioLeticia, responsavel: 'leticia', recorrente: true });
    if (salarioGiovanna > 0) transacoes.push({ id: `sal-gio-${mesAntNum}-${anoAntNum}`, data: new Date(anoAntNum, mesAntNum, 1, 12), descricao: `Salário ${nomeMembro1}`, categoria: 'Salário', tipo: 'receita', valor: salarioGiovanna, responsavel: 'giovanna', recorrente: true });
  }

  return { transacoes, limiteMensal, metaEmergencia: primeiroValido(process.env.META_EMERGENCIA, 30000), orcamentoCategoria: {}, salarioLeticia, salarioGiovanna, percentualInvestimento, contasFixasConfig, mesAlvo, anoAlvo };
}

export function gerarDadosDemo(): DadosPlanilha {
  const hoje = new Date();
  const mes = hoje.getMonth(); const ano = hoje.getFullYear();
  const ant = new Date(ano, mes - 1, 10, 12);
  return {
    transacoes: [
      { id: 'sal-let', data: new Date(ano,mes,1,12), descricao: 'Salário Letícia', categoria: 'Salário', tipo: 'receita', valor: 8500, responsavel: 'leticia', recorrente: true },
      { id: 'sal-gio', data: new Date(ano,mes,1,12), descricao: 'Salário Giovanna', categoria: 'Salário', tipo: 'receita', valor: 6500, responsavel: 'giovanna', recorrente: true },
      { id: 'aluguel', data: new Date(ano,mes,5,12), descricao: 'Aluguel', categoria: 'Moradia', tipo: 'despesa', valor: 2200, recorrente: true },
      { id: 'alim', data: new Date(ano,mes,8,12), descricao: 'Supermercado', categoria: 'Alimentação', tipo: 'despesa', valor: 1050, responsavel: 'casal', divisao: '50/50' },
      { id: 'sofa', data: new Date(ano,mes,15,12), descricao: 'Sofá', categoria: 'Casa', tipo: 'despesa', valor: 350, parcelaAtual: 3, totalParcelas: 10 },
      { id: 'ant-sal-let', data: ant, descricao: 'Salário Letícia', categoria: 'Salário', tipo: 'receita', valor: 8500, responsavel: 'leticia', recorrente: true },
      { id: 'ant-sal-gio', data: ant, descricao: 'Salário Giovanna', categoria: 'Salário', tipo: 'receita', valor: 6500, responsavel: 'giovanna', recorrente: true },
      { id: 'ant-alim', data: ant, descricao: 'Alimentação', categoria: 'Alimentação', tipo: 'despesa', valor: 920, responsavel: 'casal', divisao: '50/50' },
    ],
    limiteMensal: 9000, metaEmergencia: 30000, orcamentoCategoria: {}, salarioLeticia: 8500, salarioGiovanna: 6500, percentualInvestimento: 0, contasFixasConfig: [], mesAlvo: mes, anoAlvo: ano,
  };
}
