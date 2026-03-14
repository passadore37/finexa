'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Settings } from 'lucide-react';
import { useState } from 'react';
import type { Alerta } from '@/lib/types';

interface AlertasPanelProps {
  alertas: Alerta[];
  gastoAtual?: number;
  limite?: number;
  projecao?: number;
  despesasPorCategoria?: Array<{ categoria: string; valor: number; percentual: number }>;
}

// Triggers configuráveis
const TRIGGERS_PADRAO = [
  { id: 'limite-90', label: 'Alerta ao atingir 90% do limite', ativo: true },
  { id: 'limite-70', label: 'Aviso ao atingir 70% do limite', ativo: true },
  { id: 'projecao-estouro', label: 'Projeção ultrapassa o limite', ativo: true },
  { id: 'categoria-30', label: 'Categoria com mais de 30% dos gastos', ativo: true },
  { id: 'aumento-20', label: 'Aumento de despesas > 20% vs mês anterior', ativo: true },
  { id: 'parcelas-30', label: 'Parcelas comprometem > 30% do limite', ativo: true },
  { id: 'parcela-termina', label: 'Parcelada termina no próximo mês', ativo: true },
];

const iconePorTipo = {
  critico: AlertTriangle,
  atencao: AlertCircle,
  info: Info,
  sucesso: CheckCircle,
};

const coresPorTipo = {
  critico: { bg: 'bg-[#A32D2D]/10', border: 'border-[#A32D2D]/30', icon: 'text-[#E24B4A]', text: 'text-[#E24B4A]', dot: 'bg-[#E24B4A]' },
  atencao: { bg: 'bg-[#854F0B]/10', border: 'border-[#854F0B]/30', icon: 'text-[#EF9F27]', text: 'text-[#EF9F27]', dot: 'bg-[#EF9F27]' },
  info: { bg: 'bg-primary/10', border: 'border-primary/30', icon: 'text-primary', text: 'text-primary', dot: 'bg-primary' },
  sucesso: { bg: 'bg-[#3B6D11]/10', border: 'border-[#3B6D11]/30', icon: 'text-[#3B6D11]', text: 'text-[#3B6D11]', dot: 'bg-[#3B6D11]' },
};

export function AlertasPanel({ alertas }: AlertasPanelProps) {
  const [configurando, setConfigurando] = useState(false);
  const [triggers, setTriggers] = useState(TRIGGERS_PADRAO);

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t));
  };

  const alertasOrdenados = [...alertas].sort((a, b) => {
    const ordem = { critico: 0, atencao: 1, info: 2, sucesso: 3 };
    return ordem[a.tipo] - ordem[b.tipo];
  });

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground">Alertas</CardTitle>
          <div className="flex items-center gap-2">
            {alertas.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {alertas.length} {alertas.length === 1 ? 'alerta' : 'alertas'}
              </span>
            )}
            <button
              onClick={() => setConfigurando(!configurando)}
              className="p-1 rounded-md hover:bg-secondary transition-colors"
              title="Configurar alertas"
            >
              <Settings className={cn('h-3.5 w-3.5', configurando ? 'text-primary' : 'text-muted-foreground')} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Painel de configuração */}
        {configurando && (
          <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2 mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Triggers ativos</p>
            {triggers.map(trigger => (
              <div key={trigger.id} className="flex items-center justify-between gap-3">
                <span className="text-xs text-foreground">{trigger.label}</span>
                <button
                  onClick={() => toggleTrigger(trigger.id)}
                  className={cn(
                    'w-8 h-4 rounded-full transition-colors flex-shrink-0 relative',
                    trigger.ativo ? 'bg-primary' : 'bg-secondary border border-border'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all',
                    trigger.ativo ? 'left-4' : 'left-0.5'
                  )} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Lista de alertas */}
        {alertas.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#3B6D11]/10 border border-[#3B6D11]/30">
            <CheckCircle className="h-5 w-5 text-[#3B6D11] flex-shrink-0" />
            <p className="text-sm text-foreground">Tudo em ordem! Nenhum alerta no momento.</p>
          </div>
        ) : (
          alertasOrdenados.slice(0, 5).map((alerta) => {
            const Icone = iconePorTipo[alerta.tipo];
            const cores = coresPorTipo[alerta.tipo];
            const isPulsing = alerta.tipo === 'critico' || alerta.tipo === 'atencao';
            return (
              <div key={alerta.id} className={cn('flex items-start gap-3 p-3 rounded-lg border', cores.bg, cores.border)}>
                <div className="relative flex-shrink-0">
                  <Icone className={cn('h-4 w-4 mt-0.5', cores.icon)} />
                  {isPulsing && <span className={cn('absolute -top-1 -right-1 h-2 w-2 rounded-full pulse-dot', cores.dot)} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alerta.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alerta.mensagem}</p>
                  {alerta.acao && <p className={cn('text-xs font-medium mt-2', cores.text)}>{alerta.acao}</p>}
                </div>
              </div>
            );
          })
        )}
        {alertas.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
            +{alertas.length - 5} alertas adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
}
