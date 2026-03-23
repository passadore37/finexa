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
  Alimentação: '#ff64ca',
  Transporte:  '#82a1fd',
  Lazer:       '#ffa857',
  Casa:        '#01b695',
  Assinaturas: '#7f77dd',
  Saúde:       '#e24b4a',
  Gatos:       '#dffd6e',
  Moradia:     '#5330ff',
  Compras:     '#de7ed1',
  Educação:    '#378add',
  Energia:     '#fff245',
  Gás:         '#008257',
  Outros:      '#888780',
};

function getCor(cat: string) {
  return CORES[cat] || '#888780';
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  function handleClick(entry: any, index: number) {
    const cat = entry.categoria;
    if (categoriaAtiva === cat) {
      onCategoriaSelect?.(null);
      setActiveIndex(null);
    } else {
      onCategoriaSelect?.(cat);
      setActiveIndex(index);
    }
  }

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground">Despesas por categoria</CardTitle>
          {categoriaAtiva && (
            <button
              onClick={() => { onCategoriaSelect?.(null); setActiveIndex(null); }}
              className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar filtro ✕
            </button>
          )}
        </div>
        {categoriaAtiva && (
          <p className="text-xs text-muted-foreground mt-1">
            Filtrando por <span className="font-semibold" style={{ color: getCor(categoriaAtiva) }}>{categoriaAtiva}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Gráfico */}
          <div className="w-full sm:w-48 h-48 flex-shrink-0 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="categoria"
                  activeIndex={activeIndex ?? undefined}
                  activeShape={ActiveShape}
                  onClick={handleClick}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {dados.map((entry, i) => (
                    <Cell
                      key={entry.categoria}
                      fill={getCor(entry.categoria)}
                      opacity={categoriaAtiva && categoriaAtiva !== entry.categoria ? 0.25 : 1}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [fmt(value), '']}
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda */}
          <div className="flex-1 w-full space-y-2 min-w-0">
            {dados.map((d, i) => {
              const cor = getCor(d.categoria);
              const isActive = categoriaAtiva === d.categoria;
              const isDimmed = categoriaAtiva && !isActive;
              return (
                <button
                  key={d.categoria}
                  onClick={() => handleClick(d, i)}
                  className="w-full flex items-center gap-2 text-left transition-all rounded-lg px-2 py-1.5"
                  style={{
                    opacity: isDimmed ? 0.3 : 1,
                    background: isActive ? cor : 'transparent',
                    border: isActive ? `1.5px solid ${cor}` : '1.5px solid transparent',
                  }}
                >
                  {/* Ponto colorido — vira check quando ativo */}
                  <div
                    className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: isActive ? 'rgba(0,0,0,0.2)' : `${cor}25`,
                      color: isActive ? '#fff' : cor,
                    }}
                  >
                    {isActive ? '✓' : ''}
                    {!isActive && <span style={{ width: 8, height: 8, borderRadius: 2, background: cor, display: 'block' }} />}
                  </div>

                  {/* Nome */}
                  <span
                    className="text-sm flex-1 truncate font-semibold"
                    style={{ color: isActive ? '#ffffff' : 'var(--foreground)' }}
                  >
                    {d.categoria}
                  </span>

                  {/* Percentual */}
                  <span
                    className="text-[11px] w-8 text-right font-medium"
                    style={{ color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--muted-foreground)' }}
                  >
                    {Math.round(d.percentual)}%
                  </span>

                  {/* Valor */}
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: isActive ? '#ffffff' : 'var(--foreground)' }}
                  >
                    {fmt(d.valor)}
                  </span>
                </button>
              );
            })}
            <div className="flex items-center justify-between pt-2 border-t border-border px-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Total</span>
              <span className="text-sm font-bold tabular-nums text-foreground">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
