'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface Props {
  perfilAtivo: string;        // perfil de quem está criando
  membros: Array<{ id: string; nome: string; cor: string }>;
  onCriar: (nome: string, cor: string, perfis: string[], criada_por: string) => Promise<{ ok: boolean; erro?: string }>;
  onFechar: () => void;
}

const CORES_SUGERIDAS = [
  '#D4537E','#378ADD','#EF9F27','#1D9E75','#7F77DD',
  '#E24B4A','#C4843E','#4A90A4','#A85D32','#2D6B9A',
  '#5330ff','#ff64ca','#01b695','#ffa857','#854F0B',
];

export function ModalNovaCategoria({ perfilAtivo, membros, onCriar, onFechar }: Props) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#7F77DD');
  // Por padrão: visível para todos (vazio = todos)
  const [escopo, setEscopo] = useState<'todos' | 'especifico'>('todos');
  const [perfisSelecionados, setPerfisSelecionados] = useState<string[]>([perfilAtivo === 'casal' ? membros[0]?.id || '' : perfilAtivo]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  function togglePerfil(id: string) {
    setPerfisSelecionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleCriar() {
    if (!nome.trim()) { setErro('Digite um nome para a categoria'); return; }
    setSalvando(true);
    setErro('');

    const perfis = escopo === 'todos' ? [] : perfisSelecionados;
    const result = await onCriar(nome.trim(), cor, perfis, perfilAtivo);

    if (result.ok) {
      onFechar();
    } else {
      setErro(result.erro === 'Categoria já existe' ? 'Já existe uma categoria com esse nome' : 'Erro ao criar — tente novamente');
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Nova Categoria</h3>
          <button onClick={onFechar} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Nome */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Nome</label>
          <input
            type="text" placeholder="Ex: Academia, Pet, Viagem..."
            value={nome} onChange={e => { setNome(e.target.value); setErro(''); }}
            autoFocus maxLength={30}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Cor */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Cor</label>
          <div className="flex flex-wrap gap-2">
            {CORES_SUGERIDAS.map(c => (
              <button key={c} onClick={() => setCor(c)}
                className="w-7 h-7 rounded-full transition-all border-2"
                style={{
                  background: c,
                  borderColor: cor === c ? 'white' : 'transparent',
                  boxShadow: cor === c ? `0 0 0 2px ${c}` : 'none',
                  transform: cor === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {/* Preview */}
          <div className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border"
            style={{ background: `${cor}18`, color: cor, borderColor: `${cor}44` }}>
            {nome || 'Prévia'}
          </div>
        </div>

        {/* Visibilidade na aba Lançar */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
            Visível na aba Lançar para
          </label>
          <div className="flex gap-2">
            {[
              { id: 'todos',     label: 'Todos os membros' },
              { id: 'especifico', label: 'Membros específicos' },
            ].map(op => (
              <button key={op.id}
                onClick={() => setEscopo(op.id as 'todos' | 'especifico')}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={escopo === op.id
                  ? { background: cor, color: 'white', borderColor: cor }
                  : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                }
              >{op.label}</button>
            ))}
          </div>

          {escopo === 'especifico' && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {membros.map(m => {
                const sel = perfisSelecionados.includes(m.id);
                return (
                  <button key={m.id} onClick={() => togglePerfil(m.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                    style={sel
                      ? { background: m.cor, color: 'white', borderColor: m.cor }
                      : { background: `${m.cor}15`, color: m.cor, borderColor: `${m.cor}40` }
                    }
                  >
                    {sel && <Check className="h-3 w-3" />}
                    {m.nome}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
            {escopo === 'todos'
              ? '📊 Aparece para todos na aba Lançar e nos gráficos'
              : perfisSelecionados.length === 0
              ? '⚠️ Selecione ao menos um membro'
              : `👤 Aparece só para ${perfisSelecionados.map(id => membros.find(m => m.id === id)?.nome ?? id).join(' e ')} na aba Lançar. Nos gráficos aparece para todos.`
            }
          </p>
        </div>

        {/* Erro */}
        {erro && <p className="text-xs text-[#E24B4A]">{erro}</p>}

        {/* Botões */}
        <div className="flex gap-2 pt-1">
          <button onClick={onFechar}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handleCriar}
            disabled={salvando || !nome.trim() || (escopo === 'especifico' && perfisSelecionados.length === 0)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            style={{ background: cor }}
          >
            {salvando ? <><Loader2 className="h-4 w-4 animate-spin" />Criando...</> : 'Criar categoria'}
          </button>
        </div>
      </div>
    </div>
  );
}
