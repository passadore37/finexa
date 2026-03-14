'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertaTrigger } from '@/lib/types';

interface AlertasConfigProps {
  triggers: AlertaTrigger[];
  onSave: (triggers: AlertaTrigger[]) => void;
}

const TIPOS_ALERTA = [
  { id: 'limite_excedido', label: 'Limite Excedido', descricao: 'Quando gasto ultrapassa o limite mensal' },
  { id: 'categoria_limite', label: 'Limite de Categoria', descricao: 'Quando uma categoria excede seu limite' },
  { id: 'saldo_baixo', label: 'Saldo Baixo', descricao: 'Quando o saldo fica abaixo de um valor' },
  { id: 'meta_atingida', label: 'Meta Atingida', descricao: 'Quando a meta de poupança é atingida' },
  { id: 'gasto_alto', label: 'Gasto Alto', descricao: 'Quando há um gasto acima do normal' },
];

export function AlertasConfig({ triggers, onSave }: AlertasConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localTriggers, setLocalTriggers] = useState<AlertaTrigger[]>(triggers);

  const handleToggle = (id: string) => {
    setLocalTriggers(prev =>
      prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t)
    );
  };

  const handleParametro = (id: string, valor: number) => {
    setLocalTriggers(prev =>
      prev.map(t => t.id === id ? { ...t, parametro: valor } : t)
    );
  };

  const handleRemove = (id: string) => {
    setLocalTriggers(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTrigger = (tipo: string) => {
    const tipoInfo = TIPOS_ALERTA.find(t => t.id === tipo);
    if (tipoInfo && !localTriggers.find(t => t.id === tipo)) {
      setLocalTriggers(prev => [...prev, {
        id: tipo,
        tipo: tipo as any,
        ativo: true,
        parametro: 80,
        descricao: tipoInfo.descricao,
      }]);
    }
  };

  const handleSave = () => {
    onSave(localTriggers);
    setIsOpen(false);
  };

  const triggerIds = localTriggers.map(t => t.id);
  const availableTriggers = TIPOS_ALERTA.filter(t => !triggerIds.includes(t.id));

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Configurar Alertas
      </Button>

      {isOpen && (
        <Card className="border border-border bg-card mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuração de Alertas</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Personalize quais alertas você deseja receber
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alertas ativos */}
            {localTriggers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground label-uppercase">Alertas Ativos</p>
                {localTriggers.map(trigger => {
                  const tipoInfo = TIPOS_ALERTA.find(t => t.id === trigger.tipo);
                  return (
                    <div key={trigger.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <Switch
                        checked={trigger.ativo}
                        onCheckedChange={() => handleToggle(trigger.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{tipoInfo?.label}</p>
                        <p className="text-xs text-muted-foreground">{tipoInfo?.descricao}</p>
                        {trigger.tipo !== 'meta_atingida' && (
                          <div className="flex items-center gap-2 mt-2">
                            <label className="text-xs text-muted-foreground">Parâmetro:</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={trigger.parametro || 80}
                              onChange={(e) => handleParametro(trigger.id, parseInt(e.target.value))}
                              className="w-16 bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(trigger.id)}
                        className="text-muted-foreground hover:text-[#E24B4A] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Adicionar novo alerta */}
            {availableTriggers.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground label-uppercase">Adicionar Alerta</p>
                <div className="grid grid-cols-1 gap-2">
                  {availableTriggers.map(tipo => (
                    <button
                      key={tipo.id}
                      onClick={() => handleAddTrigger(tipo.id)}
                      className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Plus className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">{tipo.label}</p>
                        <p className="text-[10px] text-muted-foreground">{tipo.descricao}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1"
              >
                Salvar Configurações
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
