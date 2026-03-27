'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Network } from 'lucide-react';

interface SankeyProps {
  receitas: number;
  fixas: number;
  categorias: { nome: string; total: number }[];
}

const CORES_CAT: Record<string, string> = {
  Alimentação: '#ff64ca', Transporte: '#82a1fd', Lazer: '#ffa857',
  Casa: '#01b695', Assinaturas: '#7f77dd', Saúde: '#e24b4a',
  Gatos: '#dffd6e', Moradia: '#5330ff', Compras: '#de7ed1',
  Educação: '#378add', Energia: '#fff245', Gás: '#008257', Outros: '#888780',
};

// Componente customizado para as barras do Sankey
const CustomNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
  const fill = payload.cor || '#888';
  // Decide lado do texto dependendo de onde o nó está
  const textAnchor = x > containerWidth / 2 ? 'end' : 'start';
  const textX = textAnchor === 'end' ? x - 6 : x + width + 6;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx="2" ry="2" className="transition-all hover:opacity-80 cursor-pointer" />
      <text
        x={textX}
        y={y + height / 2}
        dy={4}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-[9px] sm:text-[10px] font-bold fill-foreground font-mono transition-opacity"
      >
        {payload.name}
      </text>
    </g>
  );
};

// Componente para exibir os valores do Tooltip apropriadamente
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Tratamento para payload de links ou nó
    const name = data.name || (data.source?.name + ' → ' + data.target?.name);
    const val = data.value;

    return (
      <div className="bg-popover border border-border/50 text-popover-foreground shadow-xl rounded-lg p-3 z-50 pointer-events-none">
         <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">{name}</p>
         <p className="text-lg font-black">{fmt(val)}</p>
      </div>
    );
  }
  return null;
};

export function SankeyDirecionamento({ receitas, fixas, categorias }: SankeyProps) {
  const data = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    const catAtivas = categorias.filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    const variaveis = catAtivas.reduce((acc, c) => acc + c.total, 0);

    const sobra = Math.max(0, receitas - fixas - variaveis);

    let nodeIdx = 0;
    nodes.push({ name: 'Receita Total', cor: '#3B6D11' }); // Verde escuro para raiz
    const idxReceita = nodeIdx++;

    let idxFixas = -1;
    let idxVar = -1;
    let idxSobra = -1;

    // O fluxo esperado: 
    // Receita -> Desp. Fixas
    // Receita -> Desp. Variáveis -> Categorias
    // Receita -> Sobra Livre (O que não foi gasto)

    const sobraReal = Math.max(0, receitas - fixas - variaveis);

    if (fixas > 0) {
      nodes.push({ name: 'Desp. Fixas', cor: '#378add' });
      idxFixas = nodeIdx++;
      links.push({ source: idxReceita, target: idxFixas, value: fixas });
    }

    if (variaveis > 0) {
      nodes.push({ name: 'Desp. Variáveis', cor: '#EF9F27' }); 
      idxVar = nodeIdx++;
      // A Receita alimenta as despesas variáveis diretamente
      links.push({ source: idxReceita, target: idxVar, value: variaveis });

      // Capilaridade das categorias partindo das variáveis
      catAtivas.forEach(cat => {
        nodes.push({ name: cat.nome, cor: CORES_CAT[cat.nome] || '#888' });
        const idxC = nodeIdx++;
        links.push({ source: idxVar, target: idxC, value: cat.total });
      });
    }

    if (sobraReal > 0) {
      nodes.push({ name: 'Sobra Livre', cor: '#01b695' }); 
      idxSobra = nodeIdx++;
      // A Receita alimenta a Sobra Livre restante
      links.push({ source: idxReceita, target: idxSobra, value: sobraReal });
    }

    if (receitas === 0 && (fixas > 0 || variaveis > 0)) {
       nodes[0].name = 'Origem Indefinida';
    }

    return { nodes, links };
  }, [receitas, fixas, categorias]);

  if (!data || data.nodes.length <= 1) {
    return (
      <Card className="border border-border bg-card card-hover flex flex-col justify-center items-center h-full min-h-[300px]">
        <Network className="h-8 w-8 text-muted/30 mb-2" />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sem fluxo de dados</span>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card card-hover h-full flex flex-col w-full relative overflow-hidden">
      <CardHeader className="pb-0 shrink-0 z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground flex items-center gap-2">
            <Network className="h-4 w-4 text-[#01b695]" />
            Fluxo Financeiro
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 w-full relative p-0 min-h-[300px]">
        {/* Usamos absolute no wrapper para que o ResponsiveContainer cresça livremente */}
        <div className="absolute inset-0 pt-6 px-4 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={data}
              node={<CustomNode />}
              nodePadding={30}
              margin={{ top: 10, right: 60, bottom: 20, left: 10 }} // Espaço pra rótulos
              link={{ stroke: 'currentColor', strokeOpacity: 0.1, fill: 'none' }}
            >
              <RechartsTooltip content={<CustomTooltip />} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
