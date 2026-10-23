'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComprometimentoRendaCardProps {
  renda: number;
  custoFixo: number;
  parcelas: number;
  nomePerfil?: string;
}

export function ComprometimentoRendaCard({ renda, custoFixo, parcelas, nomePerfil }: ComprometimentoRendaCardProps) {
  const comprometido = custoFixo + parcelas;
  const livre = Math.max(renda - comprometido, 0);
  const rendaSafe = renda > 0 ? renda : 1;
  const pctComprometido = renda > 0 ? Math.min((comprometido / renda) * 100, 100) : 0;
  const estourou = comprometido > renda;

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  // Segmentos da barra única, na ordem em que aparecem visualmente
  const segmentos = [
    { nome: 'Custo Fixo', valor: custoFixo, cor: 'var(--magenta)' },
    { nome: 'Parcelas', valor: parcelas, cor: 'var(--indigo)' },
    { nome: 'Livre', valor: livre, cor: 'var(--teal)' },
  ].filter(s => s.valor > 0);

  const corHeadline = pctComprometido >= 90 ? '#E24B4A' : pctComprometido >= 70 ? '#EF9F27' : 'var(--teal)';

  return (
    <Card className="border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Comprometimento da Renda {nomePerfil ? `— ${nomePerfil}` : ''}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Renda do mês: <span className="font-semibold text-foreground">{fmt(renda)}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Headline */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums" style={{ color: corHeadline }}>
            {pctComprometido.toFixed(0)}%
          </span>
          <span className="text-xs text-muted-foreground">
            da renda já comprometida com fixos e parcelas
          </span>
        </div>

        {/* Barra única empilhada */}
        <div className="h-9 w-full rounded-xl overflow-hidden flex border border-border bg-secondary">
          {segmentos.map((s, i) => (
            <div
              key={i}
              className="h-full flex items-center justify-center transition-all duration-700"
              style={{ width: `${(s.valor / rendaSafe) * 100}%`, background: s.cor, minWidth: '2px' }}
              title={`${s.nome}: ${fmt(s.valor)}`}
            >
              {(s.valor / rendaSafe) * 100 >= 14 && (
                <span className="text-[10px] font-medium text-white tabular-nums px-1 truncate">
                  {Math.round((s.valor / rendaSafe) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>

        {estourou && (
          <p className="text-[11px] text-[#E24B4A]">
            Fixos + parcelas já passam da renda em {fmt(comprometido - renda)}.
          </p>
        )}

        {/* Legenda com valores */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--magenta)' }} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Custo Fixo</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{fmt(custoFixo)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--indigo)' }} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Parcelas</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{fmt(parcelas)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--teal)' }} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Livre</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{fmt(livre)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
