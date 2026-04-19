'use client';

import { usePlano } from '@/hooks/use-plano';
import { useMembros } from '@/hooks/use-membros';

interface Props {
  usuarioAtivo: string;
  onChangeUsuario: (u: string) => void;
}

export function UsuarioSelector({ usuarioAtivo, onChangeUsuario }: Props) {
  const { perfisVisiveis, plano } = usePlano();
  const { carregando } = useMembros();

  if (carregando) return <div className="h-8 w-40 bg-secondary rounded-lg animate-pulse" />;
  if (perfisVisiveis.length === 0) return null;

  // Individual: badge fixo sem clique
  if (plano === 'individual') {
    const p = perfisVisiveis[0];
    if (!p) return null;
    return (
      <div className="flex gap-1.5">
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
          style={{ background: p.cor, color: '#000', borderColor: p.cor }}>
          {p.nome}
        </div>
      </div>
    );
  }

  // Casal: Geral + 2 individuais
  return (
    <div className="flex gap-1.5 flex-wrap">
      {perfisVisiveis.map(op => {
        const active = usuarioAtivo === op.role;
        const isSlot = op.role.startsWith('slot');
        return (
          <button key={op.role}
            onClick={() => !isSlot && onChangeUsuario(op.role)}
            disabled={isSlot}
            title={isSlot ? 'Aguardando convite ser aceito' : undefined}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed"
            style={active
              ? { background: op.cor, color: '#000', borderColor: op.cor }
              : { background: `${op.cor}18`, color: op.cor, borderColor: `${op.cor}40` }
            }>
            {op.nome}
          </button>
        );
      })}
    </div>
  );
}
