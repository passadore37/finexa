'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Cores claras que precisam de texto escuro quando usadas como fundo
const CORES_CLARAS = new Set(['#dffd6e', '#fff245', '#ffa857']);

function getTextoCor(cor: string, isActive: boolean) {
  if (!isActive) return 'var(--foreground)';
  return CORES_CLARAS.has(cor) ? '#000000' : '#ffffff';
}

function getTextoCorMuted(cor: string, isActive: boolean) {
  if (!isActive) return 'var(--muted-foreground)';
  return CORES_CLARAS.has(cor) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)';
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

export function CategoriasPieChart({ dados, onCategoriaSelect, categoriaAtiva }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!dados || dados.length === 0) {
    return (
      <Card className="border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="label-uppercase text-muted-foreground">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            Nenhuma despesa este mês
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = dados.reduce((acc, d) => acc + d.valor, 0);
  const activeIndex = categoriaAtiva ? dados.findIndex(d => d.categoria === categoriaAtiva) : -1;

  function handleClick(entry: any) {
    const cat = entry?.categoria || entry?.name;
    if (!cat) return;
    onCategoriaSelect?.(categoriaAtiva === cat ? null : cat);
  }

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground">Despesas por categoria</CardTitle>
          {categoriaAtiva && (
            <button
              onClick={() => onCategoriaSelect?.(null)}
              className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Limpar ✕
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* Gráfico donut */}
          <div className="w-44 h-44 flex-shrink-0 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={72}
                  dataKey="valor" nameKey="categoria"
                  activeIndex={activeIndex >= 0 ? activeIndex : hoverIndex ?? undefined}
                  activeShape={ActiveShape}
                  onClick={(entry) => handleClick(entry)}
                  onMouseEnter={(_, i) => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {dados.map((entry) => (
                    <Cell
                      key={entry.categoria}
                      fill={getCor(entry.categoria)}
                      opacity={categoriaAtiva && categoriaAtiva !== entry.categoria ? 0.2 : 1}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [fmt(value), '']}
                  contentStyle={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda clicável */}
          <div className="flex-1 w-full space-y-1 min-w-0">
            {dados.map((d) => {
              const cor = getCor(d.categoria);
              const isActive = categoriaAtiva === d.categoria;
              const isDimmed = !!categoriaAtiva && !isActive;
              const textoCor = getTextoCor(cor, isActive);
              const textoMuted = getTextoCorMuted(cor, isActive);

              return (
                <button
                  key={d.categoria}
                  onClick={() => handleClick(d)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-150 text-left"
                  style={{
                    opacity: isDimmed ? 0.25 : 1,
                    background: isActive ? cor : 'transparent',
                    border: `1.5px solid ${isActive ? cor : 'transparent'}`,
                  }}
                >
                  {/* Indicador */}
                  <div
                    className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{
                      background: isActive ? 'rgba(0,0,0,0.18)' : `${cor}25`,
                      color: isActive ? textoCor : cor,
                    }}
                  >
                    {isActive ? '✓' : ''}
                    {!isActive && (
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: cor, display: 'block' }} />
                    )}
                  </div>

                  {/* Nome */}
                  <span className="text-sm flex-1 truncate font-semibold" style={{ color: textoCor }}>
                    {d.categoria}
                  </span>

                  {/* Percentual */}
                  <span className="text-[11px] font-medium w-8 text-right" style={{ color: textoMuted }}>
                    {Math.round(d.percentual)}%
                  </span>

                  {/* Valor */}
                  <span className="text-sm font-bold tabular-nums" style={{ color: textoCor }}>
                    {fmt(d.valor)}
                  </span>
                </button>
              );
            })}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-border px-3">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                {categoriaAtiva ? categoriaAtiva : 'Total'}
              </span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {categoriaAtiva
                  ? fmt(dados.find(d => d.categoria === categoriaAtiva)?.valor || 0)
                  : fmt(total)
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
