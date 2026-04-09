// components/plano-guard.tsx — bloqueia features não disponíveis no plano
'use client';

import { usePlano, PlanoAtivo } from '@/hooks/use-plano';
import { Lock } from 'lucide-react';

interface Props {
  requer: 'casal' | 'familia';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ORDEM: PlanoAtivo[] = ['individual', 'casal', 'familia'];

export function PlanoGuard({ requer, children, fallback }: Props) {
  const { plano } = usePlano();
  const temAcesso = ORDEM.indexOf(plano) >= ORDEM.indexOf(requer);

  if (temAcesso) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-bold text-foreground">
        Disponível no plano {requer === 'casal' ? 'Casal' : 'Família'}
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Faça upgrade para acessar esta funcionalidade.
      </p>
      <a href="/plano" className="text-xs font-bold text-primary hover:underline">
        Ver planos →
      </a>
    </div>
  );
}
