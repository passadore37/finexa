'use client';

import { PERFIL_CONFIG, type Perfil } from '@/lib/perfil-config';

interface Props {
  usuarioAtivo: Perfil;
  onChangeUsuario: (u: Perfil) => void;
}

const CORES: Record<Perfil, { bg: string; text: string; activeBg: string; activeText: string }> = {
  casal:    { bg: 'rgba(255,168,87,0.1)',   text: '#ffa857', activeBg: '#ffa857', activeText: '#000' },
  leticia:  { bg: 'rgba(130,161,253,0.1)',  text: '#82a1fd', activeBg: '#82a1fd', activeText: '#000' },
  giovanna: { bg: 'rgba(255,100,202,0.1)',  text: '#ff64ca', activeBg: '#ff64ca', activeText: '#000' },
};

export function UsuarioSelector({ usuarioAtivo, onChangeUsuario }: Props) {
  return (
    <div className="flex gap-1.5">
      {(['casal', 'leticia', 'giovanna'] as Perfil[]).map(p => {
        const config = PERFIL_CONFIG[p];
        const cor = CORES[p];
        const active = usuarioAtivo === p;
        return (
          <button
            key={p}
            onClick={() => onChangeUsuario(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
            style={active
              ? { background: cor.activeBg, color: cor.activeText, borderColor: cor.activeBg }
              : { background: cor.bg, color: cor.text, borderColor: `${cor.text}40` }
            }
          >
            {config.nome}
          </button>
        );
      })}
    </div>
  );
}
