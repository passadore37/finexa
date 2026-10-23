'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';

interface ComprometimentoRendaCardProps {
  renda: number;
  custoFixo: number;
  parcelas: number;
  nomePerfil?: string;
}

const chartConfig = {
  valor: { label: 'Valor' },
} satisfies ChartConfig;

export function ComprometimentoRendaCard({ renda, custoFixo, parcelas, nomePerfil }: ComprometimentoRendaCardProps) {
  const comprometido = custoFixo + parcelas;
  const livre = Math.max(renda - comprometido, 0);
  const pctComprometido = renda > 0 ? (comprometido / renda) * 100 : 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const dados = [
    { nome: 'Custo Fixo', valor: custoFixo, cor: 'var(--magenta)' },
    { nome: 'Parcelas', valor: parcelas, cor: 'var(--indigo)' },
    { nome: 'Livre', valor: livre, cor: 'var(--teal)' },
  ];

  const corPct = pctComprometido >= 70 ? 'var(--magenta)' : pctComprometido >= 40 ? 'var(--primary)' : 'var(--teal)';

  return (
    <Card className="border bg-card card-hover">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Comprometimento da Renda {nomePerfil ? `— ${nomePerfil}` : ''}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold" style={{ color: corPct }}>{pctComprometido.toFixed(0)}%</span> da renda
          ({fmt(renda)}) já está comprometida com fixos e parcelas
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={dados} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={fmt} tickLine={false} axisLine={false} fontSize={11} />
            <YAxis type="category" dataKey="nome" tickLine={false} axisLine={false} fontSize={12} width={80} />
            <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} />} />
            <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={28}>
              {dados.map((d, i) => <Cell key={i} fill={d.cor} />)}
              <LabelList dataKey="valor" position="right" formatter={(v: number) => fmt(v)} fontSize={11} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
