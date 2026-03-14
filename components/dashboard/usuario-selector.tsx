'use client';

import { PERFIL_CONFIG, type Perfil } from '@/lib/perfil-config';

interface Props {
  usuarioAtivo: Perfil;
  onChangeUsuario: (u: Perfil) => void;
}

const opcoes: Perfil[] = ['casal', 'leticia', 'giovanna'];

export function UsuarioSelector({ usuarioAtivo, onChangeUsuario }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-secondary border border-border">
      {opcoes.map(op => {
        const config = PERFIL_CONFIG[op];
        const active = usuarioAtivo === op;
        return (
          <button
            key={op}
            onClick={() => onChangeUsuario(op)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              active ? 'text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={active ? { background: config.cor } : {}}
          >
            {config.nome}
          </button>
        );
      })}
    </div>
  );
}
