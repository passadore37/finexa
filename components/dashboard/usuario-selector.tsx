'use client';

import { useMembros } from '@/hooks/use-membros';
import { useAuth } from '@/hooks/use-auth';

interface Props {
  usuarioAtivo: string;
  onChangeUsuario: (u: string) => void;
}

export function UsuarioSelector({ usuarioAtivo, onChangeUsuario }: Props) {
  const { membros, carregando } = useMembros();
  const { perfil } = useAuth();
  const plano = perfil?.plano ?? 'casal';

  if (carregando) return <div className="h-8 w-40 bg-secondary rounded-lg animate-pulse" />;

  // Individual: só o próprio perfil
  if (plano === 'individual') {
    const eu = membros[0];
    if (!eu) return null;
    return (
      <div className="flex gap-1.5">
        <button onClick={() => onChangeUsuario(eu.role)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
          style={{ background: eu.cor, color: '#000', borderColor: eu.cor }}>
          {eu.nome}
        </button>
      </div>
    );
  }

  // Casal/Família: Geral + membros reais do banco
  const opcoes = [
    { role: 'casal', nome: 'Geral', cor: '#ffa857' },
    ...membros.map(m => ({ role: m.role, nome: m.nome, cor: m.cor })),
  ];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {opcoes.map(op => {
        const active = usuarioAtivo === op.role;
        return (
          <button key={op.role} onClick={() => onChangeUsuario(op.role)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
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
