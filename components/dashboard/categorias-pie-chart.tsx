'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieIcon, ChevronRight } from 'lucide-react';
import type { DespesaPorCategoria } from '@/lib/types';

interface Props {
  dados: DespesaPorCategoria[];
  onCategoriaSelect?: (categoria: string | null) => void;
  categoriaAtiva?: string | null;
}

const CORES: Record<string, string> = {
  Alimentação: '#ff64ca', Transporte: '#82a1fd', Lazer: '#ffa857',
  Casa: '#01b695', Assinaturas: '#7f77dd', Saúde: '#e24b4a',
  Gatos: '#dffd6e', Moradia: '#5330ff', Compras: '#de7ed1',
  Educação: '#378add', Energia: '#fff245', Gás: '#008257', Outros: '#888780',
};

function getCor(cat: string) { return CORES[cat] || '#888780'; }

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// Shape expandido para fatia ativa
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        rx={6}
        className="transition-all duration-500"
        filter="url(#glow)"
      />
    </g>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DespesaPorCategoria;
  const cor = getCor(d.categoria);
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-4 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: cor }} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none">{d.categoria}</span>
      </div>
      <div className="text-xl font-black text-[#08080f] tracking-tighter">{fmt(d.valor)}</div>
      <div className="text-[10px] font-bold text-[#5330ff] uppercase tracking-widest mt-1">
        {Math.round(d.percentual)}% do total
      </div>
    </div>
  );
}

export function CategoriasPieChart({ dados, onCategoriaSelect, categoriaAtiva }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!dados || dados.length === 0) {
    return (
      <Card className="flex flex-col justify-center items-center h-full min-h-[350px] bg-white/40 border-white/50">
        <PieIcon className="h-10 w-10 text-black/5 mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20">Sem despesas este mês</span>
      </Card>
    );
  }

  const total = dados.reduce((acc, d) => acc + d.valor, 0);
  const activeIndex = categoriaAtiva ? dados.findIndex(d => d.categoria === categoriaAtiva) : -1;

  function handleClick(entry: any) {
    const cat = entry?.categoria || entry?.name || entry?.payload?.categoria;
    if (!cat) return;
    onCategoriaSelect?.(categoriaAtiva === cat ? null : cat);
  }

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#ff64ca]/10 flex items-center justify-center">
            <PieIcon className="h-4 w-4 text-[#ff64ca]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Distribuição</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Por Categoria</CardTitle>
          </div>
        </div>
        {categoriaAtiva && (
          <button
            onClick={() => onCategoriaSelect?.(null)}
            className="px-3 py-1 rounded-full bg-[#08080f]/5 hover:bg-[#08080f]/10 text-[8px] font-black uppercase tracking-[0.2em] transition-colors"
          >
            Limpar ✕
          </button>
        )}
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Gráfico donut */}
          <div className="relative w-56 h-56 flex-shrink-0 animate-in fade-in zoom-in-95 duration-700">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  dataKey="valor" nameKey="categoria"
                  activeIndex={activeIndex >= 0 ? activeIndex : hoverIndex ?? undefined}
                  activeShape={ActiveShape}
                  onClick={handleClick}
                  onMouseEnter={(_, i) => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                  paddingAngle={4}
                  stroke="none"
                >
                  {dados.map((entry) => (
                    <Cell
                      key={entry.categoria}
                      fill={getCor(entry.categoria)}
                      opacity={categoriaAtiva && categoriaAtiva !== entry.categoria ? 0.15 : 1}
                      className="transition-all duration-500"
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Sombras e labels centrais */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[8px] font-black text-[#08080f]/20 uppercase tracking-[0.2em] mb-0.5">Total</p>
              <p className="text-xl font-black text-[#08080f] tracking-tighter">
                {categoriaAtiva 
                  ? fmt(dados.find(d => d.categoria === categoriaAtiva)?.valor || 0)
                  : fmt(total)
                }
              </p>
            </div>
          </div>

          {/* Legenda clicável prêmio */}
          <div className="flex-1 w-full space-y-2 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {dados.map((d) => {
                const cor = getCor(d.categoria);
                const isActive = categoriaAtiva === d.categoria;
                const isDimmed = !!categoriaAtiva && !isActive;

                return (
                  <button
                    key={d.categoria}
                    onClick={() => handleClick(d)}
                    className={`w-full group/item flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border ${
                      isActive 
                      ? 'bg-white shadow-xl shadow-[#08080f]/5 border-[#08080f]/5 scale-[1.02] z-10' 
                      : 'bg-black/[0.02] border-transparent hover:bg-white hover:border-[#08080f]/5 hover:shadow-lg'
                    } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110"
                      style={{ background: `${cor}15` }}
                    >
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: cor }} />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-black text-[#08080f] truncate uppercase tracking-tight">
                          {d.categoria}
                        </span>
                        <span className="text-[10px] font-black text-[#08080f]/20 tabular-nums">
                          {Math.round(d.percentual)}%
                        </span>
                      </div>
                      <p className="text-sm font-black text-[#08080f] tracking-tighter leading-none">
                        {fmt(d.valor)}
                      </p>
                    </div>
                    
                    <ChevronRight className={`h-4 w-4 transition-all ${isActive ? 'text-[#5330ff] translate-x-0' : 'text-[#08080f]/5 -translate-x-2 group-hover/item:text-[#08080f]/20 group-hover/item:translate-x-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
