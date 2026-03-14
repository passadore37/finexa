'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DadosProjecaoBar } from '@/lib/types';

interface ProjecaoBarProps {
  dados: DadosProjecaoBar;
}

export function ProjecaoBar({ dados }: ProjecaoBarProps) {
  const { gastoAtual, projecao, limite } = dados;

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
  const fmtCompact = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  const pctGasto = Math.min((gastoAtual / limite) * 100, 100);
  const pctProjecao = Math.min((projecao / limite) * 100, 110); // permite leve overflow visual
  const overflow = projecao > limite;

  const getCorGasto = () => {
    if (pctGasto >= 90) return '#E24B4A';
    if (pctGasto >= 70) return '#EF9F27';
    return '#D4537E';
  };
  const corGasto = getCorGasto();

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">Projeção de Gastos do Mês</CardTitle>
        <p className="text-[10px] text-muted-foreground mt-1">
          Ritmo diário × dias restantes — projeção linear
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Barra principal */}
        <div className="space-y-2">
          {/* Labels acima */}
          <div className="relative h-5">
            <span className="absolute text-[10px] text-muted-foreground" style={{ left: `${Math.min(pctGasto, 88)}%`, transform: 'translateX(-50%)' }}>
              Hoje
            </span>
            {pctProjecao > pctGasto + 8 && (
              <span className="absolute text-[10px] text-muted-foreground" style={{ left: `${Math.min(pctProjecao, 95)}%`, transform: 'translateX(-50%)' }}>
                Projeção
              </span>
            )}
          </div>

          {/* Barra */}
          <div className="relative h-10 rounded-xl overflow-visible">
            {/* Fundo — representa o limite */}
            <div className="absolute inset-0 rounded-xl bg-secondary border border-border" />

            {/* Área de projeção — sombreada, atrás */}
            {projecao > gastoAtual && (
              <div
                className="absolute top-0 bottom-0 left-0 rounded-xl transition-all duration-700"
                style={{
                  width: `${Math.min(pctProjecao, 100)}%`,
                  background: overflow
                    ? 'repeating-linear-gradient(45deg, rgba(226,75,74,0.15), rgba(226,75,74,0.15) 4px, transparent 4px, transparent 8px)'
                    : `${corGasto}22`,
                  borderRight: `2px dashed ${overflow ? '#E24B4A' : corGasto}88`,
                }}
              />
            )}

            {/* Preenchimento sólido — gasto atual */}
            <div
              className="absolute top-0 bottom-0 left-0 rounded-xl transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${pctGasto}%`, background: corGasto, minWidth: pctGasto > 0 ? '8px' : '0' }}
            >
              {pctGasto > 15 && (
                <span className="text-[10px] font-medium text-white tabular-nums">{Math.round(pctGasto)}%</span>
              )}
            </div>

            {/* Marcador vertical — posição do gasto atual */}
            <div
              className="absolute top-[-4px] bottom-[-4px] w-0.5 rounded-full"
              style={{ left: `${pctGasto}%`, background: corGasto }}
            />
          </div>

          {/* Escala abaixo */}
          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
            <span>R$ 0</span>
            <span>{fmtCompact(limite * 0.25)}</span>
            <span>{fmtCompact(limite * 0.5)}</span>
            <span>{fmtCompact(limite * 0.75)}</span>
            <span className={overflow ? 'text-[#E24B4A]' : ''}>{fmtCompact(limite)}</span>
          </div>
        </div>

        {/* Valores em destaque */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="label-uppercase text-muted-foreground mb-1">Gasto atual</p>
            <p className="text-xl font-medium tabular-nums" style={{ color: corGasto }}>{fmt(gastoAtual)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{Math.round(pctGasto)}% do limite</p>
          </div>
          <div className={`p-3 rounded-lg border ${overflow ? 'bg-[#A32D2D]/10 border-[#A32D2D]/30' : 'bg-secondary/50 border-border'}`}>
            <p className="label-uppercase text-muted-foreground mb-1">Projeção</p>
            <p className={`text-xl font-medium tabular-nums ${overflow ? 'text-[#E24B4A]' : 'text-muted-foreground'}`}>{fmt(projecao)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {overflow ? `+${fmt(projecao - limite)} acima do limite` : `${fmt(limite - projecao)} abaixo do limite`}
            </p>
          </div>
        </div>

        {overflow && (
          <div className="p-3 rounded-lg bg-[#A32D2D]/10 border border-[#A32D2D]/30 flex items-center gap-2">
            <span className="text-[#E24B4A] text-sm">⚠</span>
            <p className="text-xs text-[#E24B4A]">
              No ritmo atual você vai ultrapassar o limite em <strong>{fmt(projecao - limite)}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
