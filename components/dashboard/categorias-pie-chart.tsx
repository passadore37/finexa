'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCorCategoria, type DespesaPorCategoria } from '@/lib/types';

interface Props {
  dados: DespesaPorCategoria[];
  onCategoriaSelect?: (categoria: string | null) => void;
  categoriaAtiva?: string | null;
  getCor?: (nome: string) => string; // prop para categorias customizadas
}

const FUNDO_CLARO = new Set(['#dffd6e', '#fff245', '#ffa857', '#f2f8db']);

function getTextSobreCor(cor: string): string {
  return FUNDO_CLARO.has(cor) ? '#1a1a1a' : '#ffffff';
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 3} outerRadius={outerRadius + 7}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

export function CategoriasPieChart({ dados, onCategoriaSelect, categoriaAtiva, getCor: getCorProp }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverLegenda, setHoverLegenda] = useState<string | null>(null);

  // Resolver cor: usa prop getCor (custom) ou função global
  function resolverCor(cat: string): string {
    return (getCorProp ? getCorProp(cat) : null) || getCorCategoria(cat);
  }

  // Tooltip interno (precisa de resolverCor em escopo)
  function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as DespesaPorCategoria;
    const cor = resolverCor(d.categoria);
    return (
      <div style={{ background: 'var(--card)', border: `1.5px solid ${cor}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: cor, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: 13 }}>{d.categoria}</span>
        </div>
        <div style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{fmt(d.valor)}</div>
        <div style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{Math.round(d.percentual)}% do total</div>
      </div>
    );
  }

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
            <button onClick={() => onCategoriaSelect?.(null)}
              className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors">
              Limpar ✕
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dados} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                  dataKey="valor" nameKey="categoria"
                  activeIndex={activeIndex >= 0 ? activeIndex : hoverIndex ?? undefined}
                  activeShape={ActiveShape}
                  onClick={handleClick}
                  onMouseEnter={(_, i) => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {dados.map((entry) => (
                    <Cell key={entry.categoria} fill={resolverCor(entry.categoria)}
                      opacity={categoriaAtiva && categoriaAtiva !== entry.categoria ? 0.18 : 1}
                      stroke="var(--card)" strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 w-full space-y-1 min-w-0">
            {dados.map((d) => {
              const cor = resolverCor(d.categoria);
              const isActive = categoriaAtiva === d.categoria;
              const isHover = hoverLegenda === d.categoria;
              const isDimmed = !!categoriaAtiva && !isActive;
              const textoSobreCor = getTextSobreCor(cor);
              return (
                <button key={d.categoria} onClick={() => handleClick(d)}
                  onMouseEnter={() => setHoverLegenda(d.categoria)}
                  onMouseLeave={() => setHoverLegenda(null)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-150 text-left"
                  style={{
                    opacity: isDimmed ? 0.2 : 1,
                    background: isActive ? cor : isHover ? `${cor}20` : 'transparent',
                    border: `1.5px solid ${isActive ? cor : isHover ? `${cor}60` : 'transparent'}`,
                  }}
                >
                  <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{ background: isActive ? 'rgba(0,0,0,0.18)' : `${cor}25`, color: isActive ? textoSobreCor : cor }}>
                    {isActive
                      ? <span style={{ color: textoSobreCor, fontSize: 12 }}>✓</span>
                      : <span style={{ width: 8, height: 8, borderRadius: 2, background: cor, display: 'block' }} />
                    }
                  </div>
                  <span className="text-sm flex-1 truncate font-semibold"
                    style={{ color: isActive ? textoSobreCor : 'var(--foreground)' }}>
                    {d.categoria}
                  </span>
                  <span className="text-[11px] font-medium w-8 text-right tabular-nums"
                    style={{ color: isActive ? (FUNDO_CLARO.has(cor) ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)') : 'var(--muted-foreground)' }}>
                    {Math.round(d.percentual)}%
                  </span>
                  <span className="text-sm font-bold tabular-nums"
                    style={{ color: isActive ? textoSobreCor : 'var(--foreground)' }}>
                    {fmt(d.valor)}
                  </span>
                </button>
              );
            })}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-border px-3">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                {categoriaAtiva ? categoriaAtiva : 'Total'}
              </span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {categoriaAtiva ? fmt(dados.find(d => d.categoria === categoriaAtiva)?.valor || 0) : fmt(total)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
