'use client';

import { useMembros } from '@/hooks/use-membros';

interface Props {
  usuarioAtivo: string;
  onChangeUsuario: (u: any) => void;
}

export function UsuarioSelector({ usuarioAtivo, onChangeUsuario }: Props) {
  const { membros, carregando, temGeral } = useMembros();

  if (carregando) return <div className="h-8 w-40 bg-secondary rounded-lg animate-pulse" />;

  // Montar lista de opções: Geral (se casal/família) + membros individuais
  const opcoes = [
    ...(temGeral ? [{ role: 'casal', nome: 'Geral', cor: '#ffa857', activeBg: '#ffa857' }] : []),
    ...membros.map(m => ({ role: m.role, nome: m.nome, cor: m.cor, activeBg: m.cor })),
  ];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {opcoes.map(op => {
        const active = usuarioAtivo === op.role;
        return (
          <button
            key={op.role}
            onClick={() => onChangeUsuario(op.role)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
            style={active
              ? { background: op.activeBg, color: '#000', borderColor: op.activeBg }
              : { background: `${op.cor}18`, color: op.cor, borderColor: `${op.cor}40` }
            }
          >
            {op.nome}
          </button>
        );
      })}
    </div>
  );
}
