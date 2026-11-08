'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import type { DadosProjecaoBar } from '@/lib/types';

interface ProjecaoBarProps {
  dados: DadosProjecaoBar;
  onAjustarLimite?: (valor: number) => void;
  perfilGeral?: boolean;
  fixas?: number;
  corPerfil?: string;
  nomePerfil?: string;
}

export function ProjecaoBar({ dados, onAjustarLimite, perfilGeral, fixas = 0, corPerfil, nomePerfil }: ProjecaoBarProps) {
  const router = useRouter();
const { gastoAtual, gastoAtualComFixas, projecao, limite: limiteRaw } = dados;
const limite = typeof limiteRaw === 'number' && !isNaN(limiteRaw) ? limiteRaw : 0;
const valorFixas = fixas > 0 ? fixas : Math.max(0, (gastoAtualComFixas ?? gastoAtual) - gastoAtual);
const projecaoComFixas = projecao + valorFixas;

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(limite);

  useEffect(() => {
    setInputValue(limite);
  }, [limite]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v);

  const fmtCompact = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(v);

  const handleAjustarLimiteClick = () => {
    setInputValue(limite);
    setOpen(true);
  };

  // O limite vale para o mês inteiro: fixas + parcelas + variáveis. Todas as
  // comparações usam os totais com fixas, para a barra, o "% do limite" e o
  // texto "acima/abaixo" dizerem sempre a mesma coisa.
  const limiteSafe = limite > 0 ? limite : 1;
  const totalAtual = gastoAtualComFixas ?? gastoAtual;
  const pctReal = (totalAtual / limiteSafe) * 100;
  const pctGasto = Math.min(pctReal, 100);
  const pctProjecao = Math.min((projecaoComFixas / limiteSafe) * 100, 110);
  const overflow = limite > 0 && projecaoComFixas > limite;
  const jaPassou = limite > 0 && totalAtual > limite;
  const leftHoje = Math.min(pctGasto, 88);
  const leftProj = Math.min(pctProjecao, 95);
  const mostrarRotuloProjecao = projecaoComFixas > totalAtual && leftProj - leftHoje >= 16;

  const getCorGasto = () => {
    if (pctGasto >= 90) return '#E24B4A';
    if (pctGasto >= 70) return '#EF9F27';
    return corPerfil || '#D4537E';
  };

  const corGasto = getCorGasto();

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="label-uppercase text-muted-foreground">
              Gastos x Meta {nomePerfil ? `— ${nomePerfil}` : ''}
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1">
              Limite do mês inteiro. Fixas e parcelas entram com o valor cheio; só os gastos variáveis seguem o ritmo dos dias
            </p>
          </div>
          {(!perfilGeral || limite === 0) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAjustarLimiteClick}
              className="whitespace-nowrap"
            >
              {limite === 0 ? 'Definir limite' : 'Ajustar limite'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Barra principal */}
        <div className="space-y-2">
          <div className="relative h-5">
            <span
              className="absolute text-[10px] text-muted-foreground"
              style={{
                left: `${leftHoje}%`,
                transform: 'translateX(-50%)',
              }}
            >
              Hoje
            </span>

            {mostrarRotuloProjecao && (
              <span
                className="absolute text-[10px] text-muted-foreground"
                style={{
                  left: `${leftProj}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                Projeção
              </span>
            )}
          </div>

          <div className="relative h-10 rounded-xl overflow-visible">
            <div className="absolute inset-0 rounded-xl bg-secondary border border-border" />

            {projecaoComFixas > (gastoAtualComFixas ?? gastoAtual) && (
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

            <div
              className="absolute top-0 bottom-0 left-0 rounded-xl transition-all duration-700 flex items-center justify-end pr-2"
              style={{
                width: `${pctGasto}%`,
                background: corGasto,
                minWidth: pctGasto > 0 ? '8px' : '0',
              }}
            >
              {pctGasto > 15 && (
                <span className="text-[10px] font-medium text-white tabular-nums">
                  {Math.round(pctReal)}%
                </span>
              )}
            </div>

            <div
              className="absolute top-[-4px] bottom-[-4px] w-0.5 rounded-full"
              style={{ left: `${pctGasto}%`, background: corGasto }}
            />
          </div>

          {/* Labels do eixo X — só mostra se limite > 0 */}
          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
  <span>R$ 0</span>
  {limite > 0 ? (
    <>
      <span>{fmtCompact(limite * 0.25)}</span>
      <span>{fmtCompact(limite * 0.5)}</span>
      <span>{fmtCompact(limite * 0.75)}</span>
      <span className={overflow ? 'text-[#E24B4A]' : ''}>{fmtCompact(limite)}</span>
    </>
  ) : (
    <span className="text-muted-foreground/50">Limite não definido</span>
  )}
</div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="label-uppercase text-muted-foreground mb-1">
              Gasto atual
            </p>

            <p
              className="text-xl font-medium tabular-nums"
              style={{ color: corGasto }}
            >
              {fmt(gastoAtual)}
            </p>

            {valorFixas > 0 && (
  <p className="text-[10px] text-muted-foreground mt-1">
    + Fixas e parcelas: {fmt(valorFixas)}
  </p>
)}

            <p className="text-[10px] text-muted-foreground mt-1">
              {limite > 0
                ? jaPassou
                  ? `${Math.round(pctReal)}% do limite · ${fmt(totalAtual - limite)} acima`
                  : `${Math.round(pctReal)}% do limite`
                : 'Limite não definido'}
            </p>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              overflow
                ? 'bg-[#A32D2D]/10 border-[#A32D2D]/30'
                : 'bg-secondary/50 border-border'
            }`}
          >
            <p className="label-uppercase text-muted-foreground mb-1">
              Projeção
            </p>

            <p
              className={`text-xl font-medium tabular-nums ${
                overflow ? 'text-[#E24B4A]' : 'text-muted-foreground'
              }`}
            >
              {fmt(projecaoComFixas)}
            </p>

            <p className="text-[10px] text-muted-foreground mt-1">
              {limite > 0
                ? overflow
                  ? `+${fmt(projecaoComFixas - limite)} acima do limite`
                  : `${fmt(limite - projecaoComFixas)} abaixo do limite`
                : <button onClick={handleAjustarLimiteClick} className="underline text-primary font-bold">Definir limite</button>}
            </p>
          </div>
        </div>

        {overflow && (
          <div className="p-3 rounded-lg bg-[#A32D2D]/10 border border-[#A32D2D]/30 flex items-center gap-2">
            <span className="text-[#E24B4A] text-sm">⚠</span>
            <p className="text-xs text-[#E24B4A]">
              No ritmo atual você vai ultrapassar o limite em{' '}
              <strong>{fmt(projecaoComFixas - limite)}</strong>
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar limite</DialogTitle>
            <DialogDescription>
              Defina o limite mensal usado para calcular o progresso e a projeção.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Limite mensal</label>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              min={1}
              step={50}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>

            <Button
              onClick={() => {
                const val = Number(inputValue);
                if (!Number.isNaN(val) && val > 0) {
                  onAjustarLimite?.(val);
                }
                setOpen(false);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}