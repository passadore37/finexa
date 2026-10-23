'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCorCategoria } from '@/lib/types';
import { calcularValorParMembro, transacaoVisivel } from '@/lib/perfil-config';
import type { Transacao } from '@/lib/types';

interface HistoricoMesProps {
  transacoes: Transacao[];
  mes: number;
  ano: number;
  perfil?: 'membro0' | 'membro1'; // undefined = visão casal/geral (mostra tudo)
  salarioMembro0: number;
  salarioMembro1: number;
  nomePerfil?: string;
}

const MESES_NOME = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export function HistoricoMes({ transacoes, mes, ano, perfil, salarioMembro0, salarioMembro1, nomePerfil }: HistoricoMesProps) {
  const [aberto, setAberto] = useState(false);
  const salarios = { membro0: salarioMembro0, membro1: salarioMembro1 };

  const itens = useMemo(() => {
    return transacoes
      .filter(t => t.tipo === 'despesa')
      .filter(t => {
        const d = t.data instanceof Date ? t.data : new Date(t.data);
        return d.getMonth() === mes && d.getFullYear() === ano;
      })
      .filter(t => {
        if (!perfil) return true;
        return transacaoVisivel(
          { valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente, totalParcelas: t.totalParcelas },
          perfil, salarios
        );
      })
      .map(t => ({
        ...t,
        valorExibido: perfil
          ? calcularValorParMembro({ valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente }, perfil, salarios)
          : t.valor,
      }))
      .sort((a, b) => {
        const da = a.data instanceof Date ? a.data : new Date(a.data);
        const db = b.data instanceof Date ? b.data : new Date(b.data);
        return db.getTime() - da.getTime();
      });
  }, [transacoes, mes, ano, perfil, salarioMembro0, salarioMembro1]);

  const total = itens.reduce((acc, t) => acc + t.valorExibido, 0);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtData = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Card className="border bg-card">
      <button
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          Ver lançamentos de {MESES_NOME[mes]}
          {nomePerfil ? ` — ${nomePerfil}` : ''}
          <span className="text-xs text-muted-foreground font-normal">
            ({itens.length} {itens.length === 1 ? 'gasto' : 'gastos'})
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(total)}</span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', aberto && 'rotate-180')} />
        </span>
      </button>

      {aberto && (
        <CardContent className="pt-0 pb-4">
          {itens.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum gasto lançado em {MESES_NOME[mes]} ainda.
            </p>
          ) : (
            <div className="border-t border-border -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 max-h-[420px] overflow-y-auto divide-y divide-border">
              {itens.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: getCorCategoria(t.categoria) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{t.descricao || t.categoria}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtData(t.data)} · {t.categoria}
                      {t.totalParcelas && t.totalParcelas > 1 ? ` · ${t.parcelaAtual}/${t.totalParcelas}` : ''}
                      {t.divisao === '50/50' ? ' · 50/50' : ''}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground shrink-0">
                    {fmt(t.valorExibido)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
