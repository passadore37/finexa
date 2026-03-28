'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { CATEGORIAS_DISPONIVEIS } from '@/lib/types';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { PERFIL_CONFIG } from '@/lib/perfil-config';

type Status = 'idle' | 'saving' | 'success' | 'error';

const DIVISAO_OPCOES = [
  { id: 'pessoal', label: 'Só meu', valor: 'pessoal' },
  { id: '50/50', label: '50 / 50', valor: '50/50' },
];

const CORES_CAT: Record<string, string> = {
  'Alimentação': '#D4537E', 'Transporte': '#378ADD', 'Lazer': '#EF9F27',
  'Casa': '#1D9E75', 'Assinaturas': '#7F77DD', 'Saúde': '#E24B4A',
  'Gatos': '#C4843E', 'Moradia': '#4A90A4', 'Compras': '#A85D32',
  'Educação': '#2D6B9A', 'Energia': '#854F0B', 'Gás': '#5A7A52', 'Outros': '#666666',
};

export function LancarView() {
  const { usuariaAtiva } = useUsuarioContext();
  const perfilConfig = PERFIL_CONFIG[usuariaAtiva];

  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [divisao, setDivisao] = useState('50/50');
  const [responsavel, setResponsavel] = useState<'leticia' | 'giovanna'>('leticia');
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState('2');
  const [parcelaAtual, setParcelaAtual] = useState('1');
  const [status, setStatus] = useState<Status>('idle');
  const [mostrarAvancado, setMostrarAvancado] = useState(false);

  const perfil = divisao === 'pessoal'
    ? (usuariaAtiva === 'casal' ? responsavel : usuariaAtiva)
    : (usuariaAtiva === 'casal' ? 'casal' : usuariaAtiva);

  async function handleSubmit() {
    if (!valor || !categoria) return;
    setStatus('saving');

    try {
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(valor.replace(',', '.')),
          categoria,
          descricao: descricao || categoria,
          perfil,
          divisao,
          parcela_atual: parcelado ? parseInt(parcelaAtual) : 1,
          total_parcelas: parcelado ? parseInt(totalParcelas) : 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
        setTimeout(() => {
          setStatus('idle');
          setValor('');
          setCategoria('');
          setDescricao('');
          setDivisao('50/50');
          setResponsavel('leticia');
          setParcelado(false);
          setTotalParcelas('2');
          setParcelaAtual('1');
        }, 1500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${perfilConfig.cor}22` }}>
          <Check className="h-8 w-8" style={{ color: perfilConfig.cor }} />
        </div>
        <p className="text-xl font-medium text-foreground">Lançado!</p>
        <p className="text-sm text-muted-foreground mt-1">R$ {valor} em {categoria}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Novo lançamento</p>
        <h2 className="text-xl font-medium text-foreground">
          {perfilConfig.emoji} {usuariaAtiva === 'casal' ? 'Lançar gasto' : `${perfilConfig.nome}, qual foi o gasto?`}
        </h2>
      </div>

      {/* Valor */}
      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Valor</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={e => setValor(e.target.value)}
            autoFocus
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-4 text-2xl font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': perfilConfig.cor } as any}
          />
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Categoria</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_DISPONIVEIS.map(cat => {
            const cor = CORES_CAT[cat] || '#666';
            const selected = categoria === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border"
                style={selected
                  ? { background: cor, color: 'white', borderColor: cor }
                  : { background: `${cor}18`, color: cor, borderColor: `${cor}44` }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divisão */}
      <div>
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Divisão</label>
        <div className="flex gap-2">
          {DIVISAO_OPCOES.map(op => (
            <button
              key={op.id}
              onClick={() => setDivisao(op.valor)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border"
              style={divisao === op.valor
                ? { background: perfilConfig.cor, color: 'white', borderColor: perfilConfig.cor }
                : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'rgba(255,255,255,0.06)' }
              }
            >
              {op.label}
            </button>
          ))}
        </div>

        {divisao === 'pessoal' && usuariaAtiva === 'casal' && (
          <div className="mt-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Responsável</p>
            <div className="flex gap-2">
              {(['leticia', 'giovanna'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setResponsavel(p)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border"
                  style={responsavel === p
                    ? { background: perfilConfig.cor, color: 'white', borderColor: perfilConfig.cor }
                    : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'rgba(255,255,255,0.06)' }
                  }
                >
                  {p === 'leticia' ? 'Letícia' : 'Giovanna'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avançado (Descrição + Parcelamento) */}
      <div>
        <button
          onClick={() => setMostrarAvancado(!mostrarAvancado)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {mostrarAvancado ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Opções avançadas
        </button>

        {mostrarAvancado && (
          <div className="mt-3 space-y-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Descrição (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Supermercado Extra"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Parcelado?</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setParcelado(!parcelado)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${parcelado ? 'bg-primary' : 'bg-secondary border border-border'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${parcelado ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-muted-foreground">{parcelado ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            {parcelado && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Parcela atual</label>
                  <input
                    type="number"
                    min="1"
                    value={parcelaAtual}
                    onChange={e => setParcelaAtual(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Total de parcelas</label>
                  <input
                    type="number"
                    min="2"
                    value={totalParcelas}
                    onChange={e => setTotalParcelas(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão confirmar */}
      <button
        onClick={handleSubmit}
        disabled={!valor || !categoria || status === 'saving'}
        className="w-full py-4 rounded-xl text-white font-medium text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: (!valor || !categoria) ? '#333' : perfilConfig.cor }}
      >
        {status === 'saving' ? (
          <><Loader2 className="h-5 w-5 animate-spin" />Salvando...</>
        ) : status === 'error' ? (
          'Erro — tente novamente'
        ) : (
          `Confirmar R$ ${valor || '0'} em ${categoria || '...'}`
        )}
      </button>
    </div>
  );
}
