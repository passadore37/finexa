'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Network } from 'lucide-react';

import type { DespesaPorCategoria } from '@/lib/types';

interface SankeyProps {
  receitas: number;
  fixas: number;
  categorias: DespesaPorCategoria[];
  categoriaAtiva?: string | null;
  onCategoriaSelect?: (cat: string | null) => void;
}

const CORES_CAT: Record<string, string> = {
  Alimentação: '#ff64ca', Transporte: '#82a1fd', Lazer: '#ffa857',
  Casa: '#01b695', Assinaturas: '#7f77dd', Saúde: '#e24b4a',
  Gatos: '#dffd6e', Moradia: '#5330ff', Compras: '#de7ed1',
  Educação: '#378add', Energia: '#fff245', Gás: '#008257', Outros: '#888780',
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
      <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-4 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 mb-2 leading-none">{name}</p>
         <p className="text-xl font-black text-[#08080f] tracking-tighter">{fmt(val)}</p>
      </div>
    );
  }
  return null;
};

export function SankeyDirecionamento({ receitas, fixas, categorias, categoriaAtiva, onCategoriaSelect }: SankeyProps) {
  const data = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    const catAtivas = categorias
      .map(c => ({ categoria: c.categoria, valor: Math.round(c.valor) }))
      .filter(c => c.valor > 0 && c.categoria !== 'Despesas Fixas' && c.categoria !== 'Contas Fixas')
      .sort((a, b) => b.valor - a.valor);

    const variaveis = catAtivas.reduce((acc, c) => acc + c.valor, 0);
    const intReceitas = Math.round(receitas);
    const intFixas = Math.round(fixas);
    const sobraReal = Math.max(0, intReceitas - intFixas - variaveis);

    let nodeIdx = 0;
    nodes.push({ name: 'Receita Total', cor: '#5330ff' }); 
    const idxReceita = nodeIdx++;

    let idxFixas = -1;
    let idxVar = -1;
    let idxSobra = -1;

    if (intFixas > 0) {
      nodes.push({ name: 'Desp. Fixas', cor: '#ff64ca' });
      idxFixas = nodeIdx++;
      links.push({ source: idxReceita, target: idxFixas, value: intFixas });
    }

    if (variaveis > 0) {
      nodes.push({ name: 'Desp. Variáveis', cor: '#ffa857' }); 
      idxVar = nodeIdx++;
      links.push({ source: idxReceita, target: idxVar, value: variaveis });

      catAtivas.forEach(cat => {
        nodes.push({ name: cat.categoria, cor: CORES_CAT[cat.categoria] || '#888', isCategoria: true });
        const idxC = nodeIdx++;
        links.push({ source: idxVar, target: idxC, value: cat.valor });
      });
    }

    if (sobraReal > 0) {
      nodes.push({ name: 'Sobra Livre', cor: '#37cc94' }); 
      idxSobra = nodeIdx++;
      links.push({ source: idxReceita, target: idxSobra, value: sobraReal });
    }

    if (intReceitas === 0 && (intFixas > 0 || variaveis > 0)) {
       nodes[0].name = 'Origem Indefinida';
    }

    return { nodes, links };
  }, [receitas, fixas, categorias]);

  if (!data || data.nodes.length <= 1) {
    return (
      <Card className="flex flex-col justify-center items-center h-full min-h-[350px] bg-white/40 border-white/50">
        <Network className="h-10 w-10 text-black/5 mb-4 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20">Sem fluxo de dados para exibir</span>
      </Card>
    );
  }

  const renderNode = (props: any) => {
    const { x, y, width, height, payload, containerWidth } = props;
    const fill = payload.cor || '#888';
    const textAnchor = x > containerWidth / 2 ? 'end' : 'start';
    const textX = textAnchor === 'end' ? x - 10 : x + width + 10;

    const isSelected = categoriaAtiva && categoriaAtiva === payload.name;
    const opacity = isSelected ? 1 : (categoriaAtiva ? 0.2 : 0.9);

    return (
      <g 
        opacity={opacity} 
        onClick={() => {
          if (payload.isCategoria && onCategoriaSelect) {
            onCategoriaSelect(categoriaAtiva === payload.name ? null : payload.name);
          }
        }} 
        className={payload.isCategoria ? "cursor-pointer group" : ""}
      >
        <rect x={x} y={y} width={width} height={height} fill={fill} rx="4" ry="4" className="transition-all duration-500 hover:brightness-110 shadow-sm" />
        <text
          x={textX}
          y={y + height / 2 + 3}
          textAnchor={textAnchor}
          className="text-[10px] font-black fill-[#08080f] uppercase tracking-tighter"
          style={{ opacity: isSelected ? 1 : 0.6 }}
        >
          {payload.name}
        </text>
      </g>
    );
  };

  const renderLink = (props: any) => {
    const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;
    const source = payload?.source || props.source;
    const target = payload?.target || props.target;
    
    if (!source || !target) return null;

    const isTargetSelected = categoriaAtiva && target?.name === categoriaAtiva;
    const strokeOpacity = isTargetSelected ? 0.4 : (categoriaAtiva ? 0.03 : 0.12);

    const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;

    return (
      <path
        d={path}
        stroke={target?.cor || source?.cor || "currentColor"}
        strokeWidth={Math.max(2, linkWidth || 0)}
        strokeOpacity={strokeOpacity}
        fill="none"
        className="transition-all duration-700 pointer-events-none"
      />
    );
  };

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#5330ff]/10 flex items-center justify-center">
            <Network className="h-4 w-4 text-[#5330ff]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Visualização</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Fluxo de Caixa</CardTitle>
          </div>
        </div>
        {categoriaAtiva && (
          <div className="px-3 py-1 rounded-full bg-[#5330ff] text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#5330ff]/10 animate-in fade-in zoom-in-90 duration-300">
            {categoriaAtiva}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 w-full relative p-6 pt-2 min-h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            node={renderNode}
            link={renderLink}
            nodePadding={12}
            margin={{ top: 20, right: 90, bottom: 20, left: 20 }}
          >
            <RechartsTooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
