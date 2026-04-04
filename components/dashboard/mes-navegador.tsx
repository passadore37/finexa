'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MesNavegadorProps {
  mes: number;
  ano: number;
  onChange: (mes: number, ano: number) => void;
  mesComDados?: string[]; // lista de "MM-YYYY" com dados
}

const MESES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function MesNavegador({ mes, ano, onChange }: MesNavegadorProps) {
  const hoje = new Date();
  const ehMesAtual = mes === hoje.getMonth() && ano === hoje.getFullYear();

  function anterior() {
    if (mes === 0) onChange(11, ano - 1);
    else onChange(mes - 1, ano);
  }

  function proximo() {
    if (ehMesAtual) return; // não vai além do mês atual
    if (mes === 11) onChange(0, ano + 1);
    else onChange(mes + 1, ano);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={anterior}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 min-w-[160px] justify-center">
        <span className="text-sm font-black text-foreground tracking-tight">
          {MESES_NOMES[mes]} {ano}
        </span>
        {ehMesAtual && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: 'var(--indigo)', color: '#fff' }}>
            atual
          </span>
        )}
      </div>

      <button
        onClick={proximo}
        disabled={ehMesAtual}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        title={ehMesAtual ? 'Mês atual' : 'Próximo mês'}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
